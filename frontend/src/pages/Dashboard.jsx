import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Wallet, TrendingUp, TrendingDown, PiggyBank, Wifi, WifiOff } from "lucide-react";
import Layout from "../components/Layout";
import StatCard from "../components/StatCard";
import HealthScoreCard from "../components/HealthScoreCard";
import ChatWithExpenses from "../components/ChatWithExpenses";
import TrendChart from "../components/TrendChart";
import CategoryChart from "../components/CategoryChart";
import BudgetProgress from "../components/BudgetProgress";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import api from "../lib/api";

const fmt = (n, currency = "INR") =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }).format(
    n || 0
  );

const Dashboard = () => {
  const { user } = useAuth();
  const { socket, connected } = useSocket();
  const [summary, setSummary] = useState(null);
  const [trend, setTrend] = useState([]);
  const [byCategory, setByCategory] = useState([]);
  const [healthScore, setHealthScore] = useState(null);
  const [loadingScore, setLoadingScore] = useState(true);

  const loadAll = useCallback(() => {
    api.get("/dashboard/summary").then((res) => setSummary(res.data));
    api.get("/dashboard/monthly-trend?months=6").then((res) => setTrend(res.data.trend));
    api.get("/dashboard/by-category?type=expense").then((res) => setByCategory(res.data.categories));
    api.get("/dashboard/health-score").then((res) => setHealthScore(res.data));
  }, []);

  useEffect(() => {
    setLoadingScore(true);
    loadAll();
    setLoadingScore(false);
  }, [loadAll]);

  // Live updates: any transaction change (this tab, another tab, or another device) refreshes the dashboard.
  useEffect(() => {
    if (!socket) return;
    const refresh = () => loadAll();
    socket.on("transaction:created", refresh);
    socket.on("transaction:updated", refresh);
    socket.on("transaction:deleted", refresh);
    return () => {
      socket.off("transaction:created", refresh);
      socket.off("transaction:updated", refresh);
      socket.off("transaction:deleted", refresh);
    };
  }, [socket, loadAll]);

  const currency = user?.currency || "INR";

  return (
    <Layout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-semibold">
              Welcome back, {user?.name?.split(" ")[0]}
            </h1>
            <p className="text-mist-500 text-sm mt-1">Here's your financial pulse for today.</p>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-mist-500">
            {connected ? <Wifi size={14} className="text-mint-400" /> : <WifiOff size={14} />}
            {connected ? "Live" : "Offline"}
          </div>
        </div>

        {/* Hero row: Health Score + Chat, the two center-piece differentiators */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
          <HealthScoreCard data={healthScore} loading={loadingScore} />
          <ChatWithExpenses />
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            label="Net Worth"
            value={fmt(summary?.netWorth, currency)}
            icon={Wallet}
            accent="mint"
          />
          <StatCard
            label="This Month Income"
            value={fmt(summary?.monthIncome, currency)}
            icon={TrendingUp}
            accent="mint"
          />
          <StatCard
            label="This Month Expense"
            value={fmt(summary?.monthExpense, currency)}
            icon={TrendingDown}
            accent="coral"
          />
          <StatCard
            label="Budget Remaining"
            value={fmt(summary?.budgetRemaining, currency)}
            sublabel={summary?.monthlyBudget ? `of ${fmt(summary.monthlyBudget, currency)}` : "No budget set"}
            icon={PiggyBank}
            accent="gold"
          />
        </div>

        {summary?.monthlyBudget > 0 && (
          <div className="mb-6">
            <BudgetProgress spent={summary.monthExpense} budget={summary.monthlyBudget} currency={currency} />
          </div>
        )}

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <TrendChart data={trend} />
          <CategoryChart data={byCategory} />
        </div>
      </motion.div>
    </Layout>
  );
};

export default Dashboard;
