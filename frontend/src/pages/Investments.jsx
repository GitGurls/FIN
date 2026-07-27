import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, X, TrendingUp, TrendingDown } from "lucide-react";
import Layout from "../components/Layout";
import StatCard from "../components/StatCard";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";

const TYPES = ["stocks", "mutual_fund", "crypto", "gold", "fd", "real_estate", "other"];

const emptyForm = { name: "", type: "stocks", investedAmount: "", currentValue: "", purchaseDate: "", notes: "" };

const Investments = () => {
  const { user } = useAuth();
  const [investments, setInvestments] = useState([]);
  const [summary, setSummary] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const currency = user?.currency || "INR";

  const load = () => {
    api.get("/investments").then((res) => {
      setInvestments(res.data.investments);
      setSummary(res.data.summary);
    });
  };

  useEffect(() => {
    load();
  }, []);

  const fmt = (n) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }).format(n || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/investments", {
        ...form,
        investedAmount: Number(form.investedAmount),
        currentValue: Number(form.currentValue),
      });
      setForm(emptyForm);
      setShowForm(false);
      load();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    await api.delete(`/investments/${id}`);
    load();
  };

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-semibold">Investments</h1>
          <p className="text-mist-500 text-sm mt-1">Track your portfolio alongside your everyday finances.</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          <Plus size={18} /> Add
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard label="Total Invested" value={fmt(summary?.totalInvested)} accent="mint" />
        <StatCard label="Current Value" value={fmt(summary?.totalCurrent)} accent="violet" />
        <StatCard
          label="Gain / Loss"
          value={`${summary?.gainLoss >= 0 ? "+" : ""}${fmt(summary?.gainLoss)} (${(summary?.gainLossPct || 0).toFixed(1)}%)`}
          accent={summary?.gainLoss >= 0 ? "mint" : "coral"}
          icon={summary?.gainLoss >= 0 ? TrendingUp : TrendingDown}
        />
      </div>

      <div className="glass-card divide-y divide-glass">
        {investments.length === 0 && (
          <p className="text-sm text-mist-500 text-center py-12">No investments tracked yet.</p>
        )}
        {investments.map((inv) => {
          const gain = inv.currentValue - inv.investedAmount;
          return (
            <div key={inv._id} className="flex items-center justify-between px-5 py-4">
              <div>
                <p className="text-sm font-medium text-mist-100">{inv.name}</p>
                <p className="text-xs text-mist-500 capitalize">{inv.type.replace("_", " ")}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="stat-mono text-sm font-semibold">{fmt(inv.currentValue)}</p>
                  <p className={`text-xs ${gain >= 0 ? "text-mint-400" : "text-coral-400"}`}>
                    {gain >= 0 ? "+" : ""}
                    {fmt(gain)}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(inv._id)}
                  className="text-mist-500 hover:text-coral-400 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-ink-950/70 backdrop-blur-sm flex items-center justify-center p-6 z-50"
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-display font-semibold text-lg">Add Investment</h2>
                <button onClick={() => setShowForm(false)} className="text-mist-500 hover:text-mist-100">
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  required
                  placeholder="Name (e.g. HDFC Small Cap Fund)"
                  className="glass-input"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
                <select
                  className="glass-input"
                  value={form.type}
                  onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                >
                  {TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t.replace("_", " ")}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  required
                  placeholder="Invested amount"
                  className="glass-input"
                  value={form.investedAmount}
                  onChange={(e) => setForm((f) => ({ ...f, investedAmount: e.target.value }))}
                />
                <input
                  type="number"
                  required
                  placeholder="Current value"
                  className="glass-input"
                  value={form.currentValue}
                  onChange={(e) => setForm((f) => ({ ...f, currentValue: e.target.value }))}
                />
                <input
                  type="date"
                  className="glass-input"
                  value={form.purchaseDate}
                  onChange={(e) => setForm((f) => ({ ...f, purchaseDate: e.target.value }))}
                />
                <button type="submit" disabled={saving} className="btn-primary w-full">
                  {saving ? "Saving…" : "Save Investment"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
};

export default Investments;
