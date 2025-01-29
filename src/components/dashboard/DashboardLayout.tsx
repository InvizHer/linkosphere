import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
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
  const location = useLocation();

  const tabs = [
    { id: "create", label: "Create Link", icon: PlusCircle },
    { id: "manage", label: "Manage Links", icon: List },
    { id: "stats", label: "Statistics", icon: BarChart2 },
    { id: "profile", label: "Profile", icon: User },
  ];

  // Handle mobile menu visibility on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Desktop Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
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
        </div>
      </nav>

      {/* Mobile Navigation - Footer Menu */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 z-50">
        <div className="grid grid-cols-4 gap-1 p-2">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/dashboard/${tab.id}`)}
              className={`flex flex-col items-center justify-center py-2 ${
                activeTab === tab.id
                  ? "bg-primary/10 text-primary"
                  : "text-gray-600 dark:text-gray-400"
              }`}
            >
              <tab.icon className="h-5 w-5" />
              <span className="text-xs mt-1">{tab.label}</span>
            </Button>
          ))}
        </div>
      </div>

      <main className="container mx-auto px-4 pt-24 pb-24 md:pb-8">
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