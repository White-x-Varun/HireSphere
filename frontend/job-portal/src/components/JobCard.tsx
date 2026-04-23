import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { MapPin, Clock, IndianRupee, Users } from "lucide-react";

interface Job {
  id: string;
  title: string;
  company: string;
  description: string;
  skills: string[];
  location: string;
  type: string;
  salaryMin: number | null;
  salaryMax: number | null;
  applicationCount: number;
  createdAt: string;
}

const typeColors: Record<string, string> = {
  remote: "text-cyan-400 bg-cyan-400/10 border-cyan-400/30",
  full_time: "text-purple-400 bg-purple-400/10 border-purple-400/30",
  part_time: "text-amber-400 bg-amber-400/10 border-amber-400/30",
  contract: "text-pink-400 bg-pink-400/10 border-pink-400/30",
};

const typeLabels: Record<string, string> = {
  remote: "Remote",
  full_time: "Full Time",
  part_time: "Part Time",
  contract: "Contract",
};

export default function JobCard({ job, index = 0 }: { job: Job; index?: number }) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
    const y = -(e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
    setTilt({ x: x * 6, y: y * 6 });
  };

  const handleMouseLeave = () => setTilt({ x: 0, y: 0 });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transition: tilt.x === 0 ? "transform 0.5s ease" : "transform 0.1s ease",
      }}
    >
      <Link href={`/jobs/${job.id}`}>
        <div className="glass-card p-6 cursor-pointer group h-full relative overflow-hidden"
          style={{
            boxShadow: tilt.x !== 0 ? "0 20px 40px rgba(0,0,0,0.4), 0 0 30px rgba(0,255,255,0.1)" : undefined,
          }}
        >
          {/* Subtle Glow Overlay */}
          <div className="absolute -inset-24 bg-gradient-to-br from-cyan-500/10 to-purple-600/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

          {/* Header */}
          <div className="flex items-start justify-between mb-4 relative z-10">
            <div className="space-y-1">
              <h3 className="font-bold text-white group-hover:text-cyan-400 transition-colors text-lg tracking-tight">
                {job.title}
              </h3>
              <div className="flex items-center gap-2">
                <p className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 text-sm font-black">{job.company}</p>
                <div className="w-1 h-1 rounded-full bg-white/20"></div>
                <span className="text-gray-500 text-[10px] uppercase tracking-widest font-bold">{new Date(job.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
            <span className={`text-[10px] uppercase tracking-widest font-black px-2.5 py-1 rounded-lg border ${typeColors[job.type] ?? "text-gray-400"}`}>
              {typeLabels[job.type] ?? job.type}
            </span>
          </div>

          {/* Description */}
          <p className="text-gray-400 text-sm line-clamp-2 mb-5 font-medium leading-relaxed relative z-10">{job.description}</p>

          {/* Skills */}
          <div className="flex flex-wrap gap-2 mb-6 relative z-10">
            {job.skills.slice(0, 3).map((skill) => (
              <span key={skill} className="text-[10px] font-bold px-3 py-1 rounded-full bg-white/5 text-cyan-400/80 border border-white/5 hover:bg-cyan-400/10 transition-colors">
                {skill}
              </span>
            ))}
            {job.skills.length > 3 && (
              <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-white/5 text-gray-500">
                +{job.skills.length - 3} MORE
              </span>
            )}
          </div>

          {/* Footer info */}
          <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5 relative z-10">
            <div className="flex items-center gap-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              <span className="flex items-center gap-1.5 hover:text-white transition-colors">
                <MapPin size={12} className="text-cyan-400/50" />
                {job.location}
              </span>
              {(job.salaryMin || job.salaryMax) && (
                <span className="flex items-center gap-1.5 hover:text-white transition-colors">
                  <IndianRupee size={12} className="text-green-400/50" />
                  {job.salaryMin ? `${(job.salaryMin / 100000).toFixed(1)}L` : ""}
                  {job.salaryMax ? ` - ${(job.salaryMax / 100000).toFixed(1)}L` : ""}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-400/80">
              <Users size={14} />
              {job.applicationCount}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
