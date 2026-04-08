import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "wouter";
import { ArrowRight, Zap, Shield, TrendingUp, Users, Briefcase, Star } from "lucide-react";
import { useGetPlatformStats } from "@/lib/api-client-react";
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
  const { data: stats } = useGetPlatformStats();

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
          style={{ y: y1, opacity }}
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

            <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight">
              Land Your Dream Job
              <br />
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: "linear-gradient(135deg, #00FFFF, #8B5CF6, #EC4899)" }}
              >
                With AI Precision
              </span>
            </h1>

            <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto leading-relaxed">
              The next-generation job portal with real-time ATS resume analysis. Know exactly how your resume ranks
              before you apply — and improve your chances with data-driven insights.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(0, 255, 255, 0.4)" }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 rounded-xl font-semibold text-black text-lg bg-gradient-to-r from-cyan-400 to-cyan-500 flex items-center gap-2"
                >
                  Start For Free <ArrowRight size={18} />
                </motion.button>
              </Link>
              <Link href="/jobs">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 rounded-xl font-semibold text-white text-lg glass border border-white/20 flex items-center gap-2"
                >
                  <Briefcase size={18} />
                  Browse Jobs
                </motion.button>
              </Link>
            </div>
          </motion.div>

          {/* Stats */}
          {stats && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              {[
                { label: "Open Jobs", value: stats.totalJobs },
                { label: "Candidates", value: stats.totalUsers },
                { label: "Applications", value: stats.totalApplications },
                { label: "Avg ATS Score", value: `${stats.avgAtsScore}%` },
              ].map((stat) => (
                <div key={stat.label} className="glass rounded-xl p-4 border border-white/8">
                  <div className="text-2xl font-bold text-cyan-400">{stat.value}</div>
                  <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          )}
        </motion.div>
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
              className="glass rounded-2xl p-6 border border-white/8 group cursor-default"
            >
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-4 group-hover:bg-cyan-500/20 transition-colors">
                {f.icon}
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
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
