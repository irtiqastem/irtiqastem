import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { Layout } from "./components/Layout";
import Index from "./pages/Index";
import OlympiadTracks from "./pages/OlympiadTracks";
import Practice from "./pages/Practice";
import Resources from "./pages/Resources";
import Scholarships from "./pages/Scholarships";
import StemHub from "./pages/StemHub";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import Blog from "./pages/Blog";
import Blog from "./pages/Blog";
import Blog from "./pages/Blog";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <HashRouter>
        <AuthProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/olympiad-tracks" element={<OlympiadTracks />} />
              <Route path="/stem-hub" element={<StemHub />} />
              <Route path="/practice" element={<Practice />} />
              <Route path="/resources" element={<Resources />} />
              <Route path="/scholarships" element={<Scholarships />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </AuthProvider>
      </HashRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
