import { useState } from "react";
import { motion } from "framer-motion";
import { Save, Check } from "lucide-react";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";

const CURRENCIES = ["INR", "USD", "EUR", "GBP", "JPY", "AUD", "CAD", "SGD", "AED"];

const Settings = () => {
  const { user, refreshUser } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [currency, setCurrency] = useState(user?.currency || "INR");
  const [monthlyBudget, setMonthlyBudget] = useState(user?.monthlyBudget || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      await api.patch("/auth/me", {
        name,
        currency,
        monthlyBudget: Number(monthlyBudget) || 0,
      });
      await refreshUser();
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-2xl font-display font-semibold">Settings</h1>
        <p className="text-mist-500 text-sm mt-1">
          Set your monthly budget to unlock budget alerts and the live progress bar.
        </p>
      </div>

      <motion.form
        onSubmit={handleSave}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="glass-card p-6 max-w-md space-y-4"
      >
        <div>
          <label className="text-xs text-mist-500 mb-1 block">Name</label>
          <input className="glass-input" value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div>
          <label className="text-xs text-mist-500 mb-1 block">Currency</label>
          <select className="glass-input" value={currency} onChange={(e) => setCurrency(e.target.value)}>
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs text-mist-500 mb-1 block">Monthly Budget</label>
          <input
            type="number"
            placeholder="e.g. 20000"
            className="glass-input"
            value={monthlyBudget}
            onChange={(e) => setMonthlyBudget(e.target.value)}
          />
          <p className="text-xs text-mist-500 mt-1">
            You'll get a live alert at 90% and 100% of this amount each month.
          </p>
        </div>

        <button type="submit" disabled={saving} className="btn-primary w-full">
          {saved ? <Check size={16} /> : <Save size={16} />}
          {saved ? "Saved" : saving ? "Saving…" : "Save Settings"}
        </button>
      </motion.form>
    </Layout>
  );
};

export default Settings;