import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
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
  ChevronDown,
  Grid3x3,
  X,
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

const bottomNavItems = navItems.slice(0, 4);
const moreNavItems = navItems.slice(4);

const initials = (name = "") =>
  name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-ink-900 bg-aura-mesh flex">
      <NotificationToasts />

      {/* Desktop sidebar */}
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

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar — profile dropdown, all screen sizes */}
        <header className="flex items-center justify-between md:justify-end px-5 md:px-10 py-4 border-b border-glass md:border-none">
          <div className="flex items-center gap-2 md:hidden">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-mint-400 to-violet-400 flex items-center justify-center">
              <Sparkles size={16} className="text-ink-950" />
            </div>
            <span className="font-display font-semibold text-mist-100">FinPilot AI</span>
          </div>

          <div className="relative">
            <button
              onClick={() => setProfileOpen((o) => !o)}
              className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border border-glass hover-bg-glass transition-colors"
            >
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-mint-400/40 to-violet-400/40 flex items-center justify-center text-xs font-semibold text-mist-100">
                {initials(user?.name)}
              </div>
              <span className="text-sm text-mist-100 hidden sm:inline">{user?.name?.split(" ")[0]}</span>
              <ChevronDown size={14} className="text-mist-500" />
            </button>

            <AnimatePresence>
              {profileOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="absolute right-0 mt-2 w-52 glass-card p-2 z-50"
                  >
                    <p className="text-sm text-mist-100 font-medium truncate px-3 pt-2">{user?.name}</p>
                    <p className="text-xs text-mist-500 truncate px-3 pb-2 mb-1 border-b border-glass">
                      {user?.email}
                    </p>
                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        toggleTheme();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-mist-300 hover-bg-glass transition-colors md:hidden"
                    >
                      {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
                      {theme === "dark" ? "Light mode" : "Dark mode"}
                    </button>
                    <NavLink
                      to="/settings"
                      onClick={() => setProfileOpen(false)}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-mist-300 hover-bg-glass transition-colors"
                    >
                      <SettingsIcon size={15} />
                      Settings
                    </NavLink>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-coral-400 hover-bg-glass transition-colors"
                    >
                      <LogOut size={15} />
                      Log out
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </header>

        <main className="flex-1 p-5 md:p-10 max-w-6xl mx-auto w-full pb-24 md:pb-10">{children}</main>
      </div>

      {/* Mobile bottom navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-ink-900/95 backdrop-blur-xl border-t border-glass flex items-center justify-around px-2 py-2">
        {bottomNavItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-[10px] font-medium transition-colors ${
                isActive ? "text-mint-400" : "text-mist-500"
              }`
            }
          >
            <Icon size={20} />
            {label.split(" ")[0]}
          </NavLink>
        ))}
        <button
          onClick={() => setMoreOpen(true)}
          className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-[10px] font-medium text-mist-500"
        >
          <Grid3x3 size={20} />
          More
        </button>
      </nav>

      {/* Mobile "More" sheet */}
      <AnimatePresence>
        {moreOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="md:hidden fixed inset-0 bg-ink-950/70 backdrop-blur-sm z-[70] flex items-end"
            onClick={() => setMoreOpen(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card w-full rounded-b-none p-5 pb-8"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-semibold">More</h3>
                <button onClick={() => setMoreOpen(false)} className="text-mist-500">
                  <X size={18} />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {moreNavItems.map(({ to, label, icon: Icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={() => setMoreOpen(false)}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl border border-glass text-mist-300 text-xs text-center"
                  >
                    <Icon size={20} className="text-mint-400" />
                    {label}
                  </NavLink>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Layout;