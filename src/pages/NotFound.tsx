import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Header />
      <div className="container mx-auto px-4 pt-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto text-center"
        >
          <h1 className="text-9xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            404
          </h1>
          <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <Button
            onClick={() => navigate("/")}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Home</span>
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;