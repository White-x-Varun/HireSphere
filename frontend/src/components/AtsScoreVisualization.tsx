import { useRef, useEffect } from "react";
import { motion } from "framer-motion";

interface AtsScoreVisualizationProps {
  score: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  totalKeywords: number;
}

function CircularProgress({ score }: { score: number }) {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const color = score >= 75 ? "#00FFFF" : score >= 50 ? "#F59E0B" : "#EF4444";

  return (
    <div className="relative w-48 h-48 flex items-center justify-center">
      {/* Outer glow ring */}
      <div
        className="absolute inset-0 rounded-full opacity-20 animate-pulse"
        style={{ boxShadow: `0 0 40px ${color}` }}
      />

      <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
        {/* Background track */}
        <circle
          cx="80" cy="80" r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="8"
        />
        {/* Progress arc */}
        <motion.circle
          cx="80" cy="80" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          style={{ filter: `drop-shadow(0 0 8px ${color})` }}
        />
      </svg>

      {/* Score text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-4xl font-bold"
          style={{ color }}
        >
          {score}%
        </motion.span>
        <span className="text-xs text-gray-400 mt-1">ATS Score</span>
      </div>
    </div>
  );
}

export default function AtsScoreVisualization({
  score,
  matchedKeywords,
  missingKeywords,
  totalKeywords,
}: AtsScoreVisualizationProps) {
  return (
    <div className="space-y-8">
      {/* Score Circle */}
      <div className="flex flex-col items-center">
        <CircularProgress score={score} />
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-400">
            {matchedKeywords.length} of {totalKeywords} keywords matched
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {score >= 75 ? "Excellent match!" : score >= 50 ? "Good match, some improvements needed" : "Low match — update your resume"}
          </p>
        </div>
      </div>

      {/* Keyword tags */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Matched keywords */}
        <div>
          <h3 className="text-sm font-semibold text-emerald-400 mb-3 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Matched Keywords ({matchedKeywords.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {matchedKeywords.map((kw, i) => (
              <motion.span
                key={kw}
                initial={{ opacity: 0, scale: 0, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: i * 0.05, type: "spring", stiffness: 200 }}
                className="px-3 py-1.5 rounded-full text-xs font-medium text-emerald-400 border border-emerald-400/30 bg-emerald-400/10"
                style={{ boxShadow: "0 0 10px rgba(52, 211, 153, 0.2)" }}
              >
                {kw}
              </motion.span>
            ))}
          </div>
        </div>

        {/* Missing keywords */}
        <div>
          <h3 className="text-sm font-semibold text-red-400 mb-3 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
            Missing Keywords ({missingKeywords.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {missingKeywords.map((kw, i) => (
              <motion.span
                key={kw}
                initial={{ opacity: 0, scale: 0, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: i * 0.05 + 0.3, type: "spring", stiffness: 200 }}
                className="px-3 py-1.5 rounded-full text-xs font-medium text-red-400 border border-red-400/30 bg-red-400/10"
                style={{ boxShadow: "0 0 10px rgba(239, 68, 68, 0.2)" }}
              >
                {kw}
              </motion.span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
