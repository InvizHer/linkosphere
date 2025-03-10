
import { Header } from "@/components/layout/Header";
import { MobileFooter } from "@/components/layout/MobileFooter";
import { motion } from "framer-motion";

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeTab: string;
}

export const DashboardLayout = ({ children, activeTab }: DashboardLayoutProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-indigo-50 dark:from-indigo-950 dark:via-purple-950 dark:to-indigo-950">
      <Header />
      
      <main className="container mx-auto px-4 pt-20 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-6xl mx-auto"
        >
          {children}
        </motion.div>
      </main>

      <MobileFooter />
    </div>
  );
};
