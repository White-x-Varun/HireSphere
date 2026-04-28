import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Clock, Video, MapPin, ChevronRight, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

const Scheduler: React.FC = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const { user } = useAuth();

  const { data: interviews, isLoading } = useQuery({
    queryKey: ["/api/interviews"],
    queryFn: () => apiRequest("/api/interviews"),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  // Filter interviews for the selected date
  const filteredInterviews = interviews?.filter((i: any) => 
    new Date(i.scheduledAt).toDateString() === date?.toDateString()
  ) || [];

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold text-white mb-8">Interview Scheduler</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calendar Side */}
        <div className="lg:col-span-1">
          <Card className="border-none shadow-2xl bg-background/50 backdrop-blur-xl">
            <CardHeader>
              <CardTitle>Select Date</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border-white/10"
              />
            </CardContent>
          </Card>
        </div>

        {/* Schedule Side */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-2xl bg-background/50 backdrop-blur-xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Interviews for {date?.toDateString()}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredInterviews.map((interview: any) => (
                  <div key={interview._id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-cyan-500/10 flex flex-col items-center justify-center text-cyan-400 font-bold border border-cyan-500/20">
                        <span className="text-xs">{new Date(interview.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).split(' ')[1]}</span>
                        <span className="text-sm">{new Date(interview.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).split(' ')[0]}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-white">
                          {user?.role === "recruiter" 
                            ? (interview.candidateId as any)?.name 
                            : (interview.recruiterId as any)?.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {(interview.applicationId as any)?.jobId?.title || "Candidate"}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <div className="hidden md:flex items-center gap-2 text-xs text-gray-400 capitalize">
                        {interview.type === "video" ? <Video size={14} /> : <MapPin size={14} />}
                        {interview.type}
                      </div>
                      <Badge variant="outline" className={
                        interview.status === "scheduled" ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" :
                        interview.status === "completed" ? "bg-green-500/10 text-green-400 border-green-500/20" :
                        "bg-red-500/10 text-red-400 border-red-500/20"
                      }>
                        {interview.status.toUpperCase()}
                      </Badge>
                      <ChevronRight size={16} className="text-gray-600 group-hover:text-white transition-all" />
                    </div>
                  </div>
                ))}
                
                {filteredInterviews.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    No interviews scheduled for this day.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Scheduler;
