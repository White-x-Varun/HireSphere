import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Briefcase, LogOut, User, BarChart3, FileText, Search, Bell, MessageSquare, Calendar } from "lucide-react";
import { useSocket } from "@/contexts/SocketContext";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/api";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { notifications, setNotifications } = useSocket();
  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = async (id: string) => {
    try {
      await apiRequest(`/api/notifications/${id}/read`, { method: "PATCH" });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
  };
  const [location] = useLocation();

  const navLinks = user
    ? user.role === "admin"
      ? [
          { href: "/admin", label: "Admin Panel", icon: <BarChart3 size={16} /> },
          { href: "/jobs", label: "Browse Jobs", icon: <Search size={16} /> },
          { href: "/chat", label: "Messages", icon: <MessageSquare size={16} /> },
        ]
      : user.role === "recruiter"
        ? [
            { href: "/jobs", label: "Browse Jobs", icon: <Search size={16} /> },
            { href: "/recruiter", label: "Dashboard", icon: <BarChart3 size={16} /> },
            { href: "/recruiter/scheduler", label: "Scheduler", icon: <Calendar size={16} /> },
            { href: "/chat", label: "Messages", icon: <MessageSquare size={16} /> },
          ]
        : [
            { href: "/jobs", label: "Find Jobs", icon: <Search size={16} /> },
            { href: "/seeker", label: "Dashboard", icon: <BarChart3 size={16} /> },
            { href: "/resume", label: "My Resumes", icon: <FileText size={16} /> },
            { href: "/ats", label: "ATS Analyzer", icon: <BarChart3 size={16} /> },
            { href: "/chat", label: "Messages", icon: <MessageSquare size={16} /> },
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
              className="flex items-center gap-3 cursor-pointer"
              whileHover={{ scale: 1.02 }}
            >
              <div className="w-11 h-11 rounded-xl overflow-hidden shadow-[0_0_20px_rgba(0,255,255,0.2)] border border-white/10 bg-gradient-to-br from-cyan-400/20 to-purple-600/20 flex items-center justify-center">
                <img 
                  src="/logo.png" 
                  alt="HireSphere Logo" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    (e.target as HTMLImageElement).parentElement!.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-briefcase text-cyan-400"><path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path><rect width="20" height="14" x="2" y="6" rx="2"></rect></svg>';
                  }}
                />
              </div>
              <span className="font-black text-2xl tracking-tighter text-white">
                <span className="text-gradient-cyan text-glow-cyan">Hire</span>
                <span className="text-white/90">Sphere</span>
              </span>
            </motion.div>
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <motion.div
                  whileHover={{ y: -2 }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] uppercase tracking-widest font-black transition-all ${
                    location === link.href
                      ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_15px_rgba(0,255,255,0.1)]"
                      : "text-gray-500 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {link.icon}
                  {link.label}
                </motion.div>
              </Link>
            ))}
          </div>

          {/* Auth */}
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <div className="hidden lg:flex items-center gap-3 px-4 py-2 rounded-xl glass-strong border border-white/5">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center font-black text-black text-xs shadow-lg">
                    {user.name[0]}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-white text-[10px] font-black tracking-tight">{user.name}</span>
                    <span className="text-[8px] uppercase tracking-[0.2em] text-cyan-400 font-bold">
                      {user.role.replace("_", " ")}
                    </span>
                  </div>
                </div>
                <div className="relative group">
                  <div className="p-2.5 rounded-xl hover:bg-white/5 transition-all cursor-pointer relative">
                    <Bell size={20} className="text-gray-400 group-hover:text-white" />
                    {unreadCount > 0 && (
                      <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-cyan-400 rounded-full border-2 border-background shadow-[0_0_10px_rgba(0,255,255,0.5)] animate-pulse"></span>
                    )}
                  </div>
                  
                  {/* Notification Dropdown */}
                  <div className="absolute right-0 top-full mt-2 w-80 glass-strong border border-white/10 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden translate-y-2 group-hover:translate-y-0">
                    <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                      <h3 className="font-black text-[10px] uppercase tracking-widest text-white">Notifications</h3>
                      <Badge variant="outline" className="text-[9px] font-black bg-cyan-400/10 text-cyan-400 border-cyan-400/20">{unreadCount} New</Badge>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.slice(0, 5).map((n) => (
                          <div key={n.id} 
                            onClick={() => !n.read && markAsRead(n.id)}
                            className={`p-4 border-b border-white/5 hover:bg-white/5 transition-all cursor-pointer ${!n.read ? "bg-cyan-500/5 border-l-2 border-l-cyan-400" : "opacity-60"}`}>
                            <p className={`text-[11px] font-bold mb-1 ${!n.read ? "text-cyan-400" : "text-white"}`}>{n.title}</p>
                            <p className="text-[10px] text-gray-500 line-clamp-2 leading-relaxed">{n.message}</p>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center text-[10px] uppercase tracking-widest text-gray-600 font-bold italic">No alerts</div>
                      )}
                    </div>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={logout}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-red-400 hover:bg-red-500/10 transition-all"
                >
                  <LogOut size={16} />
                  <span className="hidden lg:inline">Sign Out</span>
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
