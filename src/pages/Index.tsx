
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Link, Shield, Zap, ArrowRight, Globe, Users, ChartBar, Lock, MousePointer, Sparkles, BarChart4 } from "lucide-react";
import { LoginModal } from "@/components/auth/LoginModal";
import { SignupModal } from "@/components/auth/SignupModal";
import { ThemeToggle } from "@/components/theme-toggle";
import { Footer } from "@/components/layout/Footer";

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (user) {
      navigate("/dashboard/create");
    }
    
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [user, navigate]);

  const features = [
    {
      icon: Link,
      title: "Smart Links",
      description: "Create memorable links that are easy to share and track",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: Shield,
      title: "Privacy Protection",
      description: "Add password protection to your sensitive links",
      color: "from-green-500 to-green-600",
    },
    {
      icon: BarChart4,
      title: "Detailed Analytics",
      description: "Get powerful insights about your link performance",
      color: "from-purple-500 to-purple-600",
    },
    {
      icon: Sparkles,
      title: "Custom Branding",
      description: "Personalize your links with your brand identity",
      color: "from-orange-500 to-orange-600",
    },
    {
      icon: MousePointer,
      title: "One-Click Sharing",
      description: "Share links across platforms with a single click",
      color: "from-pink-500 to-pink-600",
    },
    {
      icon: Globe,
      title: "Global Reach",
      description: "Share your content with audiences worldwide",
      color: "from-indigo-500 to-indigo-600",
    },
  ];

  const handleShowLogin = () => {
    setShowSignupModal(false);
    setShowLoginModal(true);
  };

  const handleShowSignup = () => {
    setShowLoginModal(false);
    setShowSignupModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      {/* Navigation */}
      <motion.nav 
        className={`fixed top-0 left-0 right-0 z-50 ${
          scrolled ? 'bg-white/90 dark:bg-gray-900/90 shadow-md' : 'bg-transparent'
        } transition-all duration-300 backdrop-blur-sm`}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-2xl font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent flex items-center"
            >
              <Link className="w-6 h-6 mr-2 stroke-indigo-500" />
              Lincly
            </motion.div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <div className="hidden sm:flex gap-4 items-center">
                <Button variant="ghost" onClick={handleShowLogin} className="hover:bg-gray-100 dark:hover:bg-gray-800">
                  Sign In
                </Button>
                <Button 
                  onClick={handleShowSignup}
                  className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:opacity-90 text-white"
                >
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-32 lg:pt-40 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-4xl mx-auto"
        >
          <motion.div 
            className="mb-6 inline-block"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <span className="px-4 py-1.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full text-sm font-medium">
              Link Management Reimagined
            </span>
          </motion.div>
          
          <motion.h1 
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent leading-tight"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Transform Your Links Into<br />Powerful Business Tools
          </motion.h1>
          
          <motion.p 
            className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Create memorable, branded links with advanced analytics and privacy features.
            Track performance and engage your audience like never before.
          </motion.p>
          
          {/* Mobile Buttons */}
          <motion.div 
            className="flex flex-col sm:hidden gap-4 px-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Button
              size="lg"
              className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:opacity-90 text-white"
              onClick={handleShowSignup}
            >
              Get Started
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full"
              onClick={handleShowLogin}
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
              className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:opacity-90 text-white px-8 py-6 text-lg rounded-full flex items-center gap-2 group"
              onClick={handleShowSignup}
            >
              Get Started
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="px-8 py-6 text-lg rounded-full border-2"
              onClick={handleShowLogin}
            >
              Sign In
            </Button>
          </motion.div>
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-24"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                whileHover={{ scale: 1.02, y: -5 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 * index }}
              >
                <div className={`h-2 bg-gradient-to-r ${feature.color}`} />
                <div className="p-6">
                  <div className={`w-12 h-12 mb-4 rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
        
        {/* Testimonial Section */}
        <motion.div 
          className="mt-24 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950/20 dark:via-purple-950/20 dark:to-pink-950/20 rounded-2xl p-8 md:p-12"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-2">Trusted by Marketers Worldwide</h2>
            <p className="text-gray-600 dark:text-gray-400">See what our customers say about Lincly</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-300 to-purple-300 dark:from-indigo-600 dark:to-purple-600"></div>
                  <div className="ml-4">
                    <h4 className="font-semibold">Jane Smith</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Marketing Director</p>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                  "Lincly has transformed how we share content. The analytics are invaluable for understanding our audience."
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* CTA Section */}
      <motion.div 
        className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 py-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Ready to Elevate Your Link Management?</h2>
          <Button 
            size="lg" 
            onClick={handleShowSignup}
            className="bg-white text-indigo-600 hover:bg-gray-100 px-8 py-6 text-lg rounded-full"
          >
            Get Started Now
          </Button>
        </div>
      </motion.div>

      {/* Footer */}
      <Footer />

      {/* Auth Modals */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSwitchToSignup={handleShowSignup}
      />
      <SignupModal
        isOpen={showSignupModal}
        onClose={() => setShowSignupModal(false)}
        onSwitchToLogin={handleShowLogin}
      />
    </div>
  );
};

export default Index;
