import { useState } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { LoginPage } from "./pages/LoginPage";
import { ResetPasswordPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { TransferPage } from "./pages/TransferPage";
import { HistoryPage } from "./pages/HistoryPage";
import { AuditPage } from "./pages/AuditPage";
import { Layout } from "./components/Layout";

type View = "dashboard" | "transfer" | "history" | "audit";

function isPasswordRecovery() {
  const params = new URLSearchParams(window.location.search);
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  return params.get("type") === "recovery" || hash.get("type") === "recovery";
}

function AppInner() {
  const { user, loading } = useAuth();
  const [view, setView] = useState<View>("dashboard");

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Cargando FinTrack...</p>
        </div>
      </div>
    );
  }

  // Password recovery flow: user clicked the email link and a session
  // was established. Show the new-password screen instead of the app.
  if (user && isPasswordRecovery()) return <ResetPasswordPage />;

  if (!user) return <LoginPage />;

  return (
    <Layout currentView={view} onNavigate={(v) => setView(v as View)}>
      {view === "dashboard" && <DashboardPage />}
      {view === "transfer" && <TransferPage />}
      {view === "history" && <HistoryPage />}
      {view === "audit" && <AuditPage />}
    </Layout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}
