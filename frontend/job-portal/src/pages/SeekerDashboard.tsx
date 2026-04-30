import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";
import {
  useGetSeekerDashboard,
  getGetSeekerDashboardQueryKey,
  useListJobs,
  getListJobsQueryKey,
} from "@workspace/api-client-react";
import { customFetch } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, Briefcase, FileText, TrendingUp, CheckCircle, XCircle, Clock, Target } from "lucide-react";

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: "Pending", color: "text-amber-400", icon: Clock },
  reviewing: { label: "Reviewing", color: "text-blue-400", icon: Target },
  shortlisted: { label: "Shortlisted", color: "text-emerald-400", icon: CheckCircle },
  interviewing: { label: "Interviewing", color: "text-purple-400", icon: Clock },
  rejected: { label: "Rejected", color: "text-red-400", icon: XCircle },
  accepted: { label: "Accepted", color: "text-cyan-400", icon: CheckCircle },
};

export default function SeekerDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const { data: dashboard, isLoading } = useGetSeekerDashboard({
    query: {
      queryKey: getGetSeekerDashboardQueryKey(),
      queryFn: () => customFetch("/api/dashboard/seeker").then((r) => r.json()),
      enabled: !!user,
    },
  });

  const { data: jobs } = useListJobs(undefined, {
    query: {
      queryKey: getListJobsQueryKey(),
      queryFn: () => customFetch("/api/jobs").then((r) => r.json()),
    },
  });

  if (!user) {
    setLocation("/login");
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-cyan-400" />
      </div>
    );
  }

  const stats = [
    { label: "Total Applications", value: dashboard?.totalApplications ?? 0, icon: Briefcase, color: "text-cyan-400", bg: "bg-cyan-400/10" },
    { label: "Interviewing", value: dashboard?.interviewing ?? 0, icon: Clock, color: "text-purple-400", bg: "bg-purple-400/10" },
    { label: "Shortlisted", value: dashboard?.shortlisted ?? 0, icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-400/10" },
    { label: "Avg ATS Score", value: `${dashboard?.avgAtsScore ?? 0}%`, icon: TrendingUp, color: "text-purple-400", bg: "bg-purple-400/10" },
  ];

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white">
            Welcome back, <span className="text-cyan-400">{user.name}</span>
          </h1>
          <p className="text-gray-400 mt-1">Here's your career activity overview</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="glass rounded-xl p-5 border border-white/8"
              >
                <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
                  <Icon size={18} className={stat.color} />
                </div>
                <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
              </motion.div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Applications */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass rounded-2xl p-6 border border-white/8"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Recent Applications</h2>
              <Link href="/jobs">
                <span className="text-xs text-cyan-400 hover:text-cyan-300 cursor-pointer">Browse Jobs</span>
              </Link>
            </div>
            {dashboard?.recentApplications && dashboard.recentApplications.length > 0 ? (
              <div className="space-y-3">
                {dashboard.recentApplications.map((app) => {
                  const cfg = statusConfig[app.status] ?? statusConfig.pending;
                  const Icon = cfg.icon;
                  return (
                    <div key={app.id} className="flex items-center justify-between p-3 rounded-xl bg-white/3 border border-white/5">
                      <div>
                        <div className="text-sm text-white font-medium">{app.jobTitle ?? "Unknown Job"}</div>
                        <div className="text-xs text-gray-500">{app.company}</div>
                      </div>
                      <div className={`flex items-center gap-1.5 text-xs font-medium ${cfg.color}`}>
                        <Icon size={12} />
                        {cfg.label}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Briefcase size={32} className="text-gray-600 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No applications yet</p>
                <Link href="/jobs">
                  <span className="text-cyan-400 text-sm cursor-pointer hover:underline mt-1 block">
                    Browse Jobs to Apply
                  </span>
                </Link>
              </div>
            )}
          </motion.div>

          {/* ATS Scores */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass rounded-2xl p-6 border border-white/8"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">ATS Score History</h2>
              <Link href="/ats">
                <span className="text-xs text-purple-400 hover:text-purple-300 cursor-pointer">Analyze Resume</span>
              </Link>
            </div>
            {dashboard?.topAtsScores && dashboard.topAtsScores.length > 0 ? (
              <div className="space-y-3">
                {dashboard.topAtsScores.map((s) => {
                  const color = s.score >= 75 ? "#00FFFF" : s.score >= 50 ? "#F59E0B" : "#EF4444";
                  return (
                    <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/3 border border-white/5">
                      <div
                        className="w-12 h-12 rounded-full border-2 flex items-center justify-center shrink-0 text-xs font-bold"
                        style={{ borderColor: color, color }}
                      >
                        {s.score}%
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-white font-medium truncate">{s.jobTitle ?? "Analysis"}</div>
                        <div className="text-xs text-gray-500">{s.matchedKeywords.length}/{s.totalKeywords} keywords</div>
                        <div className="mt-1 h-1.5 rounded-full bg-white/10">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${s.score}%`, backgroundColor: color }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <TrendingUp size={32} className="text-gray-600 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No ATS analyses yet</p>
                <Link href="/ats">
                  <span className="text-purple-400 text-sm cursor-pointer hover:underline mt-1 block">
                    Analyze Your Resume
                  </span>
                </Link>
              </div>
            )}
          </motion.div>
        </div>

        {/* Upcoming Interviews */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6 glass rounded-2xl p-6 border border-white/8"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Upcoming Interviews</h2>
            <Clock size={18} className="text-purple-400" />
          </div>
          {dashboard?.upcomingInterviews && dashboard.upcomingInterviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dashboard.upcomingInterviews.map((interview: any) => (
                <div key={interview.id} className="p-4 rounded-xl bg-white/3 border border-white/5 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-sm text-white font-medium">{interview.jobTitle}</div>
                      <div className="text-xs text-gray-500">{interview.company}</div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 font-medium">
                      {interview.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Clock size={14} className="text-cyan-400" />
                    {new Date(interview.scheduledAt).toLocaleString()}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {interview.meetingLink && (
                      <a
                        href={interview.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center py-2 rounded-lg bg-cyan-500/10 text-cyan-400 text-[10px] font-medium hover:bg-cyan-500/20 transition-colors"
                      >
                        Join Meeting
                      </a>
                    )}
                    <a
                      href={`https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`Interview: ${interview.jobTitle}`)}&details=${encodeURIComponent(`Interview with ${interview.company} via HireSphere`)}&dates=${new Date(interview.scheduledAt).toISOString().replace(/-|:|\.\d\d\d/g, "")}/${new Date(new Date(interview.scheduledAt).getTime() + 60 * 60 * 1000).toISOString().replace(/-|:|\.\d\d\d/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center py-2 rounded-lg bg-white/5 text-gray-300 text-[10px] font-medium hover:bg-white/10 transition-colors"
                    >
                      Add to Calendar
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock size={32} className="text-gray-600 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">No interviews scheduled yet</p>
            </div>
          )}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6 glass rounded-2xl p-6 border border-white/8"
        >
          <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { href: "/jobs", label: "Browse Jobs", icon: Briefcase, color: "from-cyan-500 to-cyan-600" },
              { href: "/resume", label: "Upload Resume", icon: FileText, color: "from-purple-500 to-purple-600" },
              { href: "/ats", label: "ATS Analyzer", icon: TrendingUp, color: "from-pink-500 to-pink-600" },
            ].map((action) => {
              const Icon = action.icon;
              return (
                <Link key={action.href} href={action.href}>
                  <motion.div
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer bg-gradient-to-r ${action.color} opacity-80 hover:opacity-100 transition-opacity`}
                  >
                    <Icon size={18} className="text-white" />
                    <span className="text-white font-medium text-sm">{action.label}</span>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
