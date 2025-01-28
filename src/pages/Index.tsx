import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AuthModal } from "@/components/auth/AuthModal";

const Index = () => {
  const [authModal, setAuthModal] = useState<{ isOpen: boolean; type: "login" | "signup" }>({
    isOpen: false,
    type: "login",
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-accent/10">
      <nav className="container mx-auto p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-primary">LinkManager</h1>
        <div className="space-x-4">
          <Button
            variant="outline"
            onClick={() => setAuthModal({ isOpen: true, type: "login" })}
          >
            Login
          </Button>
          <Button
            onClick={() => setAuthModal({ isOpen: true, type: "signup" })}
          >
            Sign Up
          </Button>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-5xl font-bold mb-6 animate-fadeIn">
          Manage Your Links <span className="text-primary">Professionally</span>
        </h2>
        <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto animate-fadeIn">
          Create, manage, and share your links with advanced features like password protection,
          analytics, and more.
        </p>
        <Button
          size="lg"
          onClick={() => setAuthModal({ isOpen: true, type: "signup" })}
          className="animate-fadeIn"
        >
          Get Started
        </Button>

        <div className="mt-20 grid md:grid-cols-3 gap-8">
          <div className="p-6 bg-white rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-4">Secure Sharing</h3>
            <p className="text-gray-600">
              Protect your links with passwords and control visibility
            </p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-4">Detailed Analytics</h3>
            <p className="text-gray-600">
              Track views and analyze link performance
            </p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-4">Easy Management</h3>
            <p className="text-gray-600">
              Organize and manage all your links in one place
            </p>
          </div>
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