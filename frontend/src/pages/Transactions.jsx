import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, X, Mic, FileDown, FileSpreadsheet } from "lucide-react";
import Layout from "../components/Layout";
import VoiceEntry from "../components/VoiceEntry";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { exportTransactionsToPDF, exportTransactionsToExcel } from "../lib/export";

const emptyForm = { type: "expense", amount: "", category: "", note: "", date: "" };

const Transactions = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filterType, setFilterType] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const params = filterType ? { type: filterType } : {};
    const res = await api.get("/transactions", { params });
    setItems(res.data.items);
  };

  useEffect(() => {
    load();
    api.get("/categories").then((res) => setCategories(res.data.categories));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterType]);

  useEffect(() => {
    if (!socket) return;
    const refresh = () => load();
    socket.on("transaction:created", refresh);
    socket.on("transaction:updated", refresh);
    socket.on("transaction:deleted", refresh);
    return () => {
      socket.off("transaction:created", refresh);
      socket.off("transaction:updated", refresh);
      socket.off("transaction:deleted", refresh);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, filterType]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/transactions", {
        ...form,
        amount: Number(form.amount),
        date: form.date || undefined,
      });
      setForm(emptyForm);
      setShowForm(false);
      load();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    await api.delete(`/transactions/${id}`);
    load();
  };

  const relevantCategories = categories.filter((c) => c.type === form.type);
  const currency = user?.currency || "INR";
  const fmt = (n) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }).format(n);

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-semibold">Transactions</h1>
          <p className="text-mist-500 text-sm mt-1">All your income and expenses in one place.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => exportTransactionsToPDF(items, currency)}
            className="btn-ghost"
            title="Export as PDF"
          >
            <FileDown size={16} />
          </button>
          <button
            onClick={() => exportTransactionsToExcel(items)}
            className="btn-ghost"
            title="Export as Excel"
          >
            <FileSpreadsheet size={16} />
          </button>
          <button onClick={() => setVoiceOpen(true)} className="btn-ghost">
            <Mic size={16} /> Voice
          </button>
          <button onClick={() => setShowForm(true)} className="btn-primary">
            <Plus size={18} /> Add
          </button>
        </div>
      </div>

      <VoiceEntry open={voiceOpen} onClose={() => setVoiceOpen(false)} onConfirmed={load} />

      <div className="flex gap-2 mb-4">
        {["", "income", "expense"].map((t) => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              filterType === t
                ? "border-mint-400/40 text-mint-400 bg-mint-400/10"
                : "border-glass text-mist-500 hover:text-mist-100"
            }`}
          >
            {t === "" ? "All" : t === "income" ? "Income" : "Expense"}
          </button>
        ))}
      </div>

      <div className="glass-card divide-y divide-glass">
        {items.length === 0 && (
          <p className="text-sm text-mist-500 text-center py-12">
            No transactions yet — add your first one to see it here.
          </p>
        )}
        {items.map((t) => (
          <div key={t._id} className="flex items-center justify-between px-5 py-4">
            <div>
              <p className="text-sm font-medium text-mist-100">{t.category}</p>
              <p className="text-xs text-mist-500">
                {new Date(t.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                {t.note ? ` · ${t.note}` : ""}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span
                className={`stat-mono text-sm font-semibold ${
                  t.type === "income" ? "text-mint-400" : "text-coral-400"
                }`}
              >
                {t.type === "income" ? "+" : "-"}
                {fmt(t.amount)}
              </span>
              <button
                onClick={() => handleDelete(t._id)}
                className="text-mist-500 hover:text-coral-400 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
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
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-display font-semibold text-lg">Add Transaction</h2>
                <button onClick={() => setShowForm(false)} className="text-mist-500 hover:text-mist-100">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex gap-2">
                  {["expense", "income"].map((t) => (
                    <button
                      type="button"
                      key={t}
                      onClick={() => setForm((f) => ({ ...f, type: t, category: "" }))}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                        form.type === t
                          ? "border-mint-400/40 text-mint-400 bg-mint-400/10"
                          : "border-glass text-mist-500"
                      }`}
                    >
                      {t === "income" ? "Income" : "Expense"}
                    </button>
                  ))}
                </div>

                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="Amount"
                  className="glass-input"
                  value={form.amount}
                  onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                />

                <select
                  required
                  className="glass-input"
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                >
                  <option value="">Select category</option>
                  {relevantCategories.map((c) => (
                    <option key={c._id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>

                <input
                  type="date"
                  className="glass-input"
                  value={form.date}
                  onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                />

                <input
                  placeholder="Note (optional)"
                  className="glass-input"
                  value={form.note}
                  onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                />

                <button type="submit" disabled={saving} className="btn-primary w-full">
                  {saving ? "Saving…" : "Save Transaction"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
};

export default Transactions;
