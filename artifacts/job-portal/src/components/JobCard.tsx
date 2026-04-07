import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { MapPin, Clock, DollarSign, Users } from "lucide-react";

interface Job {
  id: number;
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
        <div className="glass rounded-xl p-5 border border-white/8 hover:border-cyan-500/30 cursor-pointer group transition-all duration-300 h-full"
          style={{
            boxShadow: tilt.x !== 0 ? "0 20px 40px rgba(0,0,0,0.4), 0 0 30px rgba(0,255,255,0.1)" : undefined,
          }}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-semibold text-white group-hover:text-cyan-400 transition-colors text-base">
                {job.title}
              </h3>
              <p className="text-purple-400 text-sm font-medium mt-0.5">{job.company}</p>
            </div>
            <span className={`text-xs font-medium px-2 py-1 rounded-full border ${typeColors[job.type] ?? "text-gray-400"}`}>
              {typeLabels[job.type] ?? job.type}
            </span>
          </div>

          {/* Description */}
          <p className="text-gray-400 text-sm line-clamp-2 mb-4">{job.description}</p>

          {/* Skills */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {job.skills.slice(0, 4).map((skill) => (
              <span key={skill} className="text-xs px-2 py-1 rounded-md bg-white/5 text-gray-300 border border-white/8">
                {skill}
              </span>
            ))}
            {job.skills.length > 4 && (
              <span className="text-xs px-2 py-1 rounded-md bg-white/5 text-gray-500">
                +{job.skills.length - 4}
              </span>
            )}
          </div>

          {/* Footer info */}
          <div className="flex flex-wrap gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <MapPin size={11} />
              {job.location}
            </span>
            {(job.salaryMin || job.salaryMax) && (
              <span className="flex items-center gap-1">
                <DollarSign size={11} />
                {job.salaryMin ? `$${(job.salaryMin / 1000).toFixed(0)}k` : ""}
                {job.salaryMax ? ` - $${(job.salaryMax / 1000).toFixed(0)}k` : ""}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Users size={11} />
              {job.applicationCount} applied
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
