import { useState } from "react";
import { motion } from "framer-motion";
import { useListJobs, getListJobsQueryKey } from "@workspace/api-client-react";
import JobCard from "@/components/JobCard";
import { Search, Filter, Loader2, Briefcase } from "lucide-react";
import { customFetch } from "@/lib/api";

const JOB_TYPES = [
  { value: "", label: "All Types" },
  { value: "full_time", label: "Full Time" },
  { value: "part_time", label: "Part Time" },
  { value: "contract", label: "Contract" },
  { value: "remote", label: "Remote" },
];

export default function Jobs() {
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState("");

  const { data: jobs, isLoading } = useListJobs(
    { search: search || undefined, location: location || undefined, type: type || undefined },
    {
      query: {
        queryKey: getListJobsQueryKey({ search, location, type }),
        queryFn: () =>
          customFetch(`/api/jobs?${new URLSearchParams({ search, location, type }).toString()}`).then((r) => r.json()),
      },
    }
  );

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-black uppercase tracking-widest mb-4">
            <Briefcase size={12} />
            Marketplace
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-white mb-4 tracking-tight">
            Find Your Next <span className="text-gradient-cyan text-glow-cyan">Adventure</span>
          </h1>
          <p className="text-gray-500 font-medium">
            {jobs ? `${jobs.length} premium positions currently available` : "Scanning the hiresphere network for opportunities..."}
          </p>
        </motion.div>

        {/* Search & Filters Capsule */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="glass-strong rounded-[2rem] p-2 border border-white/10 mb-12 flex flex-col md:flex-row gap-2 shadow-2xl"
        >
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-cyan-400/50" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, company, or skills..."
              className="w-full pl-12 pr-6 py-4 rounded-2xl bg-white/5 border border-transparent focus:bg-white/10 focus:border-cyan-500/30 text-white placeholder-gray-500 transition-all font-medium"
            />
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Location..."
                className="w-full md:w-48 px-6 py-4 rounded-2xl bg-white/5 border border-transparent focus:bg-white/10 focus:border-cyan-500/30 text-white placeholder-gray-500 transition-all font-medium"
              />
            </div>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="px-6 py-4 rounded-2xl bg-white/5 border border-transparent focus:bg-white/10 focus:border-cyan-500/30 text-white transition-all font-bold appearance-none cursor-pointer min-w-[140px]"
            >
              {JOB_TYPES.map((t) => (
                <option key={t.value} value={t.value} className="bg-gray-900 text-white">
                  {t.label}
                </option>
              ))}
            </select>
          </div>
        </motion.div>

        {/* Jobs Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 size={32} className="animate-spin text-cyan-400" />
          </div>
        ) : jobs && jobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {jobs.map((job, i) => (
              <JobCard key={job.id} job={job as any} index={i} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <Briefcase size={48} className="text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No jobs found matching your criteria</p>
            <p className="text-gray-600 text-sm mt-2">Try adjusting your search filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
