import { useState } from "react";
import { motion } from "framer-motion";
import { UploadCloud, Loader2, Check, ScanLine } from "lucide-react";
import Layout from "../components/Layout";
import api from "../lib/api";

const Receipts = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [suggested, setSuggested] = useState(null);
  const [receiptUrl, setReceiptUrl] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState("");

  const handleFile = (f) => {
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setSuggested(null);
    setConfirmed(false);
    setError("");
  };

  const handleScan = async () => {
    if (!file) return;
    setScanning(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("receipt", file);
      const res = await api.post("/receipts/scan", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSuggested(res.data.suggested);
      setReceiptUrl(res.data.receiptUrl);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Couldn't read this receipt — check the Gemini API key, or try a clearer image."
      );
    } finally {
      setScanning(false);
    }
  };

  const handleConfirm = async () => {
    await api.post("/receipts/confirm", { ...suggested, receiptUrl });
    setConfirmed(true);
  };

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-2xl font-display font-semibold">Scan Receipt</h1>
        <p className="text-mist-500 text-sm mt-1">
          Upload a photo — AI reads the merchant, amount and category for you.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="glass-card p-6">
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-glass rounded-xl2 h-64 cursor-pointer hover:border-mint-400/40 transition-colors overflow-hidden">
            {preview ? (
              <img src={preview} alt="Receipt preview" className="h-full w-full object-contain" />
            ) : (
              <div className="text-center">
                <UploadCloud size={32} className="mx-auto text-mist-500 mb-2" />
                <p className="text-sm text-mist-300">Click to upload a receipt</p>
                <p className="text-xs text-mist-500 mt-1">JPG, PNG up to 8MB</p>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFile(e.target.files[0])}
            />
          </label>

          <button
            onClick={handleScan}
            disabled={!file || scanning}
            className="btn-primary w-full mt-4"
          >
            {scanning ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Reading receipt…
              </>
            ) : (
              <>
                <ScanLine size={16} /> Scan with AI
              </>
            )}
          </button>

          {error && <p className="text-sm text-coral-400 mt-3">{error}</p>}
        </div>

        <div className="glass-card p-6">
          <span className="text-xs uppercase tracking-wide text-mist-500 mb-4 block">
            AI-suggested transaction
          </span>

          {!suggested && (
            <p className="text-sm text-mist-500 py-16 text-center">
              Scan a receipt to see the extracted details here.
            </p>
          )}

          {suggested && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <div>
                <label className="text-xs text-mist-500">Amount</label>
                <input
                  className="glass-input mt-1"
                  type="number"
                  value={suggested.amount}
                  onChange={(e) => setSuggested((s) => ({ ...s, amount: Number(e.target.value) }))}
                />
              </div>
              <div>
                <label className="text-xs text-mist-500">Category</label>
                <input
                  className="glass-input mt-1"
                  value={suggested.category}
                  onChange={(e) => setSuggested((s) => ({ ...s, category: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-xs text-mist-500">Merchant / Note</label>
                <input
                  className="glass-input mt-1"
                  value={suggested.note}
                  onChange={(e) => setSuggested((s) => ({ ...s, note: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-xs text-mist-500">Date</label>
                <input
                  type="date"
                  className="glass-input mt-1"
                  value={suggested.date}
                  onChange={(e) => setSuggested((s) => ({ ...s, date: e.target.value }))}
                />
              </div>

              {confirmed ? (
                <div className="flex items-center gap-2 text-mint-400 text-sm justify-center py-2">
                  <Check size={16} /> Transaction added
                </div>
              ) : (
                <button onClick={handleConfirm} className="btn-primary w-full">
                  <Check size={16} /> Confirm & Add Transaction
                </button>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Receipts;
