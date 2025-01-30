import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  Link,
  PlusCircle,
  List,
  BarChart2,
  User,
  Menu,
} from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeTab: string;
}

export const DashboardLayout = ({ children, activeTab }: DashboardLayoutProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const tabs = [
    { id: "create", label: "Create Link", icon: PlusCircle },
    { id: "manage", label: "Manage Links", icon: List },
    { id: "stats", label: "Statistics", icon: BarChart2 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link className="text-primary h-6 w-6" />
              <span className="ml-2 text-xl font-semibold">LinkManager</span>
            </div>

            <div className="hidden md:flex items-center space-x-4">
              {tabs.map((tab) => (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? "default" : "ghost"}
                  onClick={() => navigate(`/dashboard/${tab.id}`)}
                  className="flex items-center"
                >
                  <tab.icon className="h-4 w-4 mr-2" />
                  {tab.label}
                </Button>
              ))}
              <Button
                variant="ghost"
                onClick={() => navigate("/dashboard/profile")}
                className="flex items-center"
              >
                <User className="h-4 w-4 mr-2" />
                Profile
              </Button>
            </div>

            <Button
              variant="ghost"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>

          {isMobileMenuOpen && (
            <div className="md:hidden py-4 space-y-2">
              {tabs.map((tab) => (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? "default" : "ghost"}
                  onClick={() => {
                    navigate(`/dashboard/${tab.id}`);
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-start"
                >
                  <tab.icon className="h-4 w-4 mr-2" />
                  {tab.label}
                </Button>
              ))}
              <Button
                variant="ghost"
                onClick={() => {
                  navigate("/dashboard/profile");
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-start"
              >
                <User className="h-4 w-4 mr-2" />
                Profile
              </Button>
            </div>
          )}
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
};