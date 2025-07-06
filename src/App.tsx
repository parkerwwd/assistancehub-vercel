
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Section8 from "./pages/Section8";
import PHADetail from "./pages/PHADetail";
import SNAP from "./pages/SNAP";
import DataAdmin from "./pages/DataAdmin";
import Auth from "./pages/Auth";
import State from "./pages/State";
import StateOffices from "./pages/StateOffices";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/section8" element={<Section8 />} />
          <Route path="/pha/:id" element={<PHADetail />} />
          <Route path="/snap" element={<SNAP />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/state/:state" element={<State />} />
          <Route path="/state/:state/offices" element={<StateOffices />} />
          <Route path="/data-admin" element={
            <ProtectedRoute>
              <DataAdmin />
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
