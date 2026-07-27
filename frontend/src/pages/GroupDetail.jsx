import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, UserPlus, Plus, X, ArrowRight } from "lucide-react";
import Layout from "../components/Layout";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";

const GroupDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket } = useSocket();

  const [group, setGroup] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteError, setInviteError] = useState("");
  const [showExpense, setShowExpense] = useState(false);
  const [form, setForm] = useState({ amount: "", category: "", note: "" });
  const [saving, setSaving] = useState(false);

  const currency = group?.currency || "INR";
  const fmt = (n) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }).format(n || 0);

  const loadAll = () => {
    api.get(`/groups/${id}`).then((res) => setGroup(res.data.group));
    api.get(`/groups/${id}/transactions`).then((res) => setTransactions(res.data.transactions));
    api.get(`/groups/${id}/dashboard`).then((res) => setDashboard(res.data));
  };

  useEffect(() => {
    loadAll();
  }, [id]);

  useEffect(() => {
    if (!socket) return;
    const handler = (payload) => {
      if (payload.groupId === id) loadAll();
    };
    socket.on("group:transaction:created", handler);
    return () => socket.off("group:transaction:created", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, id]);

  const handleInvite = async (e) => {
    e.preventDefault();
    setInviteError("");
    try {
      await api.post(`/groups/${id}/invite`, { email: inviteEmail });
      setInviteEmail("");
      setShowInvite(false);
      loadAll();
    } catch (err) {
      setInviteError(err.response?.data?.message || "Couldn't invite this person");
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post(`/groups/${id}/transactions`, { ...form, amount: Number(form.amount) });
      setForm({ amount: "", category: "", note: "" });
      setShowExpense(false);
      loadAll();
    } finally {
      setSaving(false);
    }
  };

  if (!group) {
    return (
      <Layout>
        <p className="text-mist-500 text-sm">Loading…</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <button
        onClick={() => navigate("/groups")}
        className="flex items-center gap-2 text-sm text-mist-500 hover:text-mist-100 mb-4"
      >
        <ArrowLeft size={16} /> Back to Shared Wallets
      </button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-semibold">{group.name}</h1>
          <p className="text-mist-500 text-sm mt-1 capitalize">
            {group.type} · {group.members.length} members
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowInvite(true)} className="btn-ghost">
            <UserPlus size={16} /> Invite
          </button>
          <button onClick={() => setShowExpense(true)} className="btn-primary">
            <Plus size={16} /> Add Expense
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
        <div className="glass-card p-6">
          <span className="text-xs uppercase tracking-wide text-mist-500 mb-4 block">Members</span>
          <div className="space-y-3">
            {group.members.map((m) => (
              <div key={m.user._id} className="flex items-center justify-between text-sm">
                <span className="text-mist-100">
                  {m.user.name} {m.user._id === user?.id ? "(you)" : ""}
                </span>
                <span className="text-xs text-mist-500 capitalize">{m.role}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-6">
          <span className="text-xs uppercase tracking-wide text-mist-500 mb-4 block">
            Balances · Total spent: {fmt(dashboard?.totalSpent)}
          </span>
          <div className="space-y-2">
            {dashboard?.memberBalances.map((b) => (
              <div key={b.user.id} className="flex justify-between text-sm">
                <span className="text-mist-300">{b.user.name}</span>
                <span className={b.balance >= 0 ? "text-mint-400" : "text-coral-400"}>
                  {b.balance >= 0 ? "+" : ""}
                  {fmt(b.balance)}
                </span>
              </div>
            ))}
          </div>
          {dashboard?.settlements.length > 0 && (
            <div className="mt-4 pt-4 border-t border-glass space-y-2">
              <span className="text-xs text-mist-500">Suggested settlements</span>
              {dashboard.settlements.map((s, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-mist-300">
                  {s.from} <ArrowRight size={12} className="text-mist-500" /> {s.to}
                  <span className="ml-auto stat-mono text-gold-400">{fmt(s.amount)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="glass-card divide-y divide-glass">
        {transactions.length === 0 && (
          <p className="text-sm text-mist-500 text-center py-12">No shared expenses yet.</p>
        )}
        {transactions.map((t) => (
          <div key={t._id} className="flex items-center justify-between px-5 py-4">
            <div>
              <p className="text-sm font-medium text-mist-100">{t.category}</p>
              <p className="text-xs text-mist-500">
                Paid by {t.paidBy?.name || "someone"} ·{" "}
                {new Date(t.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                {t.note ? ` · ${t.note}` : ""}
              </p>
            </div>
            <span className="stat-mono text-sm font-semibold text-coral-400">-{fmt(t.amount)}</span>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {showInvite && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-ink-950/70 backdrop-blur-sm flex items-center justify-center p-6 z-50"
            onClick={() => setShowInvite(false)}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6 w-full max-w-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-semibold text-lg">Invite Member</h2>
                <button onClick={() => setShowInvite(false)} className="text-mist-500 hover:text-mist-100">
                  <X size={18} />
                </button>
              </div>
              <p className="text-xs text-mist-500 mb-3">They must already have a FinPilot AI account.</p>
              <form onSubmit={handleInvite} className="space-y-3">
                <input
                  type="email"
                  required
                  placeholder="their@email.com"
                  className="glass-input"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
                {inviteError && <p className="text-xs text-coral-400">{inviteError}</p>}
                <button type="submit" className="btn-primary w-full">
                  Send Invite
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}

        {showExpense && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-ink-950/70 backdrop-blur-sm flex items-center justify-center p-6 z-50"
            onClick={() => setShowExpense(false)}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6 w-full max-w-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-semibold text-lg">Add Shared Expense</h2>
                <button onClick={() => setShowExpense(false)} className="text-mist-500 hover:text-mist-100">
                  <X size={18} />
                </button>
              </div>
              <p className="text-xs text-mist-500 mb-3">Split equally among all {group.members.length} members.</p>
              <form onSubmit={handleAddExpense} className="space-y-3">
                <input
                  type="number"
                  required
                  placeholder="Amount"
                  className="glass-input"
                  value={form.amount}
                  onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                />
                <input
                  required
                  placeholder="Category (e.g. Grocery, Hotel)"
                  className="glass-input"
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                />
                <input
                  placeholder="Note (optional)"
                  className="glass-input"
                  value={form.note}
                  onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                />
                <button type="submit" disabled={saving} className="btn-primary w-full">
                  {saving ? "Adding…" : "Add & Split"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
};

export default GroupDetail;
