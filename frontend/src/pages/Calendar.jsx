import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import Layout from "../components/Layout";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const Calendar = () => {
  const { user } = useAuth();
  const [cursor, setCursor] = useState(new Date());
  const [heatmap, setHeatmap] = useState({});
  const [dayTransactions, setDayTransactions] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const currency = user?.currency || "INR";

  useEffect(() => {
    api.get(`/dashboard/heatmap?year=${year}`).then((res) => {
      const map = {};
      res.data.heatmap.forEach((h) => {
        map[h.date] = h.total;
      });
      setHeatmap(map);
    });
  }, [year]);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstWeekday = new Date(year, month, 1).getDay();

  const maxSpend = useMemo(() => Math.max(...Object.values(heatmap), 1), [heatmap]);

  const intensity = (amount) => {
    if (!amount) return "bg-glass";
    const ratio = amount / maxSpend;
    if (ratio > 0.66) return "bg-coral-400/70";
    if (ratio > 0.33) return "bg-gold-400/60";
    return "bg-mint-400/40";
  };

  const dateKey = (d) => {
    const m = String(month + 1).padStart(2, "0");
    const day = String(d).padStart(2, "0");
    return `${year}-${m}-${day}`;
  };

  const openDay = async (d) => {
    const key = dateKey(d);
    setSelectedDay(key);
    const from = `${key}T00:00:00.000Z`;
    const to = `${key}T23:59:59.999Z`;
    const res = await api.get("/transactions", { params: { from, to, limit: 50 } });
    setDayTransactions(res.data.items);
  };

  const changeMonth = (delta) => setCursor(new Date(year, month + delta, 1));

  const fmt = (n) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }).format(n);

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-semibold">Calendar</h1>
          <p className="text-mist-500 text-sm mt-1">Spot spending patterns across the month.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => changeMonth(-1)} className="btn-ghost px-3">
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm font-medium w-32 text-center">
            {MONTH_NAMES[month]} {year}
          </span>
          <button onClick={() => changeMonth(1)} className="btn-ghost px-3">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="glass-card p-6">
        <div className="grid grid-cols-7 gap-2 mb-2 text-xs text-mist-500 text-center">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: firstWeekday }).map((_, i) => (
            <div key={`pad-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => {
            const key = dateKey(d);
            const amount = heatmap[key] || 0;
            return (
              <motion.button
                key={d}
                whileHover={{ scale: 1.05 }}
                onClick={() => openDay(d)}
                className={`aspect-square rounded-lg flex flex-col items-center justify-center text-xs border border-glass ${intensity(
                  amount
                )} ${selectedDay === key ? "ring-2 ring-mint-400" : ""}`}
              >
                <span className="text-mist-100 font-medium">{d}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {selectedDay && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 mt-5">
          <div className="flex items-center gap-2 mb-4">
            <CalendarDays size={16} className="text-mint-400" />
            <span className="text-sm font-medium">
              {new Date(selectedDay).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
            </span>
          </div>
          {dayTransactions?.length ? (
            <div className="space-y-2">
              {dayTransactions.map((t) => (
                <div key={t._id} className="flex justify-between text-sm py-2 border-b border-glass last:border-0">
                  <span className="text-mist-300">
                    {t.category} {t.note ? `· ${t.note}` : ""}
                  </span>
                  <span className={t.type === "income" ? "text-mint-400" : "text-coral-400"}>
                    {t.type === "income" ? "+" : "-"}
                    {fmt(t.amount)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-mist-500">No transactions on this day.</p>
          )}
        </motion.div>
      )}
    </Layout>
  );
};

export default Calendar;
