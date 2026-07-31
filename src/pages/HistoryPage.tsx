import { useEffect, useState, useCallback } from "react";
import {
  ArrowUpRight, ArrowDownLeft, RefreshCw, ChevronLeft, ChevronRight,
  Filter, Search, AlertCircle
} from "lucide-react";
import { listTransactions, listAccounts } from "../lib/api";
import type { Transaction, Account } from "../types";

function formatCurrency(value: number | string) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(Number(value));
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  }).format(new Date(iso));
}

const PAGE_SIZE = 15;

const statusColors: Record<string, string> = {
  completed: "bg-emerald-100 text-emerald-700",
  failed: "bg-red-100 text-red-700",
  rolled_back: "bg-amber-100 text-amber-700",
};

export function HistoryPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterAccount, setFilterAccount] = useState("");
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [txResult, accs] = await Promise.all([
        listTransactions({ limit: PAGE_SIZE, offset: page * PAGE_SIZE, account_id: filterAccount || undefined }),
        listAccounts(),
      ]);
      setTransactions(txResult.transactions);
      setTotal(txResult.total);
      setAccounts(accs);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar historial");
    } finally {
      setLoading(false);
    }
  }, [page, filterAccount]);

  useEffect(() => { load(); }, [load]);

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const myAccountIds = new Set(accounts.map((a) => a.id));

  const filtered = search.trim()
    ? transactions.filter((tx) => {
        const q = search.toLowerCase();
        return (
          tx.id.toLowerCase().includes(q) ||
          tx.source_account?.account_number?.toLowerCase().includes(q) ||
          tx.destination_account?.account_number?.toLowerCase().includes(q) ||
          tx.source_account?.holder_name?.toLowerCase().includes(q) ||
          tx.destination_account?.holder_name?.toLowerCase().includes(q)
        );
      })
    : transactions;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Historial</h1>
          <p className="text-slate-500 text-sm mt-0.5">Registro cronologico de transferencias</p>
        </div>
        <button
          onClick={() => { setPage(0); load(); }}
          className="p-2 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-100 transition"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por numero de cuenta, nombre o ID..."
            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div className="relative">
          <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <select
            value={filterAccount}
            onChange={(e) => { setFilterAccount(e.target.value); setPage(0); }}
            className="appearance-none pl-9 pr-8 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          >
            <option value="">Todas las cuentas</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>{a.account_number} — {a.holder_name}</option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-4">
          <AlertCircle size={15} /> {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-12 bg-slate-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-slate-400 text-sm">Sin transacciones encontradas</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Tipo</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Cuenta origen</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Cuenta destino</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Monto</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Estado</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((tx) => {
                  const isDebit = myAccountIds.has(tx.source_account_id);
                  return (
                    <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-full ${
                          isDebit ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"
                        }`}>
                          {isDebit ? <ArrowUpRight size={12} /> : <ArrowDownLeft size={12} />}
                          {isDebit ? "Envio" : "Recibo"}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="font-mono text-xs text-slate-500">{tx.source_account?.account_number ?? "—"}</p>
                        <p className="text-slate-700 text-xs font-medium">{tx.source_account?.holder_name ?? "—"}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="font-mono text-xs text-slate-500">{tx.destination_account?.account_number ?? "—"}</p>
                        <p className="text-slate-700 text-xs font-medium">{tx.destination_account?.holder_name ?? "—"}</p>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <span className={`font-bold ${isDebit ? "text-red-600" : "text-emerald-600"}`}>
                          {isDebit ? "-" : "+"}{formatCurrency(tx.amount)}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[tx.status] ?? "bg-slate-100 text-slate-600"}`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-500 text-xs whitespace-nowrap">
                        {formatDate(tx.created_at)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm text-slate-600">
          <p className="text-slate-500 text-xs">
            {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} de {total}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-100 transition"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs text-slate-500">Pag. {page + 1} / {totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-100 transition"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
