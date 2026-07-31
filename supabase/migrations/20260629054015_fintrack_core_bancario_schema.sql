
/*
# FinTrack Core Bancario MVP - Initial Schema

## Overview
Full schema for the banking micro-transfers and reconciliation system.

## New Tables

### 1. accounts
Core banking account entity. Each authenticated user can own one or more accounts.
- `id` (uuid, PK) — internal account identifier
- `account_number` (text, UNIQUE) — human-readable 10-digit account number (e.g. FT-0000001)
- `holder_name` (text) — display name of the account holder
- `balance` (numeric 20,2) — current balance, minimum 0
- `status` (text) — 'active' | 'frozen'; frozen accounts cannot send/receive transfers
- `user_id` (uuid, FK auth.users) — owner; defaults to auth.uid()
- `created_at` (timestamptz)

### 2. transactions
Immutable ledger of all transfer operations between accounts.
- `id` (uuid, PK)
- `source_account_id` (uuid, FK accounts) — debit side
- `destination_account_id` (uuid, FK accounts) — credit side
- `amount` (numeric 20,2) — positive transfer amount
- `status` (text) — 'completed' | 'failed' | 'rolled_back'
- `failure_reason` (text, nullable) — error code/message when status != 'completed'
- `initiated_by` (uuid, FK auth.users) — who requested the transfer
- `idempotency_key` (text, UNIQUE nullable) — prevents duplicate submissions
- `created_at` (timestamptz)

### 3. audit_events
Append-only event log for security and operational telemetry.
- `id` (uuid, PK)
- `event_type` (text) — e.g. TRANSFER_ATTEMPT, ACCOUNT_FROZEN, BALANCE_MISMATCH, DAY_CLOSE
- `account_id` (uuid, nullable) — related account, if any
- `transaction_id` (uuid, nullable) — related transaction, if any
- `payload` (jsonb) — structured context for the event
- `severity` (text) — 'INFO' | 'WARNING' | 'CRITICAL' | 'FATAL'
- `actor_id` (uuid, nullable) — user who triggered the event
- `created_at` (timestamptz)

### 4. reconciliation_reports
End-of-day ledger reconciliation reports with SHA-256 integrity signature.
- `id` (uuid, PK)
- `report_date` (date, UNIQUE) — one report per calendar day
- `total_transactions` (integer)
- `total_debits` (numeric 20,2) — sum of all debit amounts
- `total_credits` (numeric 20,2) — sum of all credit amounts
- `is_balanced` (boolean) — total_debits == total_credits
- `report_hash` (text) — SHA-256 over report content for tamper detection
- `created_by` (uuid, FK auth.users)
- `created_at` (timestamptz)

## Security (RLS)
- All tables have RLS enabled.
- `accounts`: owners can CRUD their own rows.
- `transactions`: initiators (and parties whose accounts appear in the transfer) can SELECT; only the edge function (service role) inserts.
- `audit_events`: authenticated users can SELECT; only service role inserts.
- `reconciliation_reports`: authenticated users can SELECT; only authenticated can INSERT.

## Important Notes
1. The `balance` column uses NUMERIC(20,2) to avoid floating-point rounding errors.
2. Account freezing is enforced at the application/edge-function layer since RLS cannot block service-role writes.
3. Idempotency keys on transactions prevent double-submission under retries.
4. Indexes cover all FK columns and the account_number lookup path.
*/

-- EXTENSION: pgcrypto for gen_random_uuid (usually already enabled, safe to re-run)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ────────────────────────────────────────────────────────────────────────────
-- TABLE: accounts
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_number text UNIQUE NOT NULL,
  holder_name text NOT NULL,
  balance numeric(20,2) NOT NULL DEFAULT 0.00 CHECK (balance >= 0),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'frozen')),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS accounts_user_id_idx ON accounts (user_id);
CREATE INDEX IF NOT EXISTS accounts_account_number_idx ON accounts (account_number);
CREATE INDEX IF NOT EXISTS accounts_status_idx ON accounts (status);

ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_accounts" ON accounts;
CREATE POLICY "select_own_accounts" ON accounts FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_accounts" ON accounts;
CREATE POLICY "insert_own_accounts" ON accounts FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_accounts" ON accounts;
CREATE POLICY "update_own_accounts" ON accounts FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_accounts" ON accounts;
CREATE POLICY "delete_own_accounts" ON accounts FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ────────────────────────────────────────────────────────────────────────────
-- TABLE: transactions
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_account_id uuid NOT NULL REFERENCES accounts(id),
  destination_account_id uuid NOT NULL REFERENCES accounts(id),
  amount numeric(20,2) NOT NULL CHECK (amount > 0),
  status text NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'failed', 'rolled_back')),
  failure_reason text,
  initiated_by uuid REFERENCES auth.users(id),
  idempotency_key text UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS transactions_source_idx ON transactions (source_account_id);
CREATE INDEX IF NOT EXISTS transactions_destination_idx ON transactions (destination_account_id);
CREATE INDEX IF NOT EXISTS transactions_initiated_by_idx ON transactions (initiated_by);
CREATE INDEX IF NOT EXISTS transactions_created_at_idx ON transactions (created_at DESC);
CREATE INDEX IF NOT EXISTS transactions_status_idx ON transactions (status);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Users can see transactions where their accounts are source or destination
DROP POLICY IF EXISTS "select_own_transactions" ON transactions;
CREATE POLICY "select_own_transactions" ON transactions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM accounts
      WHERE accounts.id IN (source_account_id, destination_account_id)
        AND accounts.user_id = auth.uid()
    )
  );

-- Inserts are performed by edge functions using service role — no client INSERT needed

-- ────────────────────────────────────────────────────────────────────────────
-- TABLE: audit_events
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  account_id uuid REFERENCES accounts(id),
  transaction_id uuid REFERENCES transactions(id),
  payload jsonb,
  severity text NOT NULL DEFAULT 'INFO' CHECK (severity IN ('INFO', 'WARNING', 'CRITICAL', 'FATAL')),
  actor_id uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS audit_events_event_type_idx ON audit_events (event_type);
CREATE INDEX IF NOT EXISTS audit_events_account_id_idx ON audit_events (account_id);
CREATE INDEX IF NOT EXISTS audit_events_severity_idx ON audit_events (severity);
CREATE INDEX IF NOT EXISTS audit_events_created_at_idx ON audit_events (created_at DESC);

ALTER TABLE audit_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_audit_events" ON audit_events;
CREATE POLICY "select_audit_events" ON audit_events FOR SELECT
  TO authenticated USING (true);

-- ────────────────────────────────────────────────────────────────────────────
-- TABLE: reconciliation_reports
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reconciliation_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_date date UNIQUE NOT NULL,
  total_transactions integer NOT NULL DEFAULT 0,
  total_debits numeric(20,2) NOT NULL DEFAULT 0.00,
  total_credits numeric(20,2) NOT NULL DEFAULT 0.00,
  is_balanced boolean NOT NULL DEFAULT false,
  report_hash text NOT NULL,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS reconciliation_reports_date_idx ON reconciliation_reports (report_date DESC);

ALTER TABLE reconciliation_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_reconciliation_reports" ON reconciliation_reports;
CREATE POLICY "select_reconciliation_reports" ON reconciliation_reports FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_reconciliation_reports" ON reconciliation_reports;
CREATE POLICY "insert_reconciliation_reports" ON reconciliation_reports FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = created_by);

-- ────────────────────────────────────────────────────────────────────────────
-- PL/pgSQL FUNCTION: perform_transfer (called by edge function)
-- Uses SELECT FOR UPDATE to acquire exclusive row locks and prevent race conditions.
-- Returns the new transaction id on success; raises on any validation failure.
-- ────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION perform_transfer(
  p_source_account_id uuid,
  p_destination_account_id uuid,
  p_amount numeric,
  p_initiated_by uuid,
  p_idempotency_key text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_source accounts%ROWTYPE;
  v_dest accounts%ROWTYPE;
  v_transaction_id uuid;
BEGIN
  -- Idempotency: return existing tx if same key already processed
  IF p_idempotency_key IS NOT NULL THEN
    SELECT id INTO v_transaction_id
      FROM transactions
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

  -- Acquire exclusive locks in consistent order (smaller id first) to prevent deadlocks
  IF p_source_account_id < p_destination_account_id THEN
    SELECT * INTO v_source FROM accounts WHERE id = p_source_account_id FOR UPDATE;
    SELECT * INTO v_dest   FROM accounts WHERE id = p_destination_account_id FOR UPDATE;
  ELSE
    SELECT * INTO v_dest   FROM accounts WHERE id = p_destination_account_id FOR UPDATE;
    SELECT * INTO v_source FROM accounts WHERE id = p_source_account_id FOR UPDATE;
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
    RAISE EXCEPTION 'INSUFFICIENT_FUNDS: Balance %.2f insufficient for transfer of %.2f', v_source.balance, p_amount;
  END IF;

  -- Atomic debit + credit
  UPDATE accounts SET balance = balance - p_amount WHERE id = p_source_account_id;
  UPDATE accounts SET balance = balance + p_amount WHERE id = p_destination_account_id;

  -- Record the transaction
  INSERT INTO transactions (source_account_id, destination_account_id, amount, status, initiated_by, idempotency_key)
  VALUES (p_source_account_id, p_destination_account_id, p_amount, 'completed', p_initiated_by, p_idempotency_key)
  RETURNING id INTO v_transaction_id;

  RETURN v_transaction_id;
END;
$$;

-- ────────────────────────────────────────────────────────────────────────────
-- FUNCTION: generate_account_number (sequential, human-readable)
-- ────────────────────────────────────────────────────────────────────────────
CREATE SEQUENCE IF NOT EXISTS account_number_seq START 1000001;

CREATE OR REPLACE FUNCTION generate_account_number()
RETURNS text
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN 'FT-' || LPAD(nextval('account_number_seq')::text, 7, '0');
END;
$$;
