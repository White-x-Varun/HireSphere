import { motion } from "framer-motion";
import { Briefcase } from "lucide-react";

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-[9999] bg-[#040712] flex flex-col items-center justify-center">
      <div className="absolute inset-0 grid-bg opacity-20" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative"
      >
        <div className="absolute -inset-8 bg-cyan-500/20 blur-3xl animate-pulse" />
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center relative z-10 shadow-2xl">
          <Briefcase size={40} className="text-black" />
        </div>
        
        {/* Orbital rings */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="absolute -inset-4 border border-cyan-500/20 rounded-full"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="absolute -inset-8 border border-white/5 rounded-full"
        />
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-10 text-center"
      >
        <span className="text-xl font-black tracking-tighter text-white">
          HIRE<span className="text-cyan-400">SPHERE</span>
        </span>
        <div className="mt-4 flex gap-1 justify-center">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
              className="w-1.5 h-1.5 rounded-full bg-cyan-400"
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
