import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeftRight, Loader2 } from "lucide-react";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";

const CURRENCIES = ["INR", "USD", "EUR", "GBP", "JPY", "AUD", "CAD", "SGD", "AED"];

const Currency = () => {
  const { user } = useAuth();
  const [from, setFrom] = useState(user?.currency || "INR");
  const [to, setTo] = useState("USD");
  const [amount, setAmount] = useState(1000);
  const [rate, setRate] = useState(null);
  const [netWorth, setNetWorth] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/dashboard/summary").then((res) => setNetWorth(res.data.netWorth));
  }, []);

  const convert = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`https://api.frankfurter.dev/v1/latest?base=${from}&symbols=${to}`);
      if (!res.ok) throw new Error(`Rate lookup failed (${res.status})`);
      const data = await res.json();
      const unitRate = data.rates?.[to];
      if (unitRate == null) throw new Error("Currency pair not supported");
      setRate(unitRate * amount);
    } catch (err) {
      setError(err.message || "Couldn't fetch live rates right now — check your connection.");
      setRate(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    convert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from, to, amount]);

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-2xl font-display font-semibold">Currency Converter</h1>
        <p className="text-mist-500 text-sm mt-1">Live exchange rates for planning across currencies.</p>
      </div>

      <div className="glass-card p-6 max-w-xl">
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-3 items-end mb-6">
          <div>
            <label className="text-xs text-mist-500 mb-1 block">From</label>
            <select className="glass-input" value={from} onChange={(e) => setFrom(e.target.value)}>
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={() => {
              setFrom(to);
              setTo(from);
            }}
            className="btn-ghost px-3 mb-0.5 justify-self-center"
          >
            <ArrowLeftRight size={16} />
          </button>
          <div>
            <label className="text-xs text-mist-500 mb-1 block">To</label>
            <select className="glass-input" value={to} onChange={(e) => setTo(e.target.value)}>
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <label className="text-xs text-mist-500 mb-1 block">Amount</label>
        <input
          type="number"
          className="glass-input mb-6"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
        />

        <div className="text-center py-6 border-t border-glass">
          {loading ? (
            <Loader2 size={20} className="animate-spin text-mint-400 mx-auto" />
          ) : error ? (
            <p className="text-sm text-coral-400">{error}</p>
          ) : (
            <motion.p
              key={rate}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="stat-mono text-3xl font-semibold text-mint-400"
            >
              {rate?.toLocaleString(undefined, { maximumFractionDigits: 2 })} {to}
            </motion.p>
          )}
          <p className="text-xs text-mist-500 mt-1">
            {amount.toLocaleString()} {from} · rates via frankfurter.dev
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Currency;