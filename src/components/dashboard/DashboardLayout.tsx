
import { Header } from "@/components/layout/Header";
import { MobileFooter } from "@/components/layout/MobileFooter";
import { motion } from "framer-motion";

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeTab: string;
}

export const DashboardLayout = ({ children, activeTab }: DashboardLayoutProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-indigo-950">
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
