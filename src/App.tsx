
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import ExpenseDetail from "./pages/ExpenseDetail";
import ExpenseForm from "./pages/ExpenseForm";
import Balances from "./pages/Balances";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./contexts";
import { WalletProvider } from "./contexts/WalletContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Profile from "./pages/Profile";
import GroupDashboard from "./pages/GroupDashboard";
import GroupView from "./pages/GroupView";
import GroupPot from "./pages/GroupPot";
import GroupPulse from "./pages/GroupPulse";
import Settings from "./pages/Settings";
import { PrivyProvider } from '@privy-io/react-auth';
import { WagmiConfig } from 'wagmi';
import { wagmiConfig, queryClient } from '@/utils/walletConfig';

// Privy configuration
const PRIVY_APP_ID = "cmayii9yh00fpl40mgq8kod1g";

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <PrivyProvider
        appId={PRIVY_APP_ID}
        onSuccess={() => console.log("Privy authentication successful")}
        config={{
          loginMethods: ['email'],
          appearance: {
            theme: 'light',
            accentColor: '#0ea5e9',
          },
        }}
      >
        <BrowserRouter>
          <AuthProvider>
            <WagmiConfig config={wagmiConfig}>
              <WalletProvider>
                <Routes>
                  {/* Public routes */}
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/login" element={<Login />} />
                  
                  {/* Protected routes (require authentication) */}
                  <Route element={<ProtectedRoute />}>
                    <Route path="/" element={<Index />} />
                    <Route path="/expenses/:id" element={<ExpenseDetail />} />
                    <Route path="/expenses/new" element={<ExpenseForm />} />
                    <Route path="/balances" element={<Balances />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/group" element={<GroupDashboard />} />
                    <Route path="/group/:id" element={<GroupView />} />
                    <Route path="/group-pot" element={<GroupPot />} />
                    <Route path="/group-pot/:id" element={<GroupPot />} />
                    <Route path="/group-pulse" element={<GroupPulse />} />
                    <Route path="/group-pulse/:id" element={<GroupPulse />} />
                    <Route path="/settings" element={<Settings />} />
                  </Route>
                  
                  {/* Redirect for authenticated users */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </WalletProvider>
            </WagmiConfig>
          </AuthProvider>
        </BrowserRouter>
      </PrivyProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
