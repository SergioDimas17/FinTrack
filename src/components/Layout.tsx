import { ReactNode, useState } from "react";
import {
  LayoutDashboard,
  ArrowRightLeft,
  History,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  Landmark,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

interface NavItem {
  label: string;
  view: string;
  icon: ReactNode;
}

const navItems: NavItem[] = [
  { label: "Dashboard", view: "dashboard", icon: <LayoutDashboard size={18} /> },
  { label: "Transferir", view: "transfer", icon: <ArrowRightLeft size={18} /> },
  { label: "Historial", view: "history", icon: <History size={18} /> },
  { label: "Auditoría", view: "audit", icon: <ShieldCheck size={18} /> },
];

interface LayoutProps {
  children: ReactNode;
  currentView: string;
  onNavigate: (view: string) => void;
}

export function Layout({ children, currentView, onNavigate }: LayoutProps) {
  const { user, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNav = (view: string) => {
    onNavigate(view);
    setMobileOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-white fixed inset-y-0 left-0 z-30">
        <div className="flex items-center gap-3 px-6 py-6 border-b border-slate-700">
          <div className="w-9 h-9 bg-emerald-500 rounded-lg flex items-center justify-center">
            <Landmark size={20} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-white text-sm leading-tight">FinTrack</p>
            <p className="text-slate-400 text-xs">Core Bancario MVP</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map((item) => {
            const active = currentView === item.view;
            return (
              <button
                key={item.view}
                onClick={() => handleNav(item.view)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group ${
                  active
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <span className={active ? "text-white" : "text-slate-500 group-hover:text-slate-300"}>
                  {item.icon}
                </span>
                {item.label}
                {active && <ChevronRight size={14} className="ml-auto" />}
              </button>
            );
          })}
        </nav>

        <div className="px-4 py-4 border-t border-slate-700">
          <div className="px-3 py-2 mb-2">
            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
          </div>
          <button
            onClick={signOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-all duration-150"
          >
            <LogOut size={18} />
            Cerrar sesion
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <header className="md:hidden fixed top-0 inset-x-0 z-30 bg-slate-900 text-white flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-emerald-500 rounded-md flex items-center justify-center">
            <Landmark size={15} className="text-white" />
          </div>
          <span className="font-bold text-sm">FinTrack</span>
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-1">
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-20 bg-black/50" onClick={() => setMobileOpen(false)}>
          <div
            className="absolute left-0 top-14 bottom-0 w-64 bg-slate-900 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <nav className="flex-1 px-4 py-4 space-y-1">
              {navItems.map((item) => {
                const active = currentView === item.view;
                return (
                  <button
                    key={item.view}
                    onClick={() => handleNav(item.view)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      active ? "bg-emerald-600 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                );
              })}
            </nav>
            <div className="px-4 py-4 border-t border-slate-700">
              <p className="text-xs text-slate-500 px-3 mb-2 truncate">{user?.email}</p>
              <button
                onClick={signOut}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:bg-slate-800 hover:text-white transition-all"
              >
                <LogOut size={18} /> Cerrar sesion
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 md:ml-64 pt-14 md:pt-0">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
