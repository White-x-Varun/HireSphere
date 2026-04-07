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
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="text-4xl font-bold text-white mb-2">
            Find Your Next <span className="text-cyan-400">Opportunity</span>
          </h1>
          <p className="text-gray-400">
            {jobs ? `${jobs.length} positions available` : "Searching for opportunities..."}
          </p>
        </motion.div>

        {/* Search & Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-4 border border-white/8 mb-8 flex flex-col md:flex-row gap-3"
        >
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search jobs, companies, skills..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 transition-all text-sm"
            />
          </div>
          <div className="relative">
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Location..."
              className="w-full md:w-48 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 transition-all text-sm"
            />
          </div>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50 transition-all text-sm appearance-none cursor-pointer"
          >
            {JOB_TYPES.map((t) => (
              <option key={t.value} value={t.value} className="bg-gray-900">
                {t.label}
              </option>
            ))}
          </select>
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
