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
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center"
            >
              <Link className="text-primary h-6 w-6" />
              <span className="ml-2 text-xl font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                LinkManager
              </span>
            </motion.div>

            <div className="hidden md:flex items-center space-x-2">
              {tabs.map((tab) => (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? "default" : "ghost"}
                  onClick={() => navigate(`/dashboard/${tab.id}`)}
                  className="flex items-center transition-all duration-300 hover:scale-105"
                >
                  <tab.icon className="h-4 w-4 mr-2" />
                  {tab.label}
                </Button>
              ))}
              <Button
                variant="ghost"
                onClick={() => navigate("/dashboard/profile")}
                className="flex items-center transition-all duration-300 hover:scale-105"
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
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>

          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden py-4 space-y-2"
              >
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
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      <main className="container mx-auto px-4 pt-24 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
};