import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  Link,
  Share2,
  Shield,
  Zap,
  ArrowRight,
  Globe,
  Users,
  ChevronRight,
} from "lucide-react";
import { AuthModal } from "@/components/auth/AuthModal";
import { useState } from "react";
import { Header } from "@/components/layout/Header";

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
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Shield,
      title: "Secure Sharing",
      description: "Password protection and privacy controls for sensitive content",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: Globe,
      title: "Global Access",
      description: "Share your links worldwide with real-time analytics",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Work together seamlessly with shared link management",
      color: "from-orange-500 to-amber-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Header />
      
      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-32 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-4xl mx-auto"
        >
          <motion.h1 
            className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent"
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            Link Management
            <br />
            Reimagined
          </motion.h1>
          <motion.p 
            className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Create, share, and track your links with powerful analytics
            <br />
            and advanced security features
          </motion.p>
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-white px-8 py-6 text-lg rounded-full flex items-center gap-2 group w-full sm:w-auto"
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
              className="px-8 py-6 text-lg rounded-full w-full sm:w-auto"
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
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-32"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                className="glass p-8 rounded-2xl border border-gray-200 dark:border-gray-700 flex flex-col items-center text-center group cursor-pointer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 * index }}
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-6 text-white`}>
                  <Icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* How It Works Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-32 text-center"
        >
          <h2 className="text-4xl font-bold mb-16 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Create Your Link",
                description: "Enter your URL and customize your link settings",
                icon: Link,
              },
              {
                step: "2",
                title: "Share Anywhere",
                description: "Share your link across any platform or device",
                icon: Share2,
              },
              {
                step: "3",
                title: "Track Performance",
                description: "Monitor views and engagement in real-time",
                icon: Zap,
              },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={index}
                  className="relative"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 * index }}
                >
                  <div className="glass p-8 rounded-2xl border border-gray-200 dark:border-gray-700">
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                      {item.step}
                    </div>
                    <Icon className="w-12 h-12 mx-auto mb-6 text-primary" />
                    <h3 className="text-xl font-semibold mb-4">{item.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {item.description}
                    </p>
                  </div>
                  {index < 2 && (
                    <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                      <ChevronRight className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            © {new Date().getFullYear()} LinkManager. All rights reserved.
          </p>
        </div>
      </footer>

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