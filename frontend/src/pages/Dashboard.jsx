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
import { SkeletonCard } from "../components/Skeleton";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import api from "../lib/api";

const fmt = (n, currency = "INR") =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }).format(
    n || 0
  );

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

const Dashboard = () => {
  const { user } = useAuth();
  const { socket, connected } = useSocket();
  const [summary, setSummary] = useState(null);
  const [trend, setTrend] = useState([]);
  const [byCategory, setByCategory] = useState([]);
  const [healthScore, setHealthScore] = useState(null);
  const [todaySpend, setTodaySpend] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadAll = useCallback(() => {
    api.get("/dashboard/summary").then((res) => setSummary(res.data));
    api.get("/dashboard/monthly-trend?months=6").then((res) => setTrend(res.data.trend));
    api.get("/dashboard/by-category?type=expense").then((res) => setByCategory(res.data.categories));
    api.get("/dashboard/health-score").then((res) => setHealthScore(res.data));

    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const to = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).toISOString();
    api
      .get("/transactions", { params: { type: "expense", from, to, limit: 100 } })
      .then((res) => setTodaySpend(res.data.items.reduce((s, t) => s + t.amount, 0)));
  }, []);

  useEffect(() => {
    setLoading(true);
    loadAll();
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, [loadAll]);

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

  if (loading) {
    return (
      <Layout>
        <div className="mb-8">
          <div className="h-7 w-56 rounded-lg bg-glass animate-pulse mb-2" />
          <div className="h-4 w-40 rounded-lg bg-glass animate-pulse" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
          <SkeletonCard className="h-56" />
          <SkeletonCard className="h-56" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <motion.div variants={container} initial="hidden" animate="show">
        <motion.div variants={item} className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-semibold">
              👋 {greeting()}, {user?.name?.split(" ")[0]}
            </h1>
            <p className="text-mist-500 text-sm mt-1">
              {todaySpend != null && todaySpend > 0
                ? `You've spent ${fmt(todaySpend, currency)} today.`
                : "Here's your financial pulse for today."}
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-mist-500">
            {connected ? <Wifi size={14} className="text-mint-400" /> : <WifiOff size={14} />}
            {connected ? "Live" : "Offline"}
          </div>
        </motion.div>

        <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
          <HealthScoreCard data={healthScore} loading={!healthScore} />
          <ChatWithExpenses />
        </motion.div>

        <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard label="Net Worth" value={fmt(summary?.netWorth, currency)} icon={Wallet} accent="mint" />
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
        </motion.div>

        {summary?.monthlyBudget > 0 && (
          <motion.div variants={item} className="mb-6">
            <BudgetProgress spent={summary.monthExpense} budget={summary.monthlyBudget} currency={currency} />
          </motion.div>
        )}

        <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <TrendChart data={trend} />
          <CategoryChart data={byCategory} />
        </motion.div>
      </motion.div>
    </Layout>
  );
};

export default Dashboard;