import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import jsPDF from "jspdf";
import { FileDown, Loader2, Sparkles } from "lucide-react";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";

const Reports = () => {
  const { user } = useAuth();
  const [monthOffset, setMonthOffset] = useState(0);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const currency = user?.currency || "INR";

  const targetDate = new Date();
  targetDate.setMonth(targetDate.getMonth() - monthOffset);
  const monthParam = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, "0")}`;
  const monthLabel = targetDate.toLocaleDateString("en-IN", { month: "long", year: "numeric" });

  useEffect(() => {
    setLoading(true);
    api
      .get(`/dashboard/monthly-report?month=${monthParam}`)
      .then((res) => setReport(res.data))
      .finally(() => setLoading(false));
  }, [monthParam]);

  const fmt = (n) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }).format(n || 0);

  const downloadPDF = () => {
    if (!report) return;
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("FinPilot AI — Monthly Report", 14, 20);
    doc.setFontSize(12);
    doc.setTextColor(90);
    doc.text(monthLabel, 14, 28);

    doc.setTextColor(20);
    doc.setFontSize(11);
    const narrative = doc.splitTextToSize(report.narrative, 180);
    doc.text(narrative, 14, 42);

    let y = 42 + narrative.length * 6 + 10;
    doc.setFontSize(13);
    doc.text("Summary", 14, y);
    y += 8;
    doc.setFontSize(10);
    [
      `Income: ${fmt(report.stats.income)}`,
      `Expense: ${fmt(report.stats.expense)}`,
      `Savings: ${fmt(report.stats.savings)}`,
      `Transactions: ${report.stats.transactionCount}`,
    ].forEach((line) => {
      doc.text(line, 14, y);
      y += 7;
    });

    y += 4;
    doc.setFontSize(13);
    doc.text("Top Categories", 14, y);
    y += 8;
    doc.setFontSize(10);
    report.stats.topCategories.forEach((c) => {
      doc.text(`${c.category}: ${fmt(c.total)}`, 14, y);
      y += 7;
    });

    doc.save(`finpilot-report-${monthParam}.pdf`);
  };

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-semibold">Monthly Report</h1>
          <p className="text-mist-500 text-sm mt-1">AI-generated summary of {monthLabel}.</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            className="glass-input w-auto"
            value={monthOffset}
            onChange={(e) => setMonthOffset(Number(e.target.value))}
          >
            {Array.from({ length: 6 }, (_, i) => {
              const d = new Date();
              d.setMonth(d.getMonth() - i);
              return (
                <option key={i} value={i}>
                  {d.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
                </option>
              );
            })}
          </select>
          <button onClick={downloadPDF} disabled={!report} className="btn-primary">
            <FileDown size={16} /> PDF
          </button>
        </div>
      </div>

      {loading ? (
        <div className="glass-card p-10 flex justify-center">
          <Loader2 size={22} className="animate-spin text-mint-400" />
        </div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={16} className="text-violet-400" />
              <span className="text-xs uppercase tracking-wide text-mist-500">AI Narrative</span>
            </div>
            <p className="text-sm text-mist-300 leading-relaxed">{report?.narrative}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="glass-card p-5">
              <p className="text-xs text-mist-500 mb-1">Income</p>
              <p className="stat-mono text-xl font-semibold text-mint-400">{fmt(report?.stats.income)}</p>
            </div>
            <div className="glass-card p-5">
              <p className="text-xs text-mist-500 mb-1">Expense</p>
              <p className="stat-mono text-xl font-semibold text-coral-400">{fmt(report?.stats.expense)}</p>
            </div>
            <div className="glass-card p-5">
              <p className="text-xs text-mist-500 mb-1">Savings</p>
              <p className="stat-mono text-xl font-semibold text-gold-400">{fmt(report?.stats.savings)}</p>
            </div>
          </div>

          <div className="glass-card p-6">
            <span className="text-xs uppercase tracking-wide text-mist-500 mb-4 block">Top Categories</span>
            {report?.stats.topCategories.length ? (
              <div className="space-y-2">
                {report.stats.topCategories.map((c) => (
                  <div key={c.category} className="flex justify-between text-sm py-2 border-b border-glass last:border-0">
                    <span className="text-mist-300">{c.category}</span>
                    <span className="stat-mono text-mist-100">{fmt(c.total)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-mist-500">No expenses recorded this month.</p>
            )}
          </div>
        </motion.div>
      )}
    </Layout>
  );
};

export default Reports;
