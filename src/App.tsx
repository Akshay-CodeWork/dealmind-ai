import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { PipelineProvider } from "@/contexts/PipelineContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import UploadPage from "@/pages/UploadPage";
import CleaningResults from "@/pages/CleaningResults";
import DiscrepancyResults from "@/pages/DiscrepancyResults";
import LegalResults from "@/pages/LegalResults";
import Summary from "@/pages/Summary";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <PipelineProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/upload" element={<ProtectedRoute><UploadPage /></ProtectedRoute>} />
              <Route path="/cleaning" element={<ProtectedRoute><CleaningResults /></ProtectedRoute>} />
              <Route path="/discrepancy" element={<ProtectedRoute><DiscrepancyResults /></ProtectedRoute>} />
              <Route path="/legal" element={<ProtectedRoute><LegalResults /></ProtectedRoute>} />
              <Route path="/summary" element={<ProtectedRoute><Summary /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </PipelineProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
