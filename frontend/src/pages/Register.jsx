import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, UserPlus } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(name, email, password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink-900 bg-aura-mesh flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-card w-full max-w-md p-8"
      >
        <div className="flex items-center gap-2 mb-8">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-mint-400 to-violet-400 flex items-center justify-center">
            <Sparkles size={20} className="text-ink-950" />
          </div>
          <span className="font-display font-semibold text-xl">FinPilot AI</span>
        </div>

        <h1 className="text-2xl font-display font-semibold mb-1">Create your account</h1>
        <p className="text-mist-500 text-sm mb-6">Start tracking smarter, not harder.</p>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-coral-400/10 border border-coral-400/20 text-coral-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-mist-300 mb-1.5 block">Name</label>
            <input
              required
              className="glass-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="text-sm text-mist-300 mb-1.5 block">Email</label>
            <input
              type="email"
              required
              className="glass-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="text-sm text-mist-300 mb-1.5 block">Password</label>
            <input
              type="password"
              required
              minLength={6}
              className="glass-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
            <UserPlus size={18} />
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="text-sm text-mist-500 mt-6 text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-mint-400 hover:underline">
            Log in
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
