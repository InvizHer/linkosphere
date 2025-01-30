import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AuthModal } from "@/components/auth/AuthModal";
import { motion } from "framer-motion";

const Index = () => {
  const [authModal, setAuthModal] = useState<{ isOpen: boolean; type: "login" | "signup" }>({
    isOpen: false,
    type: "login",
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5">
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-sm border-b border-gray-200 bg-white/50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
          >
            LinkManager
          </motion.h1>
          <div className="space-x-2 md:space-x-4">
            <Button
              variant="ghost"
              onClick={() => setAuthModal({ isOpen: true, type: "login" })}
              className="hover:scale-105 transition-transform"
            >
              Login
            </Button>
            <Button
              onClick={() => setAuthModal({ isOpen: true, type: "signup" })}
              className="hover:scale-105 transition-transform"
            >
              Sign Up
            </Button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 pt-32 pb-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <h2 className="text-4xl md:text-6xl font-bold">
              Manage Your Links{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Professionally
              </span>
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              Create, manage, and share your links with advanced features like password protection,
              analytics, and more.
            </p>
            <Button
              size="lg"
              onClick={() => setAuthModal({ isOpen: true, type: "signup" })}
              className="hover:scale-105 transition-transform"
            >
              Get Started
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid md:grid-cols-3 gap-6 mt-20"
          >
            {[
              {
                title: "Secure Sharing",
                description: "Protect your links with passwords and control visibility",
                gradient: "from-blue-500 to-purple-500",
              },
              {
                title: "Detailed Analytics",
                description: "Track views and analyze link performance",
                gradient: "from-purple-500 to-pink-500",
              },
              {
                title: "Easy Management",
                description: "Organize and manage all your links in one place",
                gradient: "from-pink-500 to-orange-500",
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="p-6 rounded-2xl bg-white/50 backdrop-blur-sm border border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`h-1 w-20 mb-4 rounded bg-gradient-to-r ${feature.gradient}`} />
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </main>

      <AuthModal
        isOpen={authModal.isOpen}
        onClose={() => setAuthModal({ ...authModal, isOpen: false })}
        type={authModal.type}
      />
    </div>
  );
};

export default Index;