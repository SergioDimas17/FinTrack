import { useEffect, useState, FormEvent } from "react";
import {
  ArrowRightLeft, CheckCircle2, AlertCircle, ChevronDown,
  Loader2, Info, Search, UserCheck
} from "lucide-react";
import { listAccounts, performTransfer, lookupAccount } from "../lib/api";
import type { Account } from "../types";

function formatCurrency(value: number | string) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(Number(value));
}

type Status = "idle" | "loading" | "success" | "error";

export function TransferPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);

  const [sourceId, setSourceId] = useState("");
  const [destNumber, setDestNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [newBalance, setNewBalance] = useState<number | null>(null);
  const [txId, setTxId] = useState("");

  // Lookup state for resolving an account number to a UUID
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState("");
  const [resolvedDest, setResolvedDest] = useState<{ id: string; account_number: string; holder_name: string; status: string } | null>(null);

  useEffect(() => {
    listAccounts()
      .then(setAccounts)
      .catch(() => {})
      .finally(() => setLoadingAccounts(false));
  }, []);

  const sourceAccount = accounts.find((a) => a.id === sourceId);

  async function handleLookup() {
    setLookupError("");
    setResolvedDest(null);
    const value = destNumber.trim();
    if (!value) { setLookupError("Ingresa el numero de cuenta destino."); return; }
    if (!/^\d+$/.test(value)) { setLookupError("El numero de cuenta solo contiene digitos."); return; }
    setLookupLoading(true);
    try {
      const acc = await lookupAccount(value);
      setResolvedDest(acc);
    } catch (err) {
      setLookupError(err instanceof Error ? err.message : "Cuenta no encontrada");
    } finally {
      setLookupLoading(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setMessage("");
    setStatus("idle");

    if (!sourceId) { setStatus("error"); setMessage("Selecciona la cuenta origen."); return; }
    const destValue = destNumber.trim();
    if (!destValue) { setStatus("error"); setMessage("Ingresa el numero de cuenta destino."); return; }
    if (!/^\d+$/.test(destValue)) { setStatus("error"); setMessage("El numero de cuenta destino solo debe contener digitos."); return; }
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) { setStatus("error"); setMessage("El monto debe ser mayor a cero."); return; }
    if (sourceAccount && num > Number(sourceAccount.balance)) {
      setStatus("error"); setMessage("Fondos insuficientes en la cuenta origen."); return;
    }

    // Resolve destination account number to UUID
    let destinationId: string;
    if (resolvedDest && resolvedDest.account_number === destValue) {
      destinationId = resolvedDest.id;
    } else {
      // Auto-resolve on submit
      setLookupLoading(true);
      try {
        const acc = await lookupAccount(destValue);
        destinationId = acc.id;
        setResolvedDest(acc);
      } catch (err) {
        setLookupLoading(false);
        setStatus("error");
        setMessage(err instanceof Error ? err.message : "No se encontro la cuenta destino. Verifica el numero e intenta de nuevo.");
        return;
      } finally {
        setLookupLoading(false);
      }
    }

    // Prevent transfer to own same account
    if (destinationId === sourceId) {
      setStatus("error");
      setMessage("La cuenta origen y la cuenta destino deben ser diferentes.");
      return;
    }

    setStatus("loading");

    // Generate an idempotency key
    const idempotencyKey = `tx-${sourceId}-${destinationId}-${num}-${Date.now()}`;

    try {
      const res = await performTransfer({
        source_account_id: sourceId,
        destination_account_id: destinationId,
        amount: num,
        idempotency_key: idempotencyKey,
      });
      setStatus("success");
      setMessage(res.message ?? "Transferencia completada.");
      setNewBalance(res.new_balance);
      setTxId(res.transaction_id);
      // Reset form (keep source so user can do follow-up transfers)
      setDestNumber("");
      setAmount("");
      setResolvedDest(null);
      // Refresh accounts
      listAccounts().then(setAccounts).catch(() => {});
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Error al procesar la transferencia.");
    }
  }

  function reset() {
    setStatus("idle");
    setMessage("");
    setNewBalance(null);
    setTxId("");
  }

  const activeAccounts = accounts.filter((a) => a.status === "active");

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Transferencias</h1>
        <p className="text-slate-500 text-sm mt-0.5">Envia dinero entre cuentas de forma segura y atomica</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Transfer form */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                <ArrowRightLeft size={16} className="text-emerald-600" />
              </div>
              <h2 className="font-semibold text-slate-800">Nueva transferencia</h2>
            </div>

            {status === "success" ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={32} className="text-emerald-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">Transferencia exitosa</h3>
                <p className="text-slate-500 text-sm mb-4">{message}</p>
                {newBalance !== null && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 mb-4">
                    <p className="text-xs text-emerald-700 font-medium">Nuevo saldo en cuenta origen</p>
                    <p className="text-xl font-bold text-emerald-800">{formatCurrency(newBalance)}</p>
                  </div>
                )}
                {txId && (
                  <p className="text-xs text-slate-400 font-mono truncate mb-6">TX: {txId}</p>
                )}
                <button
                  onClick={reset}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-sm transition"
                >
                  Nueva transferencia
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Source account */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Cuenta origen</label>
                  {loadingAccounts ? (
                    <div className="h-10 bg-slate-100 rounded-lg animate-pulse" />
                  ) : (
                    <div className="relative">
                      <select
                        value={sourceId}
                        onChange={(e) => { setSourceId(e.target.value); reset(); }}
                        className="w-full appearance-none pl-3 pr-8 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                      >
                        <option value="">Selecciona una cuenta...</option>
                        {activeAccounts.map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.account_number} — {a.holder_name} ({formatCurrency(a.balance)})
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  )}
                  {sourceAccount && (
                    <div className="mt-2 flex items-center gap-2 text-xs text-slate-500 bg-slate-50 px-3 py-2 rounded-lg">
                      <Info size={12} />
                      Saldo disponible: <span className="font-semibold text-slate-700">{formatCurrency(sourceAccount.balance)}</span>
                    </div>
                  )}
                </div>

                {/* Destination account number */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Numero de cuenta destino</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={destNumber}
                      onChange={(e) => { setDestNumber(e.target.value.replace(/\D/g, "")); setResolvedDest(null); setLookupError(""); }}
                      placeholder="ej. 1000004"
                      className="flex-1 px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono tracking-wider"
                    />
                    <button
                      type="button"
                      onClick={handleLookup}
                      disabled={lookupLoading || !destNumber.trim()}
                      className="shrink-0 px-3 py-2.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition flex items-center gap-1.5"
                    >
                      {lookupLoading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
                      Buscar
                    </button>
                  </div>
                  <p className="text-xs text-slate-400 mt-1.5">
                    Ingresa el numero de cuenta del destinatario y pulsa "Buscar" para verificar el titular antes de enviar.
                  </p>
                  {lookupError && (
                    <div className="mt-2 flex items-center gap-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                      <AlertCircle size={12} /> {lookupError}
                    </div>
                  )}
                  {resolvedDest && (
                    <div className="mt-2 flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                      <UserCheck size={12} />
                      <span>
                        Cuenta verificada: <span className="font-semibold">{resolvedDest.holder_name}</span>
                        {resolvedDest.status === "frozen" && <span className="text-amber-700 font-medium"> — CONGELADA</span>}
                      </span>
                    </div>
                  )}
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Monto (USD)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">$</span>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      min="0.01"
                      step="0.01"
                      className="w-full pl-7 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Error */}
                {status === "error" && (
                  <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2.5 text-sm">
                    <AlertCircle size={15} className="mt-0.5 shrink-0" />
                    {message}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === "loading" || lookupLoading}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-lg text-sm transition flex items-center justify-center gap-2 shadow-sm"
                >
                  {status === "loading" ? (
                    <><Loader2 size={16} className="animate-spin" /> Procesando...</>
                  ) : (
                    <><ArrowRightLeft size={16} /> Ejecutar transferencia</>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Info panel */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Garantias del sistema</h3>
            <ul className="space-y-2.5 text-sm text-slate-600">
              {[
                ["Atomicidad", "Debito y credito son indivisibles"],
                ["Bloqueo de fila", "SELECT FOR UPDATE previene condiciones de carrera"],
                ["Idempotencia", "Clave unica evita duplicacion de transferencias"],
                ["Validacion de saldo", "Rechazo inmediato si fondos insuficientes (HTTP 422)"],
                ["Circuit breaker", "Cuentas congeladas no pueden operar"],
              ].map(([title, desc]) => (
                <li key={title} className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-emerald-500 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-medium text-slate-700">{title}: </span>
                    {desc}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-slate-800 rounded-2xl p-5 text-white">
            <h3 className="text-sm font-semibold mb-3 text-slate-300">Tus cuentas activas</h3>
            {activeAccounts.length === 0 ? (
              <p className="text-slate-500 text-sm">Sin cuentas activas</p>
            ) : (
              <div className="space-y-3">
                {activeAccounts.map((a) => (
                  <div key={a.id} className="flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="text-xs font-mono text-slate-400">No. {a.account_number}</p>
                      <p className="text-sm font-medium text-white">{a.holder_name}</p>
                    </div>
                    <p className="text-sm font-bold text-emerald-400">{formatCurrency(a.balance)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
