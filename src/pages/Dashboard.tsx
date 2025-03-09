
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
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-900 dark:to-blue-950 pt-20">
        <div className="container mx-auto p-6 max-w-6xl">
          <div className="space-y-6">
            <Skeleton className="h-14 w-52 rounded-xl" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Skeleton className="h-44 rounded-xl" />
              <Skeleton className="h-44 rounded-xl md:col-span-2" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Skeleton className="h-64 rounded-xl" />
              <Skeleton className="h-64 rounded-xl" />
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
