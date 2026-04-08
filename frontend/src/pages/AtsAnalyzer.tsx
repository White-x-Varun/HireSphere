import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  useListResumes,
  getListResumesQueryKey,
  useListJobs,
  getListJobsQueryKey,
  useAnalyzeResume,
  useListAtsScores,
  getListAtsScoresQueryKey,
} from "@/lib/api-client-react";
import { customFetch } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import AtsScoreVisualization from "@/components/AtsScoreVisualization";
import { Loader2, Zap, FileText, Briefcase, History } from "lucide-react";

export default function AtsAnalyzer() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedResumeId, setSelectedResumeId] = useState<number | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [mode, setMode] = useState<"paste" | "select">("select");
  const [result, setResult] = useState<any>(null);

  const { data: resumes, isLoading: loadingResumes } = useListResumes({
    query: {
      queryKey: getListResumesQueryKey(),
      queryFn: () => customFetch("/api/resumes").then((r) => r.json()),
      enabled: !!user,
    },
  });

  const { data: jobs } = useListJobs(undefined, {
    query: {
      queryKey: getListJobsQueryKey(),
      queryFn: () => customFetch("/api/jobs").then((r) => r.json()),
    },
  });

  const { data: scores, refetch: refetchScores } = useListAtsScores(
    selectedResumeId ? { resumeId: selectedResumeId } : undefined,
    {
      query: {
        queryKey: getListAtsScoresQueryKey(selectedResumeId ? { resumeId: selectedResumeId } : undefined),
        queryFn: () =>
          selectedResumeId
            ? customFetch(`/api/ats/scores?resumeId=${selectedResumeId}`).then((r) => r.json())
            : Promise.resolve([]),
        enabled: !!user && !!selectedResumeId,
      },
    }
  );

  const analyzeMutation = useAnalyzeResume({
    mutation: {
      onSuccess: (data: any) => {
        setResult(data);
        refetchScores();
      },
    },
  });

  if (!user) { setLocation("/login"); return null; }

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResumeId) return;

    let finalDesc = jobDescription;
    let finalTitle = jobTitle;

    if (mode === "select" && selectedJobId && jobs) {
      const job = jobs.find((j) => j.id === selectedJobId);
      if (job) {
        finalDesc = job.description + " " + job.skills.join(" ");
        finalTitle = job.title;
      }
    }

    analyzeMutation.mutate({
      data: {
        resumeId: selectedResumeId,
        jobId: mode === "select" ? selectedJobId : null,
        jobDescription: finalDesc,
        jobTitle: finalTitle || "Custom Analysis",
      },
    } as any);
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-cyan-500/30 text-cyan-400 text-sm mb-4">
            <Zap size={14} className="animate-pulse" />
            ATS Resume Analyzer
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">
            Analyze Your <span className="text-cyan-400">Resume Score</span>
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto">
            Compare your resume against any job description and get an instant ATS compatibility score with keyword analysis.
          </p>
        </motion.div>

        {/* Analyzer Form */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-6 border border-white/8 mb-6">
          <form onSubmit={handleAnalyze} className="space-y-5">
            {/* Resume Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <FileText size={14} className="text-cyan-400" /> Select Resume
              </label>
              {loadingResumes ? (
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <Loader2 size={14} className="animate-spin" /> Loading resumes...
                </div>
              ) : resumes && resumes.length > 0 ? (
                <div className="grid grid-cols-1 gap-2">
                  {resumes.map((r) => (
                    <button key={r.id} type="button" onClick={() => setSelectedResumeId(r.id)}
                      className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                        selectedResumeId === r.id
                          ? "border-cyan-500/50 bg-cyan-500/10 text-white"
                          : "border-white/8 bg-white/3 text-gray-400 hover:border-white/20"
                      }`}>
                      <FileText size={16} className={selectedResumeId === r.id ? "text-cyan-400" : "text-gray-500"} />
                      <div>
                        <div className="text-sm font-medium">{r.fileName}</div>
                        <div className="text-xs opacity-60">{r.skills.slice(0, 3).join(", ")}{r.skills.length > 3 ? "..." : ""}</div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-white/3 border border-white/8 text-gray-400 text-sm text-center">
                  No resumes found.{" "}
                  <button type="button" onClick={() => setLocation("/resume")} className="text-cyan-400 hover:underline">
                    Add a resume first
                  </button>
                </div>
              )}
            </div>

            {/* Mode Toggle */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <Briefcase size={14} className="text-purple-400" /> Job Description
              </label>
              <div className="flex gap-2 p-1 rounded-xl bg-white/5 mb-3">
                <button type="button" onClick={() => setMode("select")}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                    mode === "select" ? "bg-purple-500/20 text-purple-400 border border-purple-500/30" : "text-gray-400 hover:text-white"
                  }`}>
                  Select a Job
                </button>
                <button type="button" onClick={() => setMode("paste")}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                    mode === "paste" ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30" : "text-gray-400 hover:text-white"
                  }`}>
                  Paste Description
                </button>
              </div>

              {mode === "select" && jobs ? (
                <select
                  value={selectedJobId ?? ""}
                  onChange={(e) => setSelectedJobId(e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-500/50 text-sm appearance-none"
                >
                  <option value="" className="bg-gray-900">-- Select a job --</option>
                  {jobs.map((j) => (
                    <option key={j.id} value={j.id} className="bg-gray-900">{j.title} at {j.company}</option>
                  ))}
                </select>
              ) : (
                <div className="space-y-3">
                  <input type="text" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="Job title (e.g. Senior React Developer)"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 text-sm" />
                  <textarea value={jobDescription} onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the full job description here..."
                    rows={6}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 text-sm resize-none" />
                </div>
              )}
            </div>

            <motion.button whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(0,255,255,0.3)" }}
              whileTap={{ scale: 0.98 }} type="submit"
              disabled={!selectedResumeId || analyzeMutation.isPending || (mode === "select" && !selectedJobId) || (mode === "paste" && !jobDescription)}
              className="w-full py-3.5 rounded-xl font-semibold text-black bg-gradient-to-r from-cyan-400 to-purple-500 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed text-lg">
              {analyzeMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <Zap size={18} />}
              {analyzeMutation.isPending ? "Analyzing..." : "Analyze Resume"}
            </motion.button>
          </form>
        </motion.div>

        {/* Results */}
        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="glass rounded-2xl p-6 border border-cyan-500/20 mb-6">
              <h2 className="text-xl font-bold text-white mb-6 text-center">Analysis Results</h2>
              <AtsScoreVisualization
                score={result.score}
                matchedKeywords={result.matchedKeywords}
                missingKeywords={result.missingKeywords}
                totalKeywords={result.totalKeywords}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Score History */}
        {scores && scores.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="glass rounded-2xl p-6 border border-white/8">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <History size={16} className="text-purple-400" /> Score History
            </h2>
            <div className="space-y-3">
              {scores.map((s) => {
                const color = s.score >= 75 ? "#00FFFF" : s.score >= 50 ? "#F59E0B" : "#EF4444";
                return (
                  <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/3 border border-white/5">
                    <div className="w-12 h-12 rounded-full border-2 flex items-center justify-center shrink-0 text-xs font-bold"
                      style={{ borderColor: color, color }}>
                      {s.score}%
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-white font-medium">{s.jobTitle ?? "Analysis"}</div>
                      <div className="text-xs text-gray-500">{s.matchedKeywords.length}/{s.totalKeywords} keywords · {new Date(s.createdAt).toLocaleDateString()}</div>
                      <div className="mt-1.5 h-1.5 rounded-full bg-white/10">
                        <div className="h-full rounded-full" style={{ width: `${s.score}%`, backgroundColor: color }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
