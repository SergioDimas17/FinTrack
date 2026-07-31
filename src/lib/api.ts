import { supabase, functionsUrl } from "./supabase";
import type { Account, Transaction, AuditEvent, ReconciliationReport, TransferSummary } from "../types";

async function authHeaders(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function apiFetch<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const headers = await authHeaders();
  const res = await fetch(`${functionsUrl}${path}`, { ...opts, headers: { ...headers, ...(opts.headers ?? {}) } });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? `Request failed (${res.status})`);
  return data as T;
}

// Accounts
export async function listAccounts(): Promise<Account[]> {
  const data = await apiFetch<{ accounts: Account[] }>("/banking-api/accounts");
  return data.accounts;
}

export async function createAccount(holder_name: string, initial_balance: number): Promise<Account> {
  const data = await apiFetch<{ account: Account }>("/banking-api/accounts", {
    method: "POST",
    body: JSON.stringify({ holder_name, initial_balance }),
  });
  return data.account;
}

export async function getAccount(id: string): Promise<Account> {
  const data = await apiFetch<{ account: Account }>(`/banking-api/accounts/${id}`);
  return data.account;
}

export async function lookupAccount(accountNumber: string): Promise<{
  id: string;
  account_number: string;
  holder_name: string;
  status: string;
}> {
  const data = await apiFetch<{ account: { id: string; account_number: string; holder_name: string; status: string } }>(
    `/banking-api/lookup?account_number=${encodeURIComponent(accountNumber)}`
  );
  return data.account;
}

// Transactions
export async function listTransactions(
  opts: { limit?: number; offset?: number; account_id?: string } = {}
): Promise<{ transactions: Transaction[]; total: number }> {
  const params = new URLSearchParams();
  if (opts.limit) params.set("limit", String(opts.limit));
  if (opts.offset) params.set("offset", String(opts.offset));
  if (opts.account_id) params.set("account_id", opts.account_id);
  return apiFetch<{ transactions: Transaction[]; total: number }>(
    `/banking-api/transactions?${params}`
  );
}

// Transfer
export async function performTransfer(payload: {
  source_account_id: string;
  destination_account_id: string;
  amount: number;
  idempotency_key?: string;
}): Promise<{ transaction_id: string; new_balance: number; message: string }> {
  const headers = await authHeaders();
  const res = await fetch(`${functionsUrl}/transfer`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? `Transfer failed (${res.status})`);
  return data;
}

// Summary
export async function getSummary(
  opts: { from?: string; to?: string; account_id?: string } = {}
): Promise<TransferSummary> {
  const params = new URLSearchParams();
  if (opts.from) params.set("from", opts.from);
  if (opts.to) params.set("to", opts.to);
  if (opts.account_id) params.set("account_id", opts.account_id);
  return apiFetch<TransferSummary>(`/banking-api/summary?${params}`);
}

// Audit
export async function listAuditEvents(
  opts: { limit?: number; offset?: number; severity?: string } = {}
): Promise<{ events: AuditEvent[]; total: number }> {
  const params = new URLSearchParams();
  if (opts.limit) params.set("limit", String(opts.limit));
  if (opts.offset) params.set("offset", String(opts.offset));
  if (opts.severity) params.set("severity", opts.severity);
  return apiFetch<{ events: AuditEvent[]; total: number }>(`/banking-api/audit?${params}`);
}

// Reconciliation
export async function listReconciliationReports(): Promise<ReconciliationReport[]> {
  const data = await apiFetch<{ reports: ReconciliationReport[] }>("/banking-api/reconciliation");
  return data.reports;
}

export async function runDayClose(date: string): Promise<{ report: ReconciliationReport; is_balanced: boolean; report_hash: string }> {
  return apiFetch("/banking-api/day-close", {
    method: "POST",
    body: JSON.stringify({ date }),
  });
}
