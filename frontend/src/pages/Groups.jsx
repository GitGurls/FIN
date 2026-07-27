import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Users, Plane, X, ChevronRight } from "lucide-react";
import Layout from "../components/Layout";
import api from "../lib/api";
import { useSocket } from "../context/SocketContext";

const Groups = () => {
  const { socket } = useSocket();
  const [groups, setGroups] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState("family");
  const [saving, setSaving] = useState(false);

  const load = () => api.get("/groups").then((res) => setGroups(res.data.groups));

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on("group:invited", load);
    return () => socket.off("group:invited", load);
  }, [socket]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/groups", { name, type });
      setName("");
      setShowForm(false);
      load();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-semibold">Shared Wallets & Trips</h1>
          <p className="text-mist-500 text-sm mt-1">
            Split family budgets or trip expenses with live, shared updates.
          </p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          <Plus size={18} /> New
        </button>
      </div>

      {groups.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Users size={28} className="mx-auto text-mist-500 mb-3" />
          <p className="text-sm text-mist-500">
            No shared wallets yet — create a Family Wallet or a Trip to split expenses with others.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {groups.map((g) => (
            <Link key={g._id} to={`/groups/${g._id}`}>
              <motion.div whileHover={{ y: -2 }} className="glass-card p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-mint-400/30 to-violet-400/30 flex items-center justify-center">
                    {g.type === "trip" ? (
                      <Plane size={18} className="text-violet-400" />
                    ) : (
                      <Users size={18} className="text-mint-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-mist-100">{g.name}</p>
                    <p className="text-xs text-mist-500 capitalize">
                      {g.type} · {g.members.length} member{g.members.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-mist-500" />
              </motion.div>
            </Link>
          ))}
        </div>
      )}

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
                <h2 className="font-display font-semibold text-lg">New Shared Wallet</h2>
                <button onClick={() => setShowForm(false)} className="text-mist-500 hover:text-mist-100">
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="flex gap-2">
                  {[
                    { value: "family", label: "Family Wallet", icon: Users },
                    { value: "trip", label: "Trip", icon: Plane },
                  ].map(({ value, label, icon: Icon }) => (
                    <button
                      type="button"
                      key={value}
                      onClick={() => setType(value)}
                      className={`flex-1 py-3 rounded-xl text-sm font-medium border flex flex-col items-center gap-1 transition-colors ${
                        type === value ? "border-mint-400/40 text-mint-400 bg-mint-400/10" : "border-glass text-mist-500"
                      }`}
                    >
                      <Icon size={16} />
                      {label}
                    </button>
                  ))}
                </div>
                <input
                  required
                  placeholder={type === "trip" ? "e.g. Goa Trip 2026" : "e.g. The Sharma Family"}
                  className="glass-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <button type="submit" disabled={saving} className="btn-primary w-full">
                  {saving ? "Creating…" : "Create"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
};

export default Groups;
