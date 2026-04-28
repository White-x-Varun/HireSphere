import { useState } from "react";
import { motion } from "framer-motion";
import { useListResumes, getListResumesQueryKey, useUploadResume } from "@workspace/api-client-react";
import { customFetch, getToken } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, FileText, Plus, X, CheckCircle, Upload, FileUp, Zap, Trash2 } from "lucide-react";

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

  const [isDragging, setIsDragging] = useState(false);

  const uploadMutation = useUploadResume({
    mutation: {
      onSuccess: () => {
        refetch();
        setShowForm(false);
        setForm({ fileName: "", extractedText: "", skills: "" });
      },
    },
  });

  const [isExtracting, setIsExtracting] = useState(false);

  const handleFileDrop = async (file: File) => {
    if (!file) return;

    setIsExtracting(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await customFetch("/api/resumes/extract", {
        method: "POST",
        body: formData,
        // Don't set Content-Type header when sending FormData, 
        // the browser will set it automatically with the boundary
        headers: {
          "Authorization": `Bearer ${getToken()}`
        }
      });

      if (!res.ok) throw new Error("Failed to extract text");

      const data = await res.json();
      setForm({
        fileName: data.fileName,
        extractedText: data.text,
        skills: "" 
      });
      setShowForm(true);
    } catch (err) {
      console.error(err);
      alert("Failed to process file. Please try a different format or paste text manually.");
    } finally {
      setIsExtracting(false);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileDrop(file);
  };

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

  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleDeleteResume = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this resume?")) return;
    setIsDeleting(id);
    try {
      await customFetch(`/api/resumes/${id}`, {
        method: "DELETE",
      });
      refetch();
    } catch (err) {
      console.error(err);
      alert("Failed to delete resume");
    } finally {
      setIsDeleting(null);
    }
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
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-black bg-gradient-to-r from-cyan-400 to-purple-500 shadow-lg shadow-cyan-500/20">
            <Plus size={16} /> Add Resume
          </motion.button>
        </motion.div>

        {/* Dropzone */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={`relative mb-8 group transition-all duration-300 ${
            isDragging ? "scale-[1.02]" : ""
          }`}
        >
          <div className={`absolute -inset-1 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 ${
            isDragging ? "opacity-60" : ""
          }`}></div>
          <div className={`relative flex flex-col items-center justify-center py-12 px-6 rounded-2xl border-2 border-dashed transition-all duration-300 glass-strong ${
            isDragging ? "border-cyan-400 bg-cyan-400/5" : "border-white/10 hover:border-white/20"
          }`}>
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-transform duration-500 ${
              isDragging ? "scale-110 rotate-12 bg-cyan-400/20" : "bg-white/5"
            }`}>
              {isDragging ? (
                <FileUp size={32} className="text-cyan-400" />
              ) : (
                <Upload size={32} className="text-gray-400" />
              )}
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">
              {isDragging ? "Drop your resume here" : isExtracting ? "Processing resume..." : "Drag and drop your resume"}
            </h3>
            <p className="text-gray-400 text-sm mb-6">Support for .pdf, .docx, and .txt files</p>
            <input
              type="file"
              id="file-upload"
              className="hidden"
              accept=".pdf,.docx,.doc,.txt"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  handleFileDrop(e.target.files[0]);
                  e.target.value = "";
                }
              }}
            />
            <label
              htmlFor="file-upload"
              className="px-6 py-2 rounded-xl bg-white/10 border border-white/10 text-white font-medium hover:bg-white/15 transition-all cursor-pointer"
            >
              Select File
            </label>
          </div>
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
                    <p className="text-xs text-gray-500 mb-3">{new Date(r.createdAt).toLocaleDateString()}</p>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setLocation(`/ats?resumeId=${r.id}`)}
                        className="px-4 py-1.5 rounded-lg bg-cyan-400/20 text-cyan-400 text-xs font-semibold hover:bg-cyan-400/30 transition-all flex items-center gap-1.5"
                      >
                        <Zap size={12} /> Analyze Score
                      </button>
                      <button 
                        onClick={() => handleDeleteResume(r.id)}
                        disabled={isDeleting === r.id}
                        className="px-4 py-1.5 rounded-lg bg-red-400/10 text-red-400 text-xs font-semibold hover:bg-red-400/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
                      >
                        {isDeleting === r.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />} Delete
                      </button>
                    </div>
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
                {uploadMutation.isError && (
                  <div className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 p-2.5 rounded-xl mt-2">
                    Failed to save resume. Please try again.
                  </div>
                )}
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
