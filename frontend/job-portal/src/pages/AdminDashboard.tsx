import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { Users, Briefcase, FileCheck, TrendingUp, ShieldAlert, Settings, Loader2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";

const AdminDashboard: React.FC = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    queryFn: () => apiRequest("/api/dashboard/stats"),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  const chartData = [
    { name: "Full Time", count: stats?.jobsByType?.full_time || 0 },
    { name: "Part Time", count: stats?.jobsByType?.part_time || 0 },
    { name: "Contract", count: stats?.jobsByType?.contract || 0 },
    { name: "Remote", count: stats?.jobsByType?.remote || 0 },
  ];

  const statCards = [
    { label: "Total Users", value: stats?.totalUsers || 0, icon: <Users className="text-cyan-400" />, trend: "+12%" },
    { label: "Active Jobs", value: stats?.totalJobs || 0, icon: <Briefcase className="text-purple-400" />, trend: "+5%" },
    { label: "Applications", value: stats?.totalApplications || 0, icon: <FileCheck className="text-green-400" />, trend: "+18%" },
    { label: "Avg ATS Match", value: `${stats?.avgAtsScore || 0}%`, icon: <TrendingUp className="text-yellow-400" />, trend: "+7%" },
  ];

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Admin Command Center</h1>
          <p className="text-gray-400">Platform-wide analytics and management</p>
        </div>
        <div className="flex gap-3">
          <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20 py-1 px-3">
            System Healthy
          </Badge>
          <button className="p-2 rounded-lg glass-strong text-gray-400 hover:text-white transition-all">
            <Settings size={20} />
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {statCards.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
          >
            <div className="glass-card p-6 group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                {React.cloneElement(stat.icon as React.ReactElement, { size: 48 })}
              </div>
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 group-hover:border-cyan-500/30 transition-all">
                  {stat.icon}
                </div>
                <span className="text-[10px] font-black text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full border border-green-400/20">
                  {stat.trend}
                </span>
              </div>
              <p className="text-3xl font-black text-white tracking-tight relative z-10">{stat.value}</p>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mt-2 relative z-10">{stat.label}</p>
              
              {/* Bottom accent line */}
              <div className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-cyan-500 to-purple-600 w-0 group-hover:w-full transition-all duration-500"></div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Job Distribution Chart */}
        <Card className="border-none shadow-2xl bg-background/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-lg">Job Type Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis dataKey="name" stroke="#666" fontSize={12} />
                <YAxis stroke="#666" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#111", border: "1px solid #333", borderRadius: "8px" }}
                />
                <Bar dataKey="count" fill="url(#colorGradient)" radius={[4, 4, 0, 0]} />
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0.8}/>
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Security Alerts (Simulated for Demo) */}
        <Card className="border-none shadow-2xl bg-background/50 backdrop-blur-xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Security & System Logs</CardTitle>
            <ShieldAlert className="text-red-400" size={20} />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { event: "Platform Health Check", severity: "low", time: "just now" },
                { event: "New Data Sync Complete", severity: "low", time: "15m ago" },
                { event: "High Traffic Detected", severity: "medium", time: "1h ago" },
                { event: "SSL Certificate Valid", severity: "low", time: "24h ago" },
              ].map((log, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      log.severity === "high" ? "bg-red-500" :
                      log.severity === "medium" ? "bg-yellow-500" : "bg-cyan-500"
                    }`}></div>
                    <span className="text-sm text-gray-300">{log.event}</span>
                  </div>
                  <span className="text-[10px] text-gray-500">{log.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recently Active Users (Simulated for Demo) */}
      <Card className="border-none shadow-2xl bg-background/50 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-lg">Platform Activity Overview</CardTitle>
        </CardHeader>
        <CardContent className="p-12 text-center text-gray-500">
          <div className="flex flex-col items-center gap-4">
            <TrendingUp size={48} className="text-cyan-400/20" />
            <p>User-specific management and detailed logs are coming in the next platform update.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
