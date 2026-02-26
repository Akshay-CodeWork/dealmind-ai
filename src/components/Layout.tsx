import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { usePipeline } from "@/contexts/PipelineContext";
import {
  Brain,
  Upload,
  Sparkles,
  Search,
  FileText,
  BarChart3,
  LogOut,
} from "lucide-react";

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { path: "/upload", label: "Upload", icon: Upload },
  { path: "/cleaning", label: "Cleaning", icon: Sparkles },
  { path: "/discrepancy", label: "Discrepancy", icon: Search },
  { path: "/legal", label: "Legal", icon: FileText },
  { path: "/summary", label: "Summary", icon: BarChart3 },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const { uploadComplete, cleaningComplete, discrepancyComplete, legalComplete } = usePipeline();
  const location = useLocation();

  const isEnabled = (path: string) => {
    switch (path) {
      case "/dashboard": return true;
      case "/upload": return true;
      case "/cleaning": return uploadComplete;
      case "/discrepancy": return cleaningComplete;
      case "/legal": return uploadComplete;
      case "/summary": return cleaningComplete;
      default: return true;
    }
  };

  const isComplete = (path: string) => {
    switch (path) {
      case "/upload": return uploadComplete;
      case "/cleaning": return cleaningComplete;
      case "/discrepancy": return discrepancyComplete;
      case "/legal": return legalComplete;
      default: return false;
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card flex flex-col">
        <div className="p-5 border-b border-border">
          <Link to="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Brain className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold tracking-tight">
              Deal<span className="text-gradient-primary">Mind</span>
            </span>
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(({ path, label, icon: Icon }) => {
            const active = location.pathname === path;
            const enabled = isEnabled(path);
            const complete = isComplete(path);

            return (
              <Link
                key={path}
                to={enabled ? path : "#"}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                  ${active ? "bg-primary/10 text-primary" : ""}
                  ${enabled && !active ? "text-muted-foreground hover:text-foreground hover:bg-secondary" : ""}
                  ${!enabled ? "text-muted-foreground/40 cursor-not-allowed" : ""}
                `}
              >
                <Icon className="w-4 h-4" />
                {label}
                {complete && (
                  <div className="ml-auto w-2 h-2 rounded-full bg-success" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-border">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
            <button onClick={logout} className="text-muted-foreground hover:text-destructive transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <div className="p-8 max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
