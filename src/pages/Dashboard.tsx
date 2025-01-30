import { useEffect } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import CreateLink from "@/components/dashboard/CreateLink";
import ManageLinks from "@/components/dashboard/ManageLinks";
import Statistics from "@/components/dashboard/Statistics";
import Profile from "@/components/dashboard/Profile";

const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null;
  }

  const getActiveTab = () => {
    const path = location.pathname.split("/")[2] || "create";
    return path;
  };

  return (
    <DashboardLayout activeTab={getActiveTab()}>
      <Routes>
        <Route path="create" element={<CreateLink />} />
        <Route path="manage" element={<ManageLinks />} />
        <Route path="stats" element={<Statistics />} />
        <Route path="profile" element={<Profile />} />
        <Route path="*" element={<Navigate to="/dashboard/create" replace />} />
      </Routes>
    </DashboardLayout>
  );
};

export default Dashboard;