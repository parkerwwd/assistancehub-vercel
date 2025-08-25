
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Section8 from "./pages/Section8";
import PHADetail from "./pages/PHADetail";
import PropertyDetail from "./pages/PropertyDetail";
import SNAP from "./pages/SNAP";
import DataAdmin from "./pages/DataAdmin";
import Auth from "./pages/Auth";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import { SearchMapProvider } from "./contexts/SearchMapContext";
import LeadFlowPage from "./pages/LeadFlow";
import EnhancedFlowRenderer from "./components/LeadFlow/EnhancedFlowRenderer";
import FlowBuilder from "./pages/FlowBuilder";
import FlowEditor from "./pages/FlowEditor";
import LeadsManager from "./pages/LeadsManager";
import FlowCreateWizard from "./pages/FlowCreateWizard";
import AdminAnalytics from "./pages/AdminAnalytics";
import AdminABTesting from "./pages/AdminABTesting";
import AdminTeam from "./pages/AdminTeam";
import AdminIntegrations from "./pages/AdminIntegrations";
import AdminLogicBuilder from "./pages/AdminLogicBuilder";
import AdminAIOptimization from "./pages/AdminAIOptimization";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/section8" element={
            <SearchMapProvider>
              <Section8 />
            </SearchMapProvider>
          } />
          <Route path="/pha/:id" element={
            <SearchMapProvider>
              <PHADetail />
            </SearchMapProvider>
          } />
          <Route path="/property/:id" element={
            <SearchMapProvider>
              <PropertyDetail />
            </SearchMapProvider>
          } />
          <Route path="/snap" element={<SNAP />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/data-admin" element={
            <ProtectedRoute>
              <DataAdmin />
            </ProtectedRoute>
          } />
          <Route path="/about" element={<About />} />
          <Route path="/flow/:slug" element={<EnhancedFlowRenderer />} />
          <Route path="/admin/flows" element={
            <ProtectedRoute>
              <FlowBuilder />
            </ProtectedRoute>
          } />
          <Route path="/admin/flows/new" element={
            <ProtectedRoute>
              <FlowCreateWizard />
            </ProtectedRoute>
          } />
          <Route path="/admin/flows/:id/edit" element={
            <ProtectedRoute>
              <FlowEditor />
            </ProtectedRoute>
          } />
          <Route path="/admin/leads" element={
            <ProtectedRoute>
              <LeadsManager />
            </ProtectedRoute>
          } />
          <Route path="/admin/analytics" element={
            <ProtectedRoute>
              <AdminAnalytics />
            </ProtectedRoute>
          } />
          <Route path="/admin/analytics/:flowId" element={
            <ProtectedRoute>
              <AdminAnalytics />
            </ProtectedRoute>
          } />
          <Route path="/admin/ab-testing" element={
            <ProtectedRoute>
              <AdminABTesting />
            </ProtectedRoute>
          } />
          <Route path="/admin/team" element={
            <ProtectedRoute>
              <AdminTeam />
            </ProtectedRoute>
          } />
          <Route path="/admin/integrations" element={
            <ProtectedRoute>
              <AdminIntegrations />
            </ProtectedRoute>
          } />
          <Route path="/admin/logic-builder" element={
            <ProtectedRoute>
              <AdminLogicBuilder />
            </ProtectedRoute>
          } />
          <Route path="/admin/logic-builder/:flowId" element={
            <ProtectedRoute>
              <AdminLogicBuilder />
            </ProtectedRoute>
          } />
          <Route path="/admin/ai-optimization" element={
            <ProtectedRoute>
              <AdminAIOptimization />
            </ProtectedRoute>
          } />
          <Route path="/admin/ai-optimization/:flowId" element={
            <ProtectedRoute>
              <AdminAIOptimization />
            </ProtectedRoute>
          } />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
