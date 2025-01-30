import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PlusCircle, List, BarChart2 } from "lucide-react";
import { motion } from "framer-motion";

export const MobileFooter = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname.split("/")[2] || "create";

  const tabs = [
    { id: "create", label: "Create", icon: PlusCircle },
    { id: "manage", label: "Manage", icon: List },
    { id: "stats", label: "Stats", icon: BarChart2 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-0 left-0 right-0 md:hidden bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700 z-50"
    >
      <div className="grid grid-cols-3 gap-1 p-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentPath === tab.id;

          return (
            <Button
              key={tab.id}
              variant={isActive ? "default" : "ghost"}
              size="sm"
              onClick={() => navigate(`/dashboard/${tab.id}`)}
              className={`flex flex-col items-center justify-center py-2 ${
                isActive ? "bg-primary/10 text-primary" : ""
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs mt-1">{tab.label}</span>
            </Button>
          );
        })}
      </div>
    </motion.div>
  );
};