import { useNavigate, useLocation } from "react-router-dom";
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
      className="fixed bottom-0 left-0 right-0 md:hidden bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-t border-gray-200 dark:border-gray-800 shadow-lg z-50"
    >
      <div className="grid grid-cols-3 gap-1 p-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentPath === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => navigate(`/dashboard/${tab.id}`)}
              className={`relative flex flex-col items-center justify-center py-3 px-2 rounded-lg transition-all duration-200 ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-gray-500 hover:text-primary hover:bg-primary/5"
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? "animate-pulse" : ""}`} />
              <span className="text-xs mt-1 font-medium">{tab.label}</span>
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute -bottom-2 left-1/2 w-12 h-1 bg-primary rounded-full -translate-x-1/2"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </motion.div>
  );
};