import { useState } from "react";
import { motion } from "framer-motion";
import { useParams, useLocation } from "wouter";
import {
  useGetJob, getGetJobQueryKey,
  useListResumes, getListResumesQueryKey,
  useCreateApplication,
} from "@/lib/api-client-react";
import { customFetch } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, Send, FileText, Loader2, CheckCircle } from "lucide-react";
import { Link } from "wouter";

export default function Apply() {
  const { jobId: jobIdStr } = useParams<{ jobId: string }>();
  const jobId = parseInt(jobIdStr, 10);
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedResumeId, setSelectedResumeId] = useState<number | null>(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const { data: job } = useGetJob(jobId, {
    query: {
      queryKey: getGetJobQueryKey(jobId),
      queryFn: () => customFetch(`/api/jobs/${jobId}`).then((r) => r.json()),
      enabled: !!jobId,
    },
  });

  const { data: resumes } = useListResumes({
    query: {
      queryKey: getListResumesQueryKey(),
      queryFn: () => customFetch("/api/resumes").then((r) => r.json()),
      enabled: !!user,
    },
  });

  const applyMutation = useCreateApplication({
    mutation: {
      onSuccess: () => setSubmitted(true),
    },
  });

  if (!user) { setLocation("/login"); return null; }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyMutation.mutate({
      data: {
        jobId,
        coverLetter,
        resumeId: selectedResumeId,
      },
    } as any);
  };

  if (submitted) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
          className="text-center glass rounded-2xl p-12 border border-emerald-500/20 max-w-md">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring" }}
            className="w-20 h-20 rounded-full bg-emerald-400/10 border border-emerald-400/30 flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-emerald-400" />
          </motion.div>
          <h2 className="text-2xl font-bold text-white mb-3">Application Submitted!</h2>
          <p className="text-gray-400 mb-6">Your application for <span className="text-cyan-400">{job?.title}</span> has been successfully submitted.</p>
          <div className="flex gap-3 justify-center">
            <Link href="/seeker">
              <motion.button whileHover={{ scale: 1.05 }} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-black bg-gradient-to-r from-cyan-400 to-purple-500">
                View Dashboard
              </motion.button>
            </Link>
            <Link href="/jobs">
              <motion.button whileHover={{ scale: 1.05 }} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white glass border border-white/20">
                Browse More Jobs
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-2xl mx-auto">
        <Link href={`/jobs/${jobId}`}>
          <motion.button whileHover={{ x: -4 }} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors">
            <ArrowLeft size={16} /> Back to Job
          </motion.button>
        </Link>

        {job && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl p-5 border border-white/8 mb-6">
            <h2 className="font-semibold text-white">{job.title}</h2>
            <p className="text-purple-400 text-sm mt-0.5">{job.company} · {job.location}</p>
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-6 border border-white/10">
          <h1 className="text-2xl font-bold text-white mb-6">Submit Application</h1>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Resume selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <FileText size={14} className="text-cyan-400" /> Select Resume (optional)
              </label>
              {resumes && resumes.length > 0 ? (
                <div className="space-y-2">
                  <button type="button" onClick={() => setSelectedResumeId(null)}
                    className={`flex items-center gap-3 w-full p-3 rounded-xl border text-left text-sm transition-all ${
                      selectedResumeId === null ? "border-gray-500/50 bg-white/5 text-gray-300" : "border-white/8 text-gray-500 hover:border-white/20"
                    }`}>
                    Apply without selecting a resume
                  </button>
                  {resumes.map((r) => (
                    <button key={r.id} type="button" onClick={() => setSelectedResumeId(r.id)}
                      className={`flex items-center gap-3 w-full p-3 rounded-xl border text-left transition-all ${
                        selectedResumeId === r.id
                          ? "border-cyan-500/50 bg-cyan-500/10 text-white"
                          : "border-white/8 bg-white/3 text-gray-400 hover:border-white/20"
                      }`}>
                      <FileText size={15} className={selectedResumeId === r.id ? "text-cyan-400" : "text-gray-500"} />
                      <span className="text-sm">{r.fileName}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-white/3 border border-white/8 text-xs text-gray-500">
                  No resumes added. <Link href="/resume"><span className="text-cyan-400 cursor-pointer">Add one</span></Link> for better ATS matching.
                </div>
              )}
            </div>

            {/* Cover Letter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Cover Letter (optional)</label>
              <textarea value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Tell the recruiter why you're the perfect fit for this role..."
                rows={6}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 text-sm transition-all resize-none" />
            </div>

            {applyMutation.isError && (
              <div className="p-3 rounded-xl bg-red-400/10 border border-red-400/20 text-red-400 text-sm">
                {(applyMutation.error as any)?.data?.error ?? "Failed to submit application. You may have already applied."}
              </div>
            )}

            <motion.button whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(0,255,255,0.3)" }}
              whileTap={{ scale: 0.98 }} type="submit"
              disabled={applyMutation.isPending}
              className="w-full py-3.5 rounded-xl font-semibold text-black bg-gradient-to-r from-cyan-400 to-purple-500 flex items-center justify-center gap-2 text-lg disabled:opacity-50">
              {applyMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              {applyMutation.isPending ? "Submitting..." : "Submit Application"}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
