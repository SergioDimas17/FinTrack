/*
# Numeric account numbers + password reset support

## Changes

### 1. Pure-numeric account numbers
The `generate_account_number()` function previously produced `FT-1000001`
(a string with a `FT-` prefix). The product now requires account numbers
to be pure numeric — they serve as the user-facing account identifier
that customers enter to direct a transfer.

This migration:
  a) Rewrites `generate_account_number()` to return a 10-digit numeric
     string (zero-padded), e.g. `1000000001`. The existing sequence is
     reused so numbering stays continuous.
  b) Strips the `FT-` prefix from every existing row in `accounts` so
     all account numbers become pure numeric. The UNIQUE constraint is
     preserved because the stripped values remain distinct.

### 2. (No schema change for password reset)
Password reset is handled entirely through Supabase Auth's built-in
`recover` flow (email link -> /reset-password route -> updatePassword).
No table changes are required; this is noted here for completeness.
*/

-- ────────────────────────────────────────────────────────────────────────────
-- 1a. Strip FT- prefix from existing account numbers (idempotent)
-- ────────────────────────────────────────────────────────────────────────────
UPDATE public.accounts
   SET account_number = REPLACE(account_number, 'FT-', '')
 WHERE account_number LIKE 'FT-%';

-- ────────────────────────────────────────────────────────────────────────────
-- 1b. Rewrite generator to return a pure 10-digit numeric string.
--     The sequence value is zero-padded to 10 digits so the result is
--     always a fixed-width numeric string (e.g. 1000000001).
-- ────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.generate_account_number()
RETURNS text
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  RETURN LPAD(nextval('public.account_number_seq')::text, 10, '0');
END;
$$;
