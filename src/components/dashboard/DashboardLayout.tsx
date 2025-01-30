import { Outlet } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { MobileFooter } from "@/components/layout/MobileFooter";
import { motion } from "framer-motion";

const DashboardLayout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Header />
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="pt-16 pb-20 md:pb-8"
      >
        <Outlet />
      </motion.main>
      <MobileFooter />
    </div>
  );
};

export default DashboardLayout;