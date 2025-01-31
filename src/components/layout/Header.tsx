import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { User, PlusCircle, List, BarChart2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion } from "framer-motion";

export const Header = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const currentPath = location.pathname.split("/")[2] || "create";

  const tabs = [
    { id: "create", label: "Create Link", icon: PlusCircle },
    { id: "manage", label: "Manage Links", icon: List },
    { id: "stats", label: "Statistics", icon: BarChart2 },
  ];

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700"
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/dashboard/create")}
            className="cursor-pointer"
          >
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              LinkManager
            </span>
          </motion.div>

          {!isMobile && (
            <div className="flex-1 flex justify-center space-x-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = currentPath === tab.id;

                return (
                  <Button
                    key={tab.id}
                    variant={isActive ? "default" : "ghost"}
                    onClick={() => navigate(`/dashboard/${tab.id}`)}
                    className={`relative flex items-center space-x-2 ${
                      isActive
                        ? "bg-primary text-white before:absolute before:bottom-0 before:left-0 before:w-full before:h-1 before:bg-primary/20 before:rounded-t-full"
                        : "hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </Button>
                );
              })}
            </div>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard/profile")}
            className="relative"
          >
            <User className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </motion.header>
  );
};