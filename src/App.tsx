import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "@/components/ui/toaster";
import Index from "@/pages/Index";
import ViewLink from "@/pages/ViewLink";
import Dashboard from "@/pages/Dashboard";
import DashboardHome from "@/components/dashboard/DashboardHome";
import CreateLink from "@/components/dashboard/CreateLink";
import ManageLinks from "@/components/dashboard/ManageLinks";
import EditLink from "@/pages/EditLink";
import Statistics from "@/components/dashboard/Statistics";
import Profile from "@/components/dashboard/Profile";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

function App() {
  return (
    <Router>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/view" element={<ViewLink />} />
              <Route path="/dashboard" element={<Dashboard />}>
                <Route index element={<DashboardHome />} />
                <Route path="create" element={<CreateLink />} />
                <Route path="manage" element={<ManageLinks />} />
                <Route path="edit" element={<EditLink />} />
                <Route path="statistics" element={<Statistics />} />
                <Route path="profile" element={<Profile />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
          </AuthProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;