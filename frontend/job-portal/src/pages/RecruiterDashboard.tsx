import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";
import {
  useGetRecruiterDashboard,
  getGetRecruiterDashboardQueryKey,
  useCreateJob,
  useUpdateApplicationStatus,
  getListApplicationsQueryKey,
} from "@workspace/api-client-react";
import { customFetch } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Briefcase, Users, Plus, X, CheckCircle, XCircle, Clock, Target } from "lucide-react";

const JOB_TYPES = ["full_time", "part_time", "contract", "remote"];
const TYPE_LABELS: Record<string, string> = {
  full_time: "Full Time", part_time: "Part Time", contract: "Contract", remote: "Remote"
};

const STATUS_OPTIONS = ["pending", "reviewing", "shortlisted", "rejected", "accepted"];
const STATUS_COLORS: Record<string, string> = {
  pending: "text-amber-400",
  reviewing: "text-blue-400",
  shortlisted: "text-emerald-400",
  rejected: "text-red-400",
  accepted: "text-cyan-400",
};

export default function RecruiterDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const qc = useQueryClient();
  const [showJobForm, setShowJobForm] = useState(false);
  const [jobForm, setJobForm] = useState({
    title: "", company: "", description: "",
    skills: "", location: "", type: "full_time",
    salaryMin: "", salaryMax: "",
  });

  const { data: dashboard, isLoading, refetch } = useGetRecruiterDashboard({
    query: {
      queryKey: getGetRecruiterDashboardQueryKey(),
      queryFn: () => customFetch("/api/dashboard/recruiter").then((r) => r.json()),
      enabled: !!user,
    },
  });

  const createJobMutation = useCreateJob({
    mutation: {
      onSuccess: () => {
        refetch();
        setShowJobForm(false);
        setJobForm({ title: "", company: "", description: "", skills: "", location: "", type: "full_time", salaryMin: "", salaryMax: "" });
      },
    },
  });

  const updateStatusMutation = useUpdateApplicationStatus({
    mutation: { onSuccess: () => refetch() },
  });

  if (!user) { setLocation("/login"); return null; }

  if (isLoading) return (
    <div className="min-h-screen pt-24 flex items-center justify-center">
      <Loader2 size={32} className="animate-spin text-cyan-400" />
    </div>
  );

  const handleCreateJob = (e: React.FormEvent) => {
    e.preventDefault();
    createJobMutation.mutate({
      data: {
        title: jobForm.title,
        company: jobForm.company,
        description: jobForm.description,
        skills: jobForm.skills.split(",").map((s) => s.trim()).filter(Boolean),
        location: jobForm.location,
        type: jobForm.type as any,
        salaryMin: jobForm.salaryMin ? parseInt(jobForm.salaryMin) : null,
        salaryMax: jobForm.salaryMax ? parseInt(jobForm.salaryMax) : null,
      },
    } as any);
  };

  const stats = [
    { label: "Total Jobs", value: dashboard?.totalJobs ?? 0, color: "text-cyan-400" },
    { label: "Total Applications", value: dashboard?.totalApplications ?? 0, color: "text-purple-400" },
    { label: "Pending Review", value: dashboard?.pendingReview ?? 0, color: "text-amber-400" },
    { label: "Shortlisted", value: dashboard?.shortlisted ?? 0, color: "text-emerald-400" },
  ];

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Recruiter Dashboard</h1>
            <p className="text-gray-400 mt-1">Manage your job postings and applications</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowJobForm(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-black bg-gradient-to-r from-cyan-400 to-purple-500"
          >
            <Plus size={16} /> Post Job
          </motion.button>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.07 }}
            >
              <div className="glass-card p-6 group relative overflow-hidden">
                <div className="text-3xl font-black mb-1 transition-colors group-hover:text-white" style={{ color: "hsl(var(--primary))" }}>
                  {s.value}
                </div>
                <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{s.label}</div>
                <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-cyan-400 to-transparent w-0 group-hover:w-full transition-all duration-500"></div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* My Job Listings */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="glass rounded-2xl p-6 border border-white/8">
            <h2 className="text-lg font-semibold text-white mb-4">My Job Postings</h2>
            {dashboard?.jobsWithCounts && dashboard.jobsWithCounts.length > 0 ? (
              <div className="space-y-3">
                {dashboard.jobsWithCounts.map((job) => (
                  <Link key={job.id} href={`/jobs/${job.id}`}>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-white/3 border border-white/5 hover:border-cyan-500/20 cursor-pointer transition-colors">
                      <div>
                        <div className="text-sm text-white font-medium">{job.title}</div>
                        <div className="text-xs text-gray-500">{job.company} · {TYPE_LABELS[job.type]}</div>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-purple-400">
                        <Users size={12} />
                        {job.applicationCount}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Briefcase size={32} className="text-gray-600 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No jobs posted yet</p>
                <button onClick={() => setShowJobForm(true)} className="text-cyan-400 text-sm hover:underline mt-1 block mx-auto">
                  Post your first job
                </button>
              </div>
            )}
          </motion.div>

          {/* Recent Applications */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="glass rounded-2xl p-6 border border-white/8">
            <h2 className="text-lg font-semibold text-white mb-4">Recent Applications</h2>
            {dashboard?.recentApplications && dashboard.recentApplications.length > 0 ? (
              <div className="space-y-3">
                {dashboard.recentApplications.map((app) => (
                  <div key={app.id} className="p-3 rounded-xl bg-white/3 border border-white/5">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="text-sm text-white font-medium">{app.applicantName ?? "Applicant"}</div>
                        <div className="text-xs text-gray-500">for {app.jobTitle}</div>
                      </div>
                      <select
                        value={app.status}
                        onChange={(e) => updateStatusMutation.mutate({ id: app.id, data: { status: e.target.value as any } })}
                        className={`text-xs px-2 py-1 rounded-lg bg-white/5 border border-white/10 ${STATUS_COLORS[app.status]} focus:outline-none cursor-pointer`}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s} className="bg-gray-900">{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                        ))}
                      </select>
                    </div>
                    {app.atsScore != null && (
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <div className="flex-1 h-1 rounded-full bg-white/10">
                          <div className="h-full rounded-full bg-cyan-400" style={{ width: `${app.atsScore}%` }} />
                        </div>
                        <span className="text-cyan-400">ATS: {app.atsScore}%</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users size={32} className="text-gray-600 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No applications yet</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Job Form Modal */}
        {showJobForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              className="w-full max-w-lg glass-strong rounded-2xl p-6 border border-white/15 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold text-white">Post a New Job</h2>
                <button onClick={() => setShowJobForm(false)} className="text-gray-400 hover:text-white">
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={handleCreateJob} className="space-y-4">
                {[
                  { key: "title", label: "Job Title", placeholder: "e.g. Senior React Developer" },
                  { key: "company", label: "Company", placeholder: "Your company name" },
                  { key: "location", label: "Location", placeholder: "e.g. New York, NY (Remote)" },
                ].map((f) => (
                  <div key={f.key}>
                    <label className="block text-sm text-gray-300 mb-1.5">{f.label}</label>
                    <input
                      type="text"
                      value={(jobForm as any)[f.key]}
                      onChange={(e) => setJobForm({ ...jobForm, [f.key]: e.target.value })}
                      placeholder={f.placeholder}
                      required
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 text-sm transition-all"
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-sm text-gray-300 mb-1.5">Description</label>
                  <textarea
                    value={jobForm.description}
                    onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                    placeholder="Describe the role, responsibilities, requirements..."
                    required
                    rows={4}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 text-sm transition-all resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1.5">Skills (comma-separated)</label>
                  <input
                    type="text"
                    value={jobForm.skills}
                    onChange={(e) => setJobForm({ ...jobForm, skills: e.target.value })}
                    placeholder="React, TypeScript, Node.js, AWS"
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 text-sm transition-all"
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm text-gray-300 mb-1.5">Type</label>
                    <select value={jobForm.type} onChange={(e) => setJobForm({ ...jobForm, type: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none text-sm">
                      {JOB_TYPES.map((t) => <option key={t} value={t} className="bg-gray-900">{TYPE_LABELS[t]}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1.5">Min Salary</label>
                    <input type="number" value={jobForm.salaryMin} onChange={(e) => setJobForm({ ...jobForm, salaryMin: e.target.value })}
                      placeholder="80000"
                      className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1.5">Max Salary</label>
                    <input type="number" value={jobForm.salaryMax} onChange={(e) => setJobForm({ ...jobForm, salaryMax: e.target.value })}
                      placeholder="120000"
                      className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none text-sm" />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowJobForm(false)}
                    className="flex-1 py-2.5 rounded-xl text-gray-400 glass border border-white/10 text-sm">Cancel</button>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit"
                    disabled={createJobMutation.isPending}
                    className="flex-1 py-2.5 rounded-xl font-semibold text-black bg-gradient-to-r from-cyan-400 to-purple-500 text-sm disabled:opacity-50 flex items-center justify-center gap-2">
                    {createJobMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : null}
                    Post Job
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
