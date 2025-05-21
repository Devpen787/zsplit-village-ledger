
import Signup from "./pages/Signup";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import ExpenseDetail from "./pages/ExpenseDetail";
import ExpenseForm from "./pages/ExpenseForm";
import Balances from "./pages/Balances";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/signup" element={<Signup />} />
            
            {/* Protected routes (require authentication) */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Index />} />
              <Route path="/expenses/:id" element={<ExpenseDetail />} />
              <Route path="/expenses/new" element={<ExpenseForm />} />
              <Route path="/balances" element={<Balances />} />
            </Route>

            {/* Admin-only routes */}
            {/* <Route element={<ProtectedRoute requiredRole="admin" />}>
              <Route path="/admin" element={<AdminPanel />} />
            </Route> */}
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
