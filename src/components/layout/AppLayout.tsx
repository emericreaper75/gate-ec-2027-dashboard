import React, { useState, useEffect } from "react";
import { useStore } from "../../store";
import { cn } from "../ui";
import { Toaster } from "sonner";
import {
  Home,
  CheckSquare,
  Map,
  Bell,
  Target,
  BarChart2,
  BookOpen,
  Activity,
  FileText,
  AlertOctagon,
  Calendar,
  Settings,
  ChevronLeft,
  ChevronRight,
  Clock,
  Menu,
  X,
  Timer
} from "lucide-react";

export const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: Home },
  { id: "daily-checklist", label: "Daily Checklist", icon: CheckSquare },
  { id: "strategic-plan", label: "Strategic Plan", icon: Map },
  { id: "learning-notes", label: "Learning Notes", icon: BookOpen },
  { id: "spaced-repetition", label: "Spaced Repetition", icon: Clock },
  { id: "focus-timer", label: "Focus Timer", icon: Timer },
  { id: "reminders", label: "Reminders", icon: Bell },
  { id: "priority-board", label: "Priority Board", icon: Target },
  { id: "subject-tracker", label: "Subject Tracker", icon: BarChart2 },
  { id: "pyq-log", label: "PYQ Log", icon: BookOpen },
  { id: "mock-analyzer", label: "Mock Analyzer", icon: Activity },
  { id: "formula-sheets", label: "Formula Sheets", icon: FileText },
  { id: "error-journal", label: "Error Journal", icon: AlertOctagon },
  { id: "weekly-review", label: "Weekly Review", icon: Calendar },
  { id: "settings", label: "Settings", icon: Settings },
];

interface AppLayoutProps {
  children: React.ReactNode;
  activeSection: string;
  setActiveSection: (id: string) => void;
}

export function AppLayout({
  children,
  activeSection,
  setActiveSection,
}: AppLayoutProps) {
  const { settings, updateSettings, formulas, errors, tasks } = useStore();
  const { sidebarCollapsed } = settings;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Auto-collapse sidebar on tablet, expand on desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024 && window.innerWidth >= 768) {
        updateSettings({ sidebarCollapsed: true });
      } else if (window.innerWidth >= 1024) {
        updateSettings({ sidebarCollapsed: false });
      }
    };
    handleResize(); // Initial check
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [updateSettings]);

  // Calculate badges
  const shakyFormulas = formulas.filter((f) => f.confidence === "Shaky").length;
  const pendingErrors = errors.filter((e) => e.status === "Pending").length;
  const pendingTasks = tasks.filter((t) => !t.completed).length;

  const getBadgeCount = (id: string) => {
    if (id === "formula-sheets" && shakyFormulas > 0) return shakyFormulas;
    if (id === "error-journal" && pendingErrors > 0) return pendingErrors;
    if (id === "daily-checklist" && pendingTasks > 0) return pendingTasks;
    return null;
  };

  const getCountdownParts = () => {
    const now = new Date();
    const gateDate = new Date("2027-02-14T00:00:00");
    const diff = gateDate.getTime() - now.getTime();
    if (diff <= 0) return { d: "0", h: "00", m: "00", s: "00" };
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / 1000 / 60) % 60);
    const seconds = Math.floor((diff / 1000) % 60);
    return {
      d: days.toString(),
      h: hours.toString().padStart(2, "0"),
      m: minutes.toString().padStart(2, "0"),
      s: seconds.toString().padStart(2, "0"),
    };
  };

  const [countdown, setCountdown] = useState(getCountdownParts());

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(getCountdownParts());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-screen w-full bg-bg-primary text-text-primary overflow-hidden font-sans">
      <Toaster position="bottom-right" toastOptions={{
        style: { background: '#1A2942', color: '#E0E6ED', border: '1px solid #334B68' },
        className: 'font-sans'
      }} />
      {/* Mobile Menu Backdrop */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "flex flex-col bg-bg-primary border-r border-border transition-all duration-300 flex-shrink-0 z-50 fixed md:relative h-full",
          mobileMenuOpen ? "translate-x-0 w-64 shadow-2xl" : "-translate-x-full md:translate-x-0",
          !mobileMenuOpen && sidebarCollapsed ? "md:w-[64px]" : "md:w-[220px]"
        )}
      >
        <div className="p-4 border-b border-border flex justify-between items-center h-[60px]">
          <div
            className={cn(
              "flex items-center gap-2 text-accent-primary",
              !mobileMenuOpen && sidebarCollapsed && "justify-center w-full",
            )}
          >
            <div className="w-3 h-3 bg-accent-primary rounded-sm animate-pulse flex-shrink-0"></div>
            {(!sidebarCollapsed || mobileMenuOpen) && (
              <span className="font-mono font-bold tracking-tighter truncate text-sm md:text-base">
                CORE_OS v2.7
              </span>
            )}
          </div>
          {mobileMenuOpen && (
            <button className="md:hidden text-text-muted hover:text-white" onClick={() => setMobileMenuOpen(false)}>
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <nav className="flex-1 py-4 overflow-y-auto scrollbar-none flex flex-col">
          {(!sidebarCollapsed || mobileMenuOpen) && (
            <div className="px-4 py-2 text-[10px] uppercase tracking-widest text-text-muted font-bold">
              Navigation
            </div>
          )}
          <div className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive = activeSection === item.id;
              const badge = getBadgeCount(item.id);
              const showText = !sidebarCollapsed || mobileMenuOpen;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveSection(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center px-4 transition-colors group relative cursor-pointer min-h-[44px]", // touch target >= 44px
                    isActive
                      ? "bg-bg-border border-l-2 border-accent-primary opacity-100"
                      : "hover:bg-bg-card opacity-70 border-l-2 border-transparent",
                    !showText
                      ? "justify-center px-0"
                      : "justify-start gap-3",
                  )}
                  title={!showText ? item.label : undefined}
                >
                  <item.icon className="w-5 h-5 md:w-4 md:h-4 flex-shrink-0" />
                  {showText && (
                    <span
                      className={cn("text-sm md:text-sm text-left truncate", isActive ? "font-medium" : "")}
                    >
                      {item.label}
                    </span>
                  )}
                  {badge !== null && badge > 0 && showText && (
                    <span className="ml-auto bg-accent-danger text-[10px] px-1.5 py-0.5 rounded font-mono text-white">
                      {badge}
                    </span>
                  )}
                  {badge !== null && badge > 0 && !showText && (
                    <span className="absolute top-2 right-1.5 w-2.5 h-2.5 bg-accent-danger rounded-full border-2 border-bg-primary"></span>
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        <div className="p-4 border-t border-border bg-bg-card flex flex-col relative group">
          {(!sidebarCollapsed || mobileMenuOpen) ? (
            <>
              <div className="text-[10px] text-text-secondary font-mono hidden md:block">
                T-MINUS
              </div>
              <div className="text-sm md:text-lg font-mono font-bold text-accent-primary truncate">
                {countdown.d}:{countdown.h}:{countdown.m}:{countdown.s}
              </div>
              <div className="text-[10px] text-text-muted mt-1 hidden md:block">
                FEB 14 2027 // GATE EC
              </div>
            </>
          ) : (
            <div className="text-center font-mono text-xs text-accent-primary">
              {countdown.d}d
            </div>
          )}

          <button
            className="absolute top-2 right-2 text-text-muted hover:text-text-primary transition-colors hidden md:block opacity-0 group-hover:opacity-100 min-h-[44px] min-w-[44px] flex items-center justify-center"
            onClick={() =>
              updateSettings({ sidebarCollapsed: !sidebarCollapsed })
            }
            title="Toggle Sidebar"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-bg-primary h-full overflow-hidden">
        {/* Mobile Header for hamburger */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-border bg-bg-card h-[60px]">
          <div className="flex items-center gap-2">
            <button onClick={() => setMobileMenuOpen(true)} className="text-text-primary p-1 -ml-1">
              <Menu className="w-6 h-6" />
            </button>
            <span className="font-mono text-sm font-bold text-accent-primary tracking-tighter">
              CORE_OS v2.7
            </span>
          </div>
        </div>

        <MotivationAnchor />
        <div className="flex-1 overflow-y-auto p-4 md:p-6">{children}</div>
        <FooterStatsBar />
      </main>
    </div>
  );
}

function MotivationAnchor() {
  const { settings, updateSettings } = useStore();
  const collapsed = settings.motivationCollapsed;

  return (
    <div className={cn("bg-bg-card border-b border-border flex justify-between items-center shrink-0 transition-all", collapsed ? "p-1" : "p-3 md:p-4")}>
      {!collapsed && (
        <>
          <div>
            <div className="text-[10px] text-accent-primary font-mono tracking-widest uppercase">
              Active Mission
            </div>
            <div className="text-xs md:text-sm font-bold tracking-tight text-text-primary">
              TARGET: 90+ MARKS <span className="hidden sm:inline">// IIT/IISc M.TECH ELIGIBILITY</span>
            </div>
          </div>
          <div className="text-right hidden sm:block">
            <div className="text-[10px] text-text-secondary font-medium italic">
              "Did today move the needle on the 20% that matters?"
            </div>
          </div>
        </>
      )}
      <button 
        onClick={() => updateSettings({ motivationCollapsed: !collapsed })}
        className={cn("text-[10px] text-text-muted hover:text-text-primary font-mono min-h-[44px] px-2 flex items-center justify-center", collapsed && "w-full py-1")}
      >
        {collapsed ? "[ EXPAND MOTIVATION ]" : "[ COLLAPSE ]"}
      </button>
    </div>
  );
}

function FooterStatsBar() {
  return (
    <footer className="h-8 bg-bg-primary border-t border-border flex items-center px-4 justify-between text-[10px] font-mono shrink-0 hidden md:flex">
      <div className="flex gap-6">
        <span className="text-text-muted">
          STATUS: <span className="text-accent-success">ONLINE</span>
        </span>
        <span className="text-text-muted hidden lg:inline">
          MEM: <span className="text-text-primary">4.2MB / LOCAL_STORAGE</span>
        </span>
        <span className="text-text-muted hidden lg:inline">
          USER@GATE_OS:~${" "}
          <span className="animate-pulse text-accent-primary">_</span>
        </span>
      </div>
      <div className="flex gap-4">
        <span className="text-text-secondary">
          HOTKEYS: [N] NOTES [D] TASK [P] PYQ [E] ERROR [?] HELP
        </span>
      </div>
    </footer>
  );
}

