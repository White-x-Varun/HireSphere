import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { setAuthTokenGetter } from "@workspace/api-client-react";
import { getToken } from "@/lib/api";
import Navbar from "@/components/Navbar";
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Jobs from "@/pages/Jobs";
import JobDetail from "@/pages/JobDetail";
import SeekerDashboard from "@/pages/SeekerDashboard";
import RecruiterDashboard from "@/pages/RecruiterDashboard";
import Resumes from "@/pages/Resumes";
import AtsAnalyzer from "@/pages/AtsAnalyzer";
import Apply from "@/pages/Apply";
import NotFound from "@/pages/not-found";

// Set up auth token getter so generated hooks include JWT in requests
setAuthTokenGetter(() => getToken());

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

function Router() {
  return (
    <>
      <Navbar />
      <Switch>
        <Route path="/" component={Landing} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/jobs" component={Jobs} />
        <Route path="/jobs/:id" component={JobDetail} />
        <Route path="/seeker" component={SeekerDashboard} />
        <Route path="/recruiter" component={RecruiterDashboard} />
        <Route path="/resume" component={Resumes} />
        <Route path="/ats" component={AtsAnalyzer} />
        <Route path="/apply/:jobId" component={Apply} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
