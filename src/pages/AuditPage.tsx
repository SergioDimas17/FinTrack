import { useEffect, useState, useCallback } from "react";
import {
  ShieldCheck, Calendar, Hash, CheckCircle2, XCircle,
  RefreshCw, AlertTriangle, Info, AlertCircle, Zap,
  FileText, ChevronDown, Play
} from "lucide-react";
import { listAuditEvents, listReconciliationReports, runDayClose } from "../lib/api";
import type { AuditEvent, ReconciliationReport } from "../types";

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  }).format(new Date(iso));
}

function formatCurrency(value: number | string) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(Number(value));
}

const severityConfig: Record<string, { color: string; icon: JSX.Element; bg: string }> = {
  INFO: { color: "text-blue-700", bg: "bg-blue-50 border-blue-200", icon: <Info size={12} /> },
  WARNING: { color: "text-amber-700", bg: "bg-amber-50 border-amber-200", icon: <AlertTriangle size={12} /> },
  CRITICAL: { color: "text-red-700", bg: "bg-red-50 border-red-200", icon: <AlertCircle size={12} /> },
  FATAL: { color: "text-red-900", bg: "bg-red-100 border-red-300", icon: <Zap size={12} /> },
};

function SeverityBadge({ severity }: { severity: AuditEvent["severity"] }) {
  const cfg = severityConfig[severity] ?? severityConfig.INFO;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.color}`}>
      {cfg.icon} {severity}
    </span>
  );
}

type Tab = "audit" | "reconciliation";

export function AuditPage() {
  const [tab, setTab] = useState<Tab>("audit");
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [reports, setReports] = useState<ReconciliationReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [severityFilter, setSeverityFilter] = useState("");

  // Day-close state
  const [closeDate, setCloseDate] = useState(new Date().toISOString().split("T")[0]);
  const [closingLoading, setClosingLoading] = useState(false);
  const [closeResult, setCloseResult] = useState<{ is_balanced: boolean; report_hash: string } | null>(null);
  const [closeError, setCloseError] = useState("");

  const loadAudit = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await listAuditEvents({ limit: 100, severity: severityFilter || undefined });
      setEvents(res.events);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar eventos");
    } finally {
      setLoading(false);
    }
  }, [severityFilter]);

  const loadReconciliation = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setReports(await listReconciliationReports());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar reportes");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tab === "audit") loadAudit();
    else loadReconciliation();
  }, [tab, loadAudit, loadReconciliation]);

  async function handleDayClose() {
    setClosingLoading(true);
    setCloseError("");
    setCloseResult(null);
    try {
      const res = await runDayClose(closeDate);
      setCloseResult({ is_balanced: res.is_balanced, report_hash: res.report_hash });
      loadReconciliation();
    } catch (err) {
      setCloseError(err instanceof Error ? err.message : "Error al ejecutar cierre");
    } finally {
      setClosingLoading(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Auditoria y Conciliacion</h1>
          <p className="text-slate-500 text-sm mt-0.5">Registro de eventos y cierres de caja</p>
        </div>
        <button
          onClick={() => tab === "audit" ? loadAudit() : loadReconciliation()}
          className="p-2 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-100 transition"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 rounded-xl p-1 mb-6 w-fit">
        {([["audit", "Bus de Eventos", <ShieldCheck size={14} />], ["reconciliation", "Conciliacion", <FileText size={14} />]] as const).map(([key, label, icon]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === key ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {icon} {label}
          </button>
        ))}
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-5">
          <AlertCircle size={15} /> {error}
        </div>
      )}

      {/* AUDIT TAB */}
      {tab === "audit" && (
        <div>
          {/* Severity filter */}
          <div className="flex items-center gap-3 mb-4">
            <div className="relative">
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="appearance-none pl-3 pr-7 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="">Todos los niveles</option>
                <option value="INFO">INFO</option>
                <option value="WARNING">WARNING</option>
                <option value="CRITICAL">CRITICAL</option>
                <option value="FATAL">FATAL</option>
              </select>
              <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
            <p className="text-xs text-slate-500">{events.length} evento{events.length !== 1 ? "s" : ""}</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-8 space-y-3">
                {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-10 bg-slate-100 rounded-lg animate-pulse" />)}
              </div>
            ) : events.length === 0 ? (
              <div className="py-16 text-center text-slate-400 text-sm">Sin eventos registrados</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Severidad</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Evento</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Payload</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Fecha</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {events.map((ev) => (
                      <tr key={ev.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3">
                          <SeverityBadge severity={ev.severity} />
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-slate-700 font-medium">{ev.event_type}</td>
                        <td className="px-4 py-3 max-w-xs">
                          <p className="text-xs text-slate-500 font-mono truncate">
                            {ev.payload ? JSON.stringify(ev.payload) : "—"}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">{formatDate(ev.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* RECONCILIATION TAB */}
      {tab === "reconciliation" && (
        <div className="space-y-6">
          {/* Day-close panel */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                <Calendar size={16} className="text-slate-600" />
              </div>
              <h2 className="font-semibold text-slate-800">Cierre de caja</h2>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 items-start">
              <div className="flex-1">
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Fecha de cierre</label>
                <input
                  type="date"
                  value={closeDate}
                  onChange={(e) => { setCloseDate(e.target.value); setCloseResult(null); setCloseError(""); }}
                  max={new Date().toISOString().split("T")[0]}
                  className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <button
                onClick={handleDayClose}
                disabled={closingLoading}
                className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-900 disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition self-end"
              >
                {closingLoading ? <RefreshCw size={14} className="animate-spin" /> : <Play size={14} />}
                Ejecutar cierre
              </button>
            </div>

            {closeError && (
              <div className="mt-3 flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2.5 text-sm">
                <AlertCircle size={14} /> {closeError}
              </div>
            )}

            {closeResult && (
              <div className={`mt-4 rounded-xl border p-4 ${closeResult.is_balanced ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200"}`}>
                <div className="flex items-center gap-2 mb-2">
                  {closeResult.is_balanced
                    ? <CheckCircle2 size={18} className="text-emerald-600" />
                    : <XCircle size={18} className="text-red-600" />
                  }
                  <span className={`text-sm font-semibold ${closeResult.is_balanced ? "text-emerald-800" : "text-red-800"}`}>
                    {closeResult.is_balanced ? "Ecuacion cero verificada — balance cuadrado" : "ALERTA: Descuadre detectado"}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-2">
                  <Hash size={12} className="text-slate-400 shrink-0" />
                  <p className="text-xs font-mono text-slate-500 break-all">{closeResult.report_hash}</p>
                </div>
              </div>
            )}
          </div>

          {/* Reports table */}
          <div>
            <h2 className="text-base font-semibold text-slate-700 mb-4">Reportes anteriores</h2>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              {loading ? (
                <div className="p-8 space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-10 bg-slate-100 rounded-lg animate-pulse" />)}
                </div>
              ) : reports.length === 0 ? (
                <div className="py-16 text-center text-slate-400 text-sm">Sin reportes de conciliacion aun</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Fecha</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Transacciones</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Total debitos</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Total creditos</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide">Balance</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">SHA-256</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {reports.map((r) => (
                        <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3.5 font-medium text-slate-800">
                            {new Date(r.report_date).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })}
                          </td>
                          <td className="px-4 py-3.5 text-right text-slate-600">{r.total_transactions}</td>
                          <td className="px-4 py-3.5 text-right text-slate-600">{formatCurrency(r.total_debits)}</td>
                          <td className="px-4 py-3.5 text-right text-slate-600">{formatCurrency(r.total_credits)}</td>
                          <td className="px-4 py-3.5 text-center">
                            {r.is_balanced
                              ? <CheckCircle2 size={16} className="text-emerald-500 mx-auto" />
                              : <XCircle size={16} className="text-red-500 mx-auto" />
                            }
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-1.5">
                              <Hash size={11} className="text-slate-400 shrink-0" />
                              <span className="font-mono text-xs text-slate-400 truncate max-w-[140px]" title={r.report_hash}>
                                {r.report_hash.slice(0, 16)}...
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
