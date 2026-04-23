import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "wouter";
import { ArrowRight, Zap, Shield, TrendingUp, Users, Briefcase, Star } from "lucide-react";
import { useGetPlatformStats, getGetPlatformStatsQueryKey } from "@workspace/api-client-react";
import { customFetch } from "@/lib/api";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";

function FloatingShape({ position, color, speed = 1, scale = 1, geo = "torus" }: {
  position: [number, number, number];
  color: string;
  speed?: number;
  scale?: number;
  geo?: string;
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    if (!ref.current) return;
    ref.current.rotation.x = s.clock.elapsedTime * 0.3 * speed;
    ref.current.rotation.y = s.clock.elapsedTime * 0.5 * speed;
  });
  return (
    <Float speed={speed} rotationIntensity={0.4} floatIntensity={0.6}>
      <mesh ref={ref} position={position} scale={scale}>
        {geo === "torus" && <torusGeometry args={[1, 0.3, 16, 32]} />}
        {geo === "oct" && <octahedronGeometry args={[1]} />}
        {geo === "ico" && <icosahedronGeometry args={[1]} />}
        {geo === "box" && <boxGeometry args={[1, 1, 1]} />}
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.4}
          roughness={0.1}
          metalness={0.8}
          transparent
          opacity={0.75}
          wireframe={geo === "ico"}
        />
      </mesh>
    </Float>
  );
}

function MouseCamera() {
  const mouse = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const h = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.current.y = -(e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", h);
    return () => window.removeEventListener("mousemove", h);
  }, []);
  const { camera } = (useFrame as any)?.(() => {}) ?? {};
  useFrame(({ camera }: any) => {
    camera.position.x += (mouse.current.x * 2 - camera.position.x) * 0.04;
    camera.position.y += (mouse.current.y * 1 - camera.position.y) * 0.04;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

const features = [
  { icon: <Zap className="w-5 h-5" />, title: "AI-Powered ATS Analysis", desc: "Instantly analyze how well your resume matches any job description with our advanced keyword matching engine." },
  { icon: <Shield className="w-5 h-5" />, title: "Smart Job Matching", desc: "Our algorithm finds the most relevant positions for your skills, saving you hours of manual searching." },
  { icon: <TrendingUp className="w-5 h-5" />, title: "Real-time Score Tracking", desc: "Track your ATS scores across applications and see how your resume improves over time." },
  { icon: <Users className="w-5 h-5" />, title: "Recruiter Dashboard", desc: "Post jobs, manage applications, and find the perfect candidates with powerful filtering tools." },
];

export default function Landing() {
  const { data: stats } = useGetPlatformStats({
    query: {
      queryKey: getGetPlatformStatsQueryKey(),
      queryFn: () => customFetch("/api/dashboard/stats").then((r) => r.json()),
    },
  });

  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, -100]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <div className="min-h-screen bg-background grid-bg overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-16">
        {/* 3D Background Canvas */}
        <div className="absolute inset-0 pointer-events-none">
          <Canvas
            camera={{ position: [0, 0, 9], fov: 60 }}
            gl={{ antialias: true, alpha: true }}
          >
            <ambientLight intensity={0.15} />
            <pointLight position={[10, 10, 5]} intensity={1.5} color="#00FFFF" />
            <pointLight position={[-10, -5, -5]} intensity={0.8} color="#8B5CF6" />
            <pointLight position={[0, 10, -8]} intensity={0.4} color="#EC4899" />
            <MouseCamera />
            <FloatingShape position={[-4, 2, -2]} color="#00FFFF" speed={0.5} scale={0.7} geo="torus" />
            <FloatingShape position={[4.5, -1.5, -3]} color="#8B5CF6" speed={0.7} scale={1.0} geo="oct" />
            <FloatingShape position={[3, 3.5, -5]} color="#00FFFF" speed={0.4} scale={0.55} geo="ico" />
            <FloatingShape position={[-3.5, -2.5, -2]} color="#8B5CF6" speed={1.0} scale={0.65} geo="box" />
            <FloatingShape position={[0.5, -3.5, -6]} color="#EC4899" speed={0.6} scale={0.9} geo="torus" />
            <FloatingShape position={[-5.5, 0.5, -6]} color="#00FFFF" speed={0.8} scale={1.2} geo="oct" />
            <FloatingShape position={[5.5, 1.5, -5]} color="#8B5CF6" speed={0.5} scale={0.45} geo="box" />
            <FloatingShape position={[1, 4.5, -7]} color="#EC4899" speed={0.9} scale={0.75} geo="ico" />
          </Canvas>
        </div>

        {/* Radial gradient overlay */}
        <div className="absolute inset-0 bg-radial-gradient pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at center, transparent 20%, rgba(4, 7, 18, 0.6) 70%, rgba(4, 7, 18, 0.95) 100%)"
          }}
        />

        {/* Hero Content */}
        <motion.div
          style={{ y: y1 }}
          className="relative z-10 text-center px-4 max-w-4xl mx-auto"
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-cyan-500/30 text-cyan-400 text-sm font-medium mb-6">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              AI-Powered Career Intelligence
            </div>

            <h1 className="text-6xl md:text-8xl font-black text-white mb-6 leading-[1.1] tracking-tighter">
              Elevate Your <br />
              <span className="text-gradient-cyan text-glow-cyan">Career Path</span>
            </h1>

            <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed font-medium">
              The next-generation recruitment ecosystem. Optimize your visibility with real-time ATS analysis and land roles at world-class companies.
            </p>

            <div className="flex flex-col sm:flex-row gap-5 justify-center">
              <Link href="/register">
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(0, 255, 255, 0.4)" }}
                  whileTap={{ scale: 0.95 }}
                  className="px-10 py-4 rounded-2xl font-bold text-black text-lg bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-500 flex items-center gap-2 shadow-xl"
                >
                  Get Started <ArrowRight size={20} />
                </motion.button>
              </Link>
              <Link href="/jobs">
                <motion.button
                  whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.1)" }}
                  whileTap={{ scale: 0.95 }}
                  className="px-10 py-4 rounded-2xl font-bold text-white text-lg glass border border-white/20 flex items-center gap-2"
                >
                  <Briefcase size={20} />
                  Explore Jobs
                </motion.button>
              </Link>
            </div>
          </motion.div>

          {/* Trusted By */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="mt-20 pt-10 border-t border-white/5"
          >
            <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500 mb-8 font-bold">Collaborating with elite talent</p>
            <div className="flex flex-wrap justify-center gap-16 opacity-30 grayscale hover:grayscale-0 transition-all duration-500">
              {["TANISHKA", "VARUN", "RIYA"].map(name => (
                <span key={name} className="text-2xl font-black tracking-tighter text-white">{name}</span>
              ))}
            </div>
          </motion.div>

          {/* Product Showcase */}
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="mt-24 relative max-w-6xl mx-auto"
          >
            <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500/20 to-purple-600/20 rounded-[3rem] blur-3xl"></div>
            <div className="relative glass-strong rounded-[2.5rem] border border-white/10 overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)]">
              <div className="absolute top-0 left-0 right-0 h-10 bg-white/5 border-b border-white/10 flex items-center px-4 gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/40" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/40" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/40" />
              </div>
              <img 
                src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=2426" 
                alt="NexusJobs Dashboard Preview" 
                className="w-full h-auto mt-10 opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>
            </div>
          </motion.div>

          {/* Stats */}
          {stats && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.6 }}
              className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6"
            >
              {[
                { label: "Active Roles", value: stats.totalJobs },
                { label: "Talent Pool", value: stats.totalUsers },
                { label: "Successful Apps", value: stats.totalApplications },
                { label: "ATS Accuracy", value: `${stats.avgAtsScore}%` },
              ].map((stat) => (
                <div key={stat.label} className="glass rounded-2xl p-6 border border-white/5 hover:border-cyan-500/30 transition-all group">
                  <div className="text-3xl font-black text-white group-hover:text-cyan-400 transition-colors">{stat.value}</div>
                  <div className="text-[10px] uppercase tracking-widest text-gray-500 mt-2 font-bold">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </section>

      {/* How It Works */}
      <section className="py-32 px-4 relative">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-24"
          >
            <h2 className="text-5xl font-black text-white mb-4">The <span className="text-gradient-cyan">HireSphere</span> Workflow</h2>
            <p className="text-gray-400 font-medium">Precision engineering for your professional growth</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 relative">
            {[
              { step: "01", title: "Smart Profile", desc: "Our AI extracts and indexes your core competencies automatically." },
              { step: "02", title: "Neural Matching", desc: "Cross-reference your profile against thousands of roles in milliseconds." },
              { step: "03", title: "Optimized Apply", desc: "Submit tailored applications with confidence scores higher than ever." }
            ].map((s, i) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="relative text-center group"
              >
                <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-black font-black text-3xl mx-auto mb-8 shadow-2xl shadow-cyan-500/20 group-hover:scale-110 transition-transform duration-500">
                  {s.step}
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">{s.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed px-6 font-medium">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-white mb-4">
            Built for the{" "}
            <span className="text-cyan-400">Future</span> of Work
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            Every feature is designed to give you an unfair advantage in the competitive job market.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4, boxShadow: "0 20px 40px rgba(0,0,0,0.3), 0 0 20px rgba(0,255,255,0.1)" }}
              className="glass rounded-2xl p-8 border border-white/8 group cursor-default"
            >
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-6 group-hover:bg-cyan-500/20 transition-colors">
                {f.icon}
              </div>
              <h3 className="text-white font-semibold text-xl mb-3">{f.title}</h3>
              <p className="text-gray-400 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[600px] h-[400px] rounded-full"
            style={{ background: "radial-gradient(ellipse, rgba(139,92,246,0.15) 0%, transparent 70%)" }}
          />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center relative z-10"
        >
          <div className="glass-strong rounded-3xl p-12 border border-purple-500/20">
            <div className="flex justify-center mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={20} className="text-amber-400 fill-amber-400" />
              ))}
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Supercharge Your Career?
            </h2>
            <p className="text-gray-400 mb-8">
              Join thousands of job seekers and recruiters using HireSphere to find their perfect match.
            </p>
            <div className="flex gap-3 justify-center">
              <Link href="/register?role=job_seeker">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 rounded-xl font-semibold text-black bg-gradient-to-r from-cyan-400 to-purple-500"
                >
                  I'm a Job Seeker
                </motion.button>
              </Link>
              <Link href="/register?role=recruiter">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 rounded-xl font-semibold text-white glass border border-white/20"
                >
                  I'm a Recruiter
                </motion.button>
              </Link>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
