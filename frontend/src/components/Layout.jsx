import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Receipt,
  Wallet,
  LogOut,
  Sparkles,
  CalendarDays,
  TrendingUp,
  Users,
  FileText,
  Coins,
  Settings as SettingsIcon,
  Sun,
  Moon,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import NotificationToasts from "./NotificationToasts";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/transactions", label: "Transactions", icon: Wallet },
  { to: "/receipts", label: "Scan Receipt", icon: Receipt },
  { to: "/calendar", label: "Calendar", icon: CalendarDays },
  { to: "/investments", label: "Investments", icon: TrendingUp },
  { to: "/groups", label: "Shared Wallets", icon: Users },
  { to: "/currency", label: "Currency", icon: Coins },
  { to: "/reports", label: "Monthly Report", icon: FileText },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
];

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-ink-900 bg-aura-mesh flex">
      <NotificationToasts />
      <aside className="w-64 shrink-0 border-r border-glass p-6 hidden md:flex md:flex-col">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-mint-400 to-violet-400 flex items-center justify-center">
              <Sparkles size={18} className="text-ink-950" />
            </div>
            <span className="font-display font-semibold text-lg text-mist-100">FinPilot AI</span>
          </div>
          <button
            onClick={toggleTheme}
            className="text-mist-500 hover:text-mist-100 transition-colors"
            title="Toggle theme"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-glass text-mint-400 border border-glass"
                    : "text-mist-500 hover:text-mist-100 hover-bg-glass"
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="pt-6 border-t border-glass">
          <p className="text-sm text-mist-100 font-medium truncate">{user?.name}</p>
          <p className="text-xs text-mist-500 truncate mb-4">{user?.email}</p>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-mist-500 hover:text-coral-400 transition-colors"
          >
            <LogOut size={16} />
            Log out
          </button>
        </div>
      </aside>

      <main className="flex-1 p-5 md:p-10 max-w-6xl mx-auto w-full">{children}</main>
    </div>
  );
};

export default Layout;