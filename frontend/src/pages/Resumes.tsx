import { useState } from "react";
import { motion } from "framer-motion";
import { useListResumes, getListResumesQueryKey, useUploadResume } from "@/lib/api-client-react";
import { customFetch } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, FileText, Plus, X, CheckCircle } from "lucide-react";

export default function Resumes() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ fileName: "", extractedText: "", skills: "" });

  const { data: resumes, isLoading, refetch } = useListResumes({
    query: {
      queryKey: getListResumesQueryKey(),
      queryFn: () => customFetch("/api/resumes").then((r) => r.json()),
      enabled: !!user,
    },
  });

  const uploadMutation = useUploadResume({
    mutation: {
      onSuccess: () => {
        refetch();
        setShowForm(false);
        setForm({ fileName: "", extractedText: "", skills: "" });
      },
    },
  });

  if (!user) { setLocation("/login"); return null; }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    uploadMutation.mutate({
      data: {
        fileName: form.fileName,
        extractedText: form.extractedText,
        skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
      },
    });
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">My Resumes</h1>
            <p className="text-gray-400 mt-1">Manage your resume library for ATS analysis</p>
          </div>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-black bg-gradient-to-r from-cyan-400 to-purple-500">
            <Plus size={16} /> Add Resume
          </motion.button>
        </motion.div>

        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 size={32} className="animate-spin text-cyan-400" />
          </div>
        ) : resumes && resumes.length > 0 ? (
          <div className="space-y-4">
            {resumes.map((r, i) => (
              <motion.div key={r.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                className="glass rounded-2xl p-5 border border-white/8 hover:border-cyan-500/20 transition-all">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center shrink-0">
                    <FileText size={18} className="text-cyan-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-white truncate">{r.fileName}</h3>
                      <CheckCircle size={14} className="text-emerald-400 shrink-0" />
                    </div>
                    <p className="text-gray-400 text-sm line-clamp-2 mb-3">{r.extractedText.substring(0, 150)}...</p>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {r.skills.slice(0, 6).map((s) => (
                        <span key={s} className="text-xs px-2 py-1 rounded-md bg-purple-400/10 text-purple-300 border border-purple-400/20">{s}</span>
                      ))}
                      {r.skills.length > 6 && <span className="text-xs text-gray-500">+{r.skills.length - 6} more</span>}
                    </div>
                    <p className="text-xs text-gray-500">{new Date(r.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 glass rounded-2xl border border-white/8">
            <FileText size={48} className="text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No resumes yet</h3>
            <p className="text-gray-500 text-sm mb-6">Add your resume to start analyzing your ATS score</p>
            <button onClick={() => setShowForm(true)}
              className="px-6 py-2.5 rounded-xl font-semibold text-black bg-gradient-to-r from-cyan-400 to-purple-500">
              Add Your First Resume
            </button>
          </div>
        )}

        {/* Upload Form Modal */}
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              className="w-full max-w-lg glass-strong rounded-2xl p-6 border border-white/15 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold text-white">Add Resume</h2>
                <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-white"><X size={18} /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-1.5">Resume Name</label>
                  <input type="text" value={form.fileName} onChange={(e) => setForm({ ...form, fileName: e.target.value })}
                    placeholder="e.g. Software_Engineer_Resume_2024.pdf"
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 text-sm transition-all" />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1.5">Resume Content (paste your resume text)</label>
                  <textarea value={form.extractedText} onChange={(e) => setForm({ ...form, extractedText: e.target.value })}
                    placeholder="Paste your full resume content here — work experience, education, skills, projects, etc. This text is used for ATS analysis."
                    required rows={10}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 text-sm transition-all resize-none" />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1.5">Your Skills (comma-separated)</label>
                  <input type="text" value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })}
                    placeholder="JavaScript, React, Python, AWS, Docker"
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 text-sm transition-all" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowForm(false)}
                    className="flex-1 py-2.5 rounded-xl text-gray-400 glass border border-white/10 text-sm">Cancel</button>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit"
                    disabled={uploadMutation.isPending}
                    className="flex-1 py-2.5 rounded-xl font-semibold text-black bg-gradient-to-r from-cyan-400 to-purple-500 text-sm disabled:opacity-50 flex items-center justify-center gap-2">
                    {uploadMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : null}
                    Save Resume
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
