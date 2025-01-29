import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PlusCircle, List, BarChart2, User } from "lucide-react";
import { motion } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { MobileFooter } from "@/components/layout/MobileFooter";
import { useIsMobile } from "@/hooks/use-mobile";

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeTab: string;
}

export const DashboardLayout = ({ children, activeTab }: DashboardLayoutProps) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const tabs = [
    { id: "create", label: "Create Link", icon: PlusCircle },
    { id: "manage", label: "Manage Links", icon: List },
    { id: "stats", label: "Statistics", icon: BarChart2 },
    { id: "profile", label: "Profile", icon: User },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Header />
      
      {!isMobile && (
        <div className="fixed top-16 left-0 right-0 z-40 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
          <div className="container mx-auto px-4">
            <div className="flex space-x-2 py-4">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <Button
                    key={tab.id}
                    variant={isActive ? "default" : "ghost"}
                    onClick={() => navigate(`/dashboard/${tab.id}`)}
                    className="flex items-center space-x-2"
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <main className="container mx-auto px-4 pt-32 pb-24 md:pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {children}
        </motion.div>
      </main>

      <MobileFooter />
    </div>
  );
};