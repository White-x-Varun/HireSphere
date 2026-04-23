import React from "react";
import { useRoute } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Clock, Calendar, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/api";

const CandidateComparison: React.FC = () => {
  const [, params] = useRoute("/recruiter/compare/:jobId");
  const jobId = params?.jobId;
  const queryClient = useQueryClient();

  const { data: applicants, isLoading } = useQuery({
    queryKey: [`/api/applications?jobId=${jobId}`],
    queryFn: () => apiRequest(`/api/applications?jobId=${jobId}`),
    enabled: !!jobId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  const updateStatus = async (appId: string, status: string) => {
    try {
      await apiRequest(`/api/applications/${appId}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      // Refresh applicants
      queryClient.invalidateQueries({ queryKey: [`/api/applications?jobId=${jobId}`] });
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  const sortedApplicants = [...(applicants || [])].sort((a, b) => (b.atsScore || 0) - (a.atsScore || 0));

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Candidate Comparison</h1>
          <p className="text-gray-400">Review and rank applicants for Job ID: {jobId}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="glass">Export CSV</Button>
          <Button className="bg-cyan-500 hover:bg-cyan-600 text-black font-bold">Bulk Action</Button>
        </div>
      </div>

      <Card className="border-none shadow-2xl bg-background/50 backdrop-blur-xl">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-white/5">
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="text-gray-300">Candidate</TableHead>
                <TableHead className="text-gray-300">ATS Match Score</TableHead>
                <TableHead className="text-gray-300">Status</TableHead>
                <TableHead className="text-gray-300 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedApplicants.map((applicant) => (
                <TableRow key={applicant.id} className="border-white/10 hover:bg-white/5 transition-all">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>{applicant.applicantName?.[0] || "?"}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-white">{applicant.applicantName}</p>
                        <p className="text-xs text-gray-400">{applicant.applicantEmail}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="w-[150px] space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">Match</span>
                        <span className={(applicant.atsScore || 0) > 80 ? "text-cyan-400" : (applicant.atsScore || 0) > 50 ? "text-yellow-400" : "text-red-400"}>
                          {applicant.atsScore || 0}%
                        </span>
                      </div>
                      <Progress 
                        value={applicant.atsScore || 0} 
                        className="h-1.5 bg-white/10"
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={
                      applicant.status === "shortlisted" ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/30" :
                      applicant.status === "rejected" ? "bg-red-500/20 text-red-400 border-red-500/30" :
                      "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                    }>
                      {(applicant.status || "PENDING").toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-cyan-400 hover:bg-cyan-400/10" title="Schedule Interview">
                        <Calendar className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-8 w-8 text-green-400 hover:bg-green-400/10" 
                        title="Shortlist"
                        onClick={() => updateStatus(applicant.id, "shortlisted")}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-8 w-8 text-red-400 hover:bg-red-500/10" 
                        title="Reject"
                        onClick={() => updateStatus(applicant.id, "rejected")}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {sortedApplicants.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-12 text-gray-500">
                    No applications yet for this job.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default CandidateComparison;
