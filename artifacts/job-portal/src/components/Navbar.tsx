import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Briefcase, LogOut, User, BarChart3, FileText, Search } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  const navLinks = user
    ? user.role === "recruiter" || user.role === "admin"
      ? [
          { href: "/jobs", label: "Browse Jobs", icon: <Search size={16} /> },
          { href: "/recruiter", label: "Dashboard", icon: <BarChart3 size={16} /> },
        ]
      : [
          { href: "/jobs", label: "Find Jobs", icon: <Search size={16} /> },
          { href: "/seeker", label: "Dashboard", icon: <BarChart3 size={16} /> },
          { href: "/resume", label: "My Resumes", icon: <FileText size={16} /> },
          { href: "/ats", label: "ATS Analyzer", icon: <BarChart3 size={16} /> },
        ]
    : [
        { href: "/jobs", label: "Browse Jobs", icon: <Search size={16} /> },
      ];

  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 glass-strong border-b border-white/10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/">
            <motion.div
              className="flex items-center gap-2 cursor-pointer"
              whileHover={{ scale: 1.02 }}
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center glow-cyan">
                <Briefcase size={16} className="text-black" />
              </div>
              <span className="font-bold text-lg text-white">
                <span className="text-glow-cyan text-cyan-400">Nexus</span>
                <span className="text-purple-400">Jobs</span>
              </span>
            </motion.div>
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    location === link.href
                      ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {link.icon}
                  {link.label}
                </motion.div>
              </Link>
            ))}
          </div>

          {/* Auth */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg glass text-sm">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center">
                    <User size={12} className="text-black" />
                  </div>
                  <span className="text-white font-medium">{user.name}</span>
                  <span className="text-xs text-cyan-400 bg-cyan-400/10 px-1.5 py-0.5 rounded">
                    {user.role.replace("_", " ")}
                  </span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={logout}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-all"
                >
                  <LogOut size={14} />
                  <span className="hidden md:inline">Logout</span>
                </motion.button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-all"
                  >
                    Login
                  </motion.button>
                </Link>
                <Link href="/register">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-cyan-500 to-purple-600 text-white glow-cyan"
                  >
                    Get Started
                  </motion.button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
