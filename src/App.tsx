
import { Toaster } from "@/components/ui/sonner";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./contexts";
import Index from "./pages/Index";
import Group from "./pages/Group";
import SimpleGroupView from "./pages/SimpleGroupView";
import Members from "./pages/Members";
import SimpleExpenseFormPage from "./pages/SimpleExpenseForm";
import Expenses from "./pages/Expenses";
import GroupPot from "./pages/GroupPot";
import GroupPulse from "./pages/GroupPulse";
import Balances from "./pages/Balances";
import Settlements from "./pages/Settlements";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/group" element={<Group />} />
            <Route path="/group/:id" element={<SimpleGroupView />} />
            <Route path="/members" element={<Members />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/expenses/new" element={<SimpleExpenseFormPage />} />
            <Route path="/group/:id/pot" element={<GroupPot />} />
            <Route path="/group/:id/pulse" element={<GroupPulse />} />
            <Route path="/balances" element={<Balances />} />
            <Route path="/settlements" element={<Settlements />} />
          </Routes>
          <Toaster />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
