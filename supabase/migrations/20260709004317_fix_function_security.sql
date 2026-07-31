/*
# Fix Function Security Issues

## Changes

### 1. Immutable search_path on perform_transfer
Recreates `public.perform_transfer` with `SET search_path = ''` so the
function always resolves objects against a fixed, empty search path. All
table references are updated to use the fully-qualified `public.` prefix,
eliminating the risk of search-path injection.

### 2. Immutable search_path on generate_account_number
Same fix applied to `public.generate_account_number`. The sequence
reference is updated to `public.account_number_seq`.

### 3. Revoke direct execution of perform_transfer
`perform_transfer` is a SECURITY DEFINER function that runs with elevated
privileges. It is only meant to be called by the edge function via the
service-role key, never directly through the REST API by anon or
authenticated clients. Revoking PUBLIC (which covers both anon and
authenticated) and then granting only to postgres and service_role closes
the exposure via `/rest/v1/rpc/perform_transfer`.

### 4. Enable leaked-password (HIBP) protection
Merges `"hibp_enabled": true` into the GoTrue `auth.instances.raw_base_config`
JSON blob. Supabase Auth reads this at startup to activate the
HaveIBeenPwned check on every password sign-in / sign-up attempt.
Uses jsonb merge (`||`) so no other existing config values are overwritten,
and is safe to re-run (idempotent via `||` upsert semantics).

## Security Notes
- Only `postgres` and `service_role` can now call `perform_transfer` directly.
- The edge function authenticates with the service-role key, so its call
  path is unaffected.
- `generate_account_number` retains its default PUBLIC grant because it
  is called by the `insert_own_accounts` RLS path from authenticated clients
  via the banking-api edge function; its search_path is now fixed.
*/

-- ────────────────────────────────────────────────────────────────────────────
-- 1 & 3: Recreate perform_transfer with fixed search_path + revoke public
-- ────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.perform_transfer(
  p_source_account_id uuid,
  p_destination_account_id uuid,
  p_amount numeric,
  p_initiated_by uuid,
  p_idempotency_key text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_source public.accounts%ROWTYPE;
  v_dest   public.accounts%ROWTYPE;
  v_transaction_id uuid;
BEGIN
  -- Idempotency: return existing tx if same key already processed
  IF p_idempotency_key IS NOT NULL THEN
    SELECT id INTO v_transaction_id
      FROM public.transactions
     WHERE idempotency_key = p_idempotency_key
       AND status = 'completed';
    IF FOUND THEN
      RETURN v_transaction_id;
    END IF;
  END IF;

  -- Validate amount
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'INVALID_AMOUNT: Amount must be greater than zero';
  END IF;

  -- Validate distinct accounts
  IF p_source_account_id = p_destination_account_id THEN
    RAISE EXCEPTION 'SAME_ACCOUNT: Source and destination must differ';
  END IF;

  -- Acquire exclusive locks in consistent order (smaller UUID first) to prevent deadlocks
  IF p_source_account_id < p_destination_account_id THEN
    SELECT * INTO v_source FROM public.accounts WHERE id = p_source_account_id FOR UPDATE;
    SELECT * INTO v_dest   FROM public.accounts WHERE id = p_destination_account_id FOR UPDATE;
  ELSE
    SELECT * INTO v_dest   FROM public.accounts WHERE id = p_destination_account_id FOR UPDATE;
    SELECT * INTO v_source FROM public.accounts WHERE id = p_source_account_id FOR UPDATE;
  END IF;

  -- Validate accounts exist
  IF v_source.id IS NULL THEN
    RAISE EXCEPTION 'SOURCE_NOT_FOUND: Source account does not exist';
  END IF;
  IF v_dest.id IS NULL THEN
    RAISE EXCEPTION 'DEST_NOT_FOUND: Destination account does not exist';
  END IF;

  -- Validate account statuses
  IF v_source.status = 'frozen' THEN
    RAISE EXCEPTION 'SOURCE_FROZEN: Source account is frozen';
  END IF;
  IF v_dest.status = 'frozen' THEN
    RAISE EXCEPTION 'DEST_FROZEN: Destination account is frozen';
  END IF;

  -- Validate sufficient funds
  IF v_source.balance < p_amount THEN
    RAISE EXCEPTION 'INSUFFICIENT_FUNDS: Balance %.2f insufficient for transfer of %.2f',
      v_source.balance, p_amount;
  END IF;

  -- Atomic debit + credit
  UPDATE public.accounts SET balance = balance - p_amount WHERE id = p_source_account_id;
  UPDATE public.accounts SET balance = balance + p_amount WHERE id = p_destination_account_id;

  -- Record the transaction
  INSERT INTO public.transactions
    (source_account_id, destination_account_id, amount, status, initiated_by, idempotency_key)
  VALUES
    (p_source_account_id, p_destination_account_id, p_amount, 'completed', p_initiated_by, p_idempotency_key)
  RETURNING id INTO v_transaction_id;

  RETURN v_transaction_id;
END;
$$;

-- Revoke from PUBLIC (covers anon + authenticated) then grant only to
-- the roles that legitimately need it.
REVOKE EXECUTE ON FUNCTION public.perform_transfer(
  uuid, uuid, numeric, uuid, text
) FROM PUBLIC;

REVOKE EXECUTE ON FUNCTION public.perform_transfer(
  uuid, uuid, numeric, uuid, text
) FROM anon;

REVOKE EXECUTE ON FUNCTION public.perform_transfer(
  uuid, uuid, numeric, uuid, text
) FROM authenticated;

GRANT EXECUTE ON FUNCTION public.perform_transfer(
  uuid, uuid, numeric, uuid, text
) TO postgres;

GRANT EXECUTE ON FUNCTION public.perform_transfer(
  uuid, uuid, numeric, uuid, text
) TO service_role;

-- ────────────────────────────────────────────────────────────────────────────
-- 2: Recreate generate_account_number with fixed search_path
-- ────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.generate_account_number()
RETURNS text
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  RETURN 'FT-' || LPAD(nextval('public.account_number_seq')::text, 7, '0');
END;
$$;

-- ────────────────────────────────────────────────────────────────────────────
-- 4: Enable leaked-password (HIBP) protection
-- Uses jsonb || merge so existing config keys are preserved.
-- ────────────────────────────────────────────────────────────────────────────
UPDATE auth.instances
SET
  raw_base_config = (
    COALESCE(raw_base_config::jsonb, '{}'::jsonb)
    || '{"hibp_enabled": true}'::jsonb
  )::text,
  updated_at = now()
WHERE raw_base_config IS NOT NULL
   OR EXISTS (SELECT 1 FROM auth.instances);
