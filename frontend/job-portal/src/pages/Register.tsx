import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useLocation, useSearch } from "wouter";
import { useRegisterUser } from "@workspace/api-client-react";
import { useAuth } from "@/contexts/AuthContext";
import { Briefcase, Eye, EyeOff, Loader2, User, Building } from "lucide-react";

export default function Register() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const defaultRole = params.get("role") ?? "job_seeker";

  const { login } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"job_seeker" | "recruiter">(defaultRole as any);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const registerMutation = useRegisterUser({
    mutation: {
      onSuccess: (data: any) => {
        login(data.token, data.user);
        if (data.user.role === "recruiter") {
          setLocation("/recruiter");
        } else {
          setLocation("/seeker");
        }
      },
      onError: (err: any) => {
        setError(err?.data?.error ?? "Registration failed. Please try again.");
      },
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    registerMutation.mutate({ data: { name, email, password, role } });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-16 grid-bg">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full opacity-20"
          style={{ background: "radial-gradient(ellipse, #8B5CF6, transparent 70%)" }} />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 rounded-full opacity-15"
          style={{ background: "radial-gradient(ellipse, #00FFFF, transparent 70%)" }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center glow-cyan">
              <Briefcase size={20} className="text-black" />
            </div>
            <span className="text-2xl font-bold">
              <span className="text-cyan-400">Hire</span>
              <span className="text-purple-400">Sphere</span>
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white">Create your account</h1>
          <p className="text-gray-400 text-sm mt-1">Start your journey today</p>
        </div>

        <div className="glass-strong rounded-2xl p-8 border border-white/10">
          {/* Role Toggle */}
          <div className="flex gap-2 mb-6 p-1 rounded-xl bg-white/5">
            <button
              type="button"
              onClick={() => setRole("job_seeker")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                role === "job_seeker"
                  ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <User size={14} /> Job Seeker
            </button>
            <button
              type="button"
              onClick={() => setRole("recruiter")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                role === "recruiter"
                  ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Building size={14} /> Recruiter
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1.5">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                required
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  required
                  minLength={6}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 transition-all pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-400 text-sm p-3 rounded-xl bg-red-400/10 border border-red-400/20"
              >
                {error}
              </motion.p>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={registerMutation.isPending}
              className="w-full py-3 rounded-xl font-semibold text-black bg-gradient-to-r from-cyan-400 to-purple-500 flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              {registerMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : null}
              {registerMutation.isPending ? "Creating account..." : "Create Account"}
            </motion.button>
          </form>

          <p className="text-center text-gray-400 text-sm mt-6">
            Already have an account?{" "}
            <Link href="/login">
              <span className="text-cyan-400 hover:text-cyan-300 cursor-pointer">Sign in</span>
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
