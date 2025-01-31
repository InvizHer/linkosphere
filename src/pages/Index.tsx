import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Link, Shield, Zap, ArrowRight, Globe, Users } from "lucide-react";
import { AuthModal } from "@/components/auth/AuthModal";
import { ThemeToggle } from "@/components/theme-toggle";

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authType, setAuthType] = useState<"login" | "signup">("signup");

  useEffect(() => {
    if (user) {
      navigate("/dashboard/create");
    }
  }, [user, navigate]);

  const features = [
    {
      icon: Link,
      title: "Smart Link Management",
      description: "Create and manage custom links with advanced tracking capabilities",
    },
    {
      icon: Shield,
      title: "Secure Sharing",
      description: "Password protection and privacy controls for sensitive content",
    },
    {
      icon: Globe,
      title: "Global Access",
      description: "Share your links worldwide with real-time analytics",
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Work together seamlessly with shared link management",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
            >
              LinkManager
            </motion.div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <div className="hidden sm:flex gap-4">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setAuthType("login");
                    setShowAuthModal(true);
                  }}
                >
                  Sign In
                </Button>
                <Button
                  onClick={() => {
                    setAuthType("signup");
                    setShowAuthModal(true);
                  }}
                >
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-32 lg:pt-40 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-4xl mx-auto"
        >
          <motion.h1 
            className="text-4xl sm:text-5xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent"
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            Transform Your Links
            <br />
            Into Powerful Tools
          </motion.h1>
          <motion.p 
            className="text-lg sm:text-xl lg:text-2xl text-gray-600 dark:text-gray-300 mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Create, share, and track your links with powerful analytics
            <br className="hidden sm:block" />
            and advanced security features
          </motion.p>
          
          {/* Mobile Buttons */}
          <motion.div 
            className="flex flex-col sm:hidden gap-4 px-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Button
              size="lg"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 text-white"
              onClick={() => {
                setAuthType("signup");
                setShowAuthModal(true);
              }}
            >
              Get Started
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full"
              onClick={() => {
                setAuthType("login");
                setShowAuthModal(true);
              }}
            >
              Sign In
            </Button>
          </motion.div>

          {/* Desktop Buttons */}
          <motion.div 
            className="hidden sm:flex justify-center gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 text-white px-8 py-6 text-lg rounded-full flex items-center gap-2 group"
              onClick={() => {
                setAuthType("signup");
                setShowAuthModal(true);
              }}
            >
              Get Started
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="px-8 py-6 text-lg rounded-full"
              onClick={() => {
                setAuthType("login");
                setShowAuthModal(true);
              }}
            >
              Sign In
            </Button>
          </motion.div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-24"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                whileHover={{ scale: 1.02 }}
                className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-200 dark:border-gray-700 flex flex-col items-center text-center group cursor-pointer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 * index }}
              >
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:from-blue-500/20 group-hover:to-purple-500/20 transition-colors">
                  <Icon className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        type={authType}
      />
    </div>
  );
};

export default Index;