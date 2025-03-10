
import { useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import DashboardHome from "@/components/dashboard/DashboardHome";
import CreateLink from "@/components/dashboard/CreateLink";
import ManageLinks from "@/components/dashboard/ManageLinks";
import Statistics from "@/components/dashboard/Statistics";
import Profile from "@/components/dashboard/Profile";
import LinkEditor from "@/components/dashboard/LinkEditor";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";

const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-indigo-50 dark:from-indigo-950 dark:via-purple-950 dark:to-indigo-950 flex items-center justify-center">
        <div className="w-full max-w-md p-6">
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4 bg-indigo-200/50 dark:bg-indigo-700/20" />
            <Skeleton className="h-32 w-full bg-indigo-200/50 dark:bg-indigo-700/20" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-24 bg-indigo-200/50 dark:bg-indigo-700/20" />
              <Skeleton className="h-24 bg-indigo-200/50 dark:bg-indigo-700/20" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const getActiveTab = () => {
    const path = location.pathname.split("/")[2] || "home";
    if (path === "edit") return "manage"; // When editing, keep the "manage" tab active
    return path;
  };

  return (
    <DashboardLayout activeTab={getActiveTab()}>
      <Routes>
        <Route index element={<DashboardHome />} />
        <Route path="create" element={<CreateLink />} />
        <Route path="manage" element={<ManageLinks />} />
        <Route path="stats" element={<Statistics />} />
        <Route path="profile" element={<Profile />} />
        <Route path="edit/:linkId" element={<LinkEditor />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </DashboardLayout>
  );
};

export default Dashboard;
