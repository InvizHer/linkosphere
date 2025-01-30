import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Link, Share2, Shield, Zap } from "lucide-react";
import AuthModal from "@/components/auth/AuthModal";

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/dashboard/create");
    }
  }, [user, navigate]);

  const features = [
    {
      icon: Link,
      title: "Custom Links",
      description: "Create personalized, memorable links for your content",
    },
    {
      icon: Shield,
      title: "Secure Sharing",
      description: "Optional password protection for sensitive content",
    },
    {
      icon: Share2,
      title: "Easy Sharing",
      description: "Share your links across any platform with one click",
    },
    {
      icon: Zap,
      title: "Real-time Analytics",
      description: "Track views and engagement with detailed statistics",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-3xl mx-auto"
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Link Management Made Simple
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-8">
            Create, manage, and track your links with our powerful platform
          </p>
          <AuthModal>
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              Get Started
            </Button>
          </AuthModal>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-16"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                className="bg-white/10 dark:bg-gray-800/10 backdrop-blur-sm p-6 rounded-xl border border-gray-200 dark:border-gray-700"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
};

export default Index;