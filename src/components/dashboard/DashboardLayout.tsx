
import { Header } from "@/components/layout/Header";
import { MobileFooter } from "@/components/layout/MobileFooter";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeTab: string;
}

export const DashboardLayout = ({ children, activeTab }: DashboardLayoutProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-gray-900 dark:to-slate-900">
      <Header />
      
      <main className="container mx-auto px-4 pt-20 pb-28">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className={cn(
            "max-w-6xl mx-auto rounded-2xl overflow-hidden",
            "border border-slate-100 dark:border-slate-800",
            "bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-xl"
          )}
        >
          <div className="p-6 sm:p-8">
            {children}
          </div>
        </motion.div>
      </main>

      <MobileFooter />
    </div>
  );
};
