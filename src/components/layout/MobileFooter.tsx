
import { useNavigate, useLocation } from "react-router-dom";
import { PlusCircle, List, BarChart2, Home } from "lucide-react";
import { motion } from "framer-motion";

export const MobileFooter = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname.split("/")[2] || "home";

  const tabs = [
    { id: "home", label: "Home", icon: Home },
    { id: "create", label: "Create", icon: PlusCircle },
    { id: "manage", label: "Links", icon: List },
    { id: "stats", label: "Stats", icon: BarChart2 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-0 left-0 right-0 md:hidden bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-sky-100 dark:border-slate-800 shadow-lg z-50"
    >
      <nav className="grid grid-cols-4 p-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentPath === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() =>
                navigate(`/dashboard${tab.id === "home" ? "" : `/${tab.id}`}`)
              }
              className={`relative flex flex-col items-center justify-center py-2 transition-all duration-300 ${
                isActive ? "text-blue-600" : "text-slate-500 dark:text-slate-400"
              }`}
            >
              <div className={`relative ${isActive ? 'z-10' : ''}`}>
                {isActive && (
                  <motion.div
                    layoutId="tabBackground"
                    className="absolute inset-0 -m-1 rounded-full bg-blue-100/60 dark:bg-blue-900/30 w-10 h-10"
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 30
                    }}
                  />
                )}
                <div className="relative z-10 flex items-center justify-center w-8 h-8">
                  <Icon className={`h-5 w-5 ${isActive ? "text-blue-600" : "text-slate-500 dark:text-slate-400"}`} />
                </div>
              </div>
              <span className="text-[10px] mt-0.5 font-medium">
                {tab.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute bottom-0.5 w-1 h-1 rounded-full bg-blue-600"
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                  }}
                />
              )}
            </button>
          );
        })}
      </nav>
    </motion.div>
  );
};
