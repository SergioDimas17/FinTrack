import { useEffect, useState, useCallback } from "react";
import {
  Wallet, TrendingUp, TrendingDown, Plus, RefreshCw,
  CreditCard, AlertTriangle, CheckCircle2, X, Copy, Check
} from "lucide-react";
import { listAccounts, createAccount, getSummary } from "../lib/api";
import type { Account, TransferSummary } from "../types";

function formatCurrency(value: number | string) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(Number(value));
}

function AccountCard({ account }: { account: Account }) {
  const frozen = account.status === "frozen";
  const [copied, setCopied] = useState(false);

  async function copyNumber() {
    try {
      await navigator.clipboard.writeText(account.account_number);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (_) { /* clipboard unavailable */ }
  }

  return (
    <div className={`relative bg-white rounded-2xl border p-6 shadow-sm transition-all hover:shadow-md ${frozen ? "border-amber-200 bg-amber-50/30" : "border-slate-200"}`}>
      {frozen && (
        <span className="absolute top-4 right-4 flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
          <AlertTriangle size={11} /> Congelada
        </span>
      )}
      {!frozen && (
        <span className="absolute top-4 right-4 flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
          <CheckCircle2 size={11} /> Activa
        </span>
      )}
      <div className="flex items-start gap-3 mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${frozen ? "bg-amber-100" : "bg-emerald-100"}`}>
          <CreditCard size={20} className={frozen ? "text-amber-600" : "text-emerald-600"} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-800">{account.holder_name}</p>
          <p className="text-xs text-slate-400">Creada {new Date(account.created_at).toLocaleDateString("es-CO")}</p>
        </div>
      </div>
      <p className="text-2xl font-bold text-slate-900">{formatCurrency(account.balance)}</p>
      <div className="mt-3 pt-3 border-t border-slate-100">
        <p className="text-[10px] uppercase tracking-wide text-slate-400 font-medium mb-1">Numero de cuenta</p>
        <div className="flex items-center gap-2">
          <code className="text-base text-slate-800 font-mono font-semibold flex-1 bg-slate-50 px-2.5 py-1.5 rounded tracking-wider">{account.account_number}</code>
          <button
            onClick={copyNumber}
            className="shrink-0 p-1.5 rounded-md text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition"
            title="Copiar numero de cuenta"
          >
            {copied ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
          </button>
        </div>
        <p className="text-[11px] text-slate-400 mt-1.5">
          Comparte este numero para recibir transferencias.
        </p>
      </div>
    </div>
  );
}

interface NewAccountModalProps {
  onClose: () => void;
  onCreated: () => void;
}

function NewAccountModal({ onClose, onCreated }: NewAccountModalProps) {
  const [name, setName] = useState("");
  const [balance, setBalance] = useState("1000");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [createdNumber, setCreatedNumber] = useState("");

  async function handleCreate() {
    if (!name.trim()) { setError("El nombre es requerido."); return; }
    const bal = parseFloat(balance);
    if (isNaN(bal) || bal < 0) { setError("Saldo inicial invalido."); return; }
    setLoading(true);
    try {
      const account = await createAccount(name.trim(), bal);
      setCreatedNumber(account.account_number);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear cuenta");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-slate-800">Nueva Cuenta</h2>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100">
            <X size={20} />
          </button>
        </div>

        {createdNumber ? (
          <div className="text-center py-4">
            <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={28} className="text-emerald-600" />
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-1">Cuenta creada</h3>
            <p className="text-xs text-slate-500 mb-4">Guarda este numero de cuenta: lo necesitaras para recibir transferencias.</p>
            <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 mb-5">
              <p className="text-[10px] uppercase tracking-wide text-slate-400 font-medium mb-0.5">Numero de cuenta</p>
              <p className="text-2xl font-bold text-slate-900 font-mono tracking-wider">{createdNumber}</p>
            </div>
            <button
              onClick={() => { onCreated(); onClose(); }}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-sm transition"
            >
              Listo
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Nombre del titular</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ej. Juan Perez"
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Saldo inicial (USD)</label>
              <input
                type="number"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                min="0"
                step="0.01"
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm">
                <AlertTriangle size={14} /> {error}
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <button onClick={onClose} className="flex-1 py-2.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition">
                Cancelar
              </button>
              <button
                onClick={handleCreate}
                disabled={loading}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-semibold rounded-lg text-sm transition"
              >
                {loading ? "Creando..." : "Crear cuenta"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function DashboardPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [summary, setSummary] = useState<TransferSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [accs, sum] = await Promise.all([
        listAccounts(),
        getSummary(),
      ]);
      setAccounts(accs);
      setSummary(sum);
    } catch (_) {
      // silently skip summary errors
      try { setAccounts(await listAccounts()); } catch (_) {}
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const totalBalance = accounts.reduce((s, a) => s + Number(a.balance), 0);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 text-sm mt-0.5">Resumen de cuentas y actividad</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 transition"
            title="Actualizar"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition shadow-sm"
          >
            <Plus size={16} /> Nueva cuenta
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-slate-500 font-medium">Balance total</p>
            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Wallet size={16} className="text-emerald-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">{formatCurrency(totalBalance)}</p>
          <p className="text-xs text-slate-400 mt-1">{accounts.length} cuenta{accounts.length !== 1 ? "s" : ""}</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-slate-500 font-medium">Total enviado</p>
            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
              <TrendingDown size={16} className="text-red-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">{formatCurrency(summary?.total_sent ?? 0)}</p>
          <p className="text-xs text-slate-400 mt-1">{summary?.count_sent ?? 0} transferencias</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-slate-500 font-medium">Total recibido</p>
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp size={16} className="text-blue-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">{formatCurrency(summary?.total_received ?? 0)}</p>
          <p className="text-xs text-slate-400 mt-1">{summary?.count_received ?? 0} transferencias</p>
        </div>
      </div>

      {/* Accounts grid */}
      <div className="mb-4">
        <h2 className="text-base font-semibold text-slate-700 mb-4">Mis cuentas</h2>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 animate-pulse">
                <div className="h-4 w-32 bg-slate-200 rounded mb-4" />
                <div className="h-8 w-48 bg-slate-200 rounded" />
              </div>
            ))}
          </div>
        ) : accounts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
            <CreditCard size={32} className="text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">Sin cuentas aun</p>
            <p className="text-slate-400 text-sm mt-1">Crea tu primera cuenta para comenzar</p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-4 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition"
            >
              Crear cuenta
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {accounts.map((acc) => <AccountCard key={acc.id} account={acc} />)}
          </div>
        )}
      </div>

      {showModal && (
        <NewAccountModal
          onClose={() => setShowModal(false)}
          onCreated={() => { setShowModal(false); load(); }}
        />
      )}
    </div>
  );
}
