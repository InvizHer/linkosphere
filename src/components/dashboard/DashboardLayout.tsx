
import { Header } from "@/components/layout/Header";
import { MobileFooter } from "@/components/layout/MobileFooter";
import { motion } from "framer-motion";

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeTab: string;
}

export const DashboardLayout = ({ children, activeTab }: DashboardLayoutProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-900 dark:to-blue-950">
      <Header />
      
      <main className="container mx-auto px-4 pt-20 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-6xl mx-auto"
        >
          {children}
        </motion.div>
      </main>

      <MobileFooter />
    </div>
  );
};
