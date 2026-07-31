export interface Account {
  id: string;
  account_number: string;
  holder_name: string;
  balance: number;
  status: "active" | "frozen";
  user_id: string;
  created_at: string;
}

export interface Transaction {
  id: string;
  source_account_id: string;
  destination_account_id: string;
  amount: number;
  status: "completed" | "failed" | "rolled_back";
  failure_reason: string | null;
  initiated_by: string;
  idempotency_key: string | null;
  created_at: string;
  source_account?: { id: string; account_number: string; holder_name: string };
  destination_account?: { id: string; account_number: string; holder_name: string };
}

export interface AuditEvent {
  id: string;
  event_type: string;
  account_id: string | null;
  transaction_id: string | null;
  payload: Record<string, unknown> | null;
  severity: "INFO" | "WARNING" | "CRITICAL" | "FATAL";
  actor_id: string | null;
  created_at: string;
}

export interface ReconciliationReport {
  id: string;
  report_date: string;
  total_transactions: number;
  total_debits: number;
  total_credits: number;
  is_balanced: boolean;
  report_hash: string;
  created_by: string;
  created_at: string;
}

export interface TransferSummary {
  total_sent: string;
  total_received: string;
  count_sent: number;
  count_received: number;
  net: string;
  period: { from: string | null; to: string | null };
}
