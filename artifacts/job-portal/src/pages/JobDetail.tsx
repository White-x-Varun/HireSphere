import { motion } from "framer-motion";
import { Link, useParams } from "wouter";
import { useGetJob, getGetJobQueryKey } from "@workspace/api-client-react";
import { customFetch } from "@/lib/api";
import { MapPin, DollarSign, Clock, Users, ArrowLeft, Loader2, Building } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const typeLabels: Record<string, string> = {
  remote: "Remote",
  full_time: "Full Time",
  part_time: "Part Time",
  contract: "Contract",
};

export default function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const jobId = parseInt(id, 10);

  const { data: job, isLoading } = useGetJob(jobId, {
    query: {
      queryKey: getGetJobQueryKey(jobId),
      queryFn: () => customFetch(`/api/jobs/${jobId}`).then((r) => r.json()),
      enabled: !!jobId,
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-cyan-400" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center text-gray-400">
        Job not found
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <Link href="/jobs">
          <motion.button
            whileHover={{ x: -4 }}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft size={16} /> Back to Jobs
          </motion.button>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-8 border border-white/10 mb-6"
        >
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{job.title}</h1>
              <div className="flex items-center gap-2 text-purple-400 font-medium">
                <Building size={16} />
                {job.company}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <span className="px-3 py-1 rounded-full text-sm border border-cyan-500/30 text-cyan-400 bg-cyan-500/10 text-center">
                {typeLabels[job.type] ?? job.type}
              </span>
              {user && user.role !== "recruiter" && (
                <Link href={`/apply/${job.id}`}>
                  <motion.button
                    whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(0,255,255,0.3)" }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 rounded-xl font-semibold text-black bg-gradient-to-r from-cyan-400 to-cyan-500 whitespace-nowrap"
                  >
                    Apply Now
                  </motion.button>
                </Link>
              )}
              {!user && (
                <Link href="/login">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 rounded-xl font-semibold text-black bg-gradient-to-r from-cyan-400 to-cyan-500 whitespace-nowrap"
                  >
                    Login to Apply
                  </motion.button>
                </Link>
              )}
            </div>
          </div>

          {/* Info Row */}
          <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-6 pb-6 border-b border-white/8">
            <span className="flex items-center gap-1.5">
              <MapPin size={14} className="text-cyan-400" /> {job.location}
            </span>
            {(job.salaryMin || job.salaryMax) && (
              <span className="flex items-center gap-1.5">
                <DollarSign size={14} className="text-emerald-400" />
                {job.salaryMin ? `$${(job.salaryMin / 1000).toFixed(0)}k` : ""}
                {job.salaryMax ? ` – $${(job.salaryMax / 1000).toFixed(0)}k` : ""}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Users size={14} className="text-purple-400" /> {job.applicationCount} applicants
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={14} className="text-amber-400" />
              {new Date(job.createdAt).toLocaleDateString()}
            </span>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-white mb-3">Job Description</h2>
            <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{job.description}</p>
          </div>

          {/* Skills */}
          <div>
            <h2 className="text-lg font-semibold text-white mb-3">Required Skills</h2>
            <div className="flex flex-wrap gap-2">
              {job.skills.map((skill, i) => (
                <motion.span
                  key={skill}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.04, type: "spring", stiffness: 300 }}
                  className="px-3 py-1.5 rounded-full text-sm font-medium text-cyan-400 border border-cyan-400/30 bg-cyan-400/10"
                  style={{ boxShadow: "0 0 10px rgba(0, 255, 255, 0.15)" }}
                >
                  {skill}
                </motion.span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Apply CTA */}
        {user && user.role !== "recruiter" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass rounded-2xl p-6 border border-cyan-500/20 text-center"
          >
            <h3 className="text-lg font-semibold text-white mb-2">Ready to Apply?</h3>
            <p className="text-gray-400 text-sm mb-4">
              Submit your application and let our ATS analyze your fit for this role.
            </p>
            <Link href={`/apply/${job.id}`}>
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(0,255,255,0.3)" }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 rounded-xl font-semibold text-black bg-gradient-to-r from-cyan-400 to-purple-500"
              >
                Apply for this Position
              </motion.button>
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}
