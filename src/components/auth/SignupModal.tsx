import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { User, Mail, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface SignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

export const SignupModal = ({ isOpen, onClose, onSwitchToLogin }: SignupModalProps) => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const { toast } = useToast();
  const { signUp } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const checkUsernameExists = async (username: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', username)
      .single();
    return !!data;
  };

  const checkEmailExists = async (email: string) => {
    const { data, error } = await supabase.auth.signInWithOtp({
      email: email,
    });
    return !error || error.message.includes('already registered');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Check if username exists
      const usernameExists = await checkUsernameExists(formData.username);
      if (usernameExists) {
        toast({
          title: "Username already taken",
          description: "Please choose a different username",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Check if email exists
      const emailExists = await checkEmailExists(formData.email);
      if (emailExists) {
        toast({
          title: "Email already registered",
          description: "Please use a different email or sign in",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      await signUp(formData.email, formData.password, formData.username);
      toast({
        title: "Account Created",
        description: "Please check your email to verify your account",
      });
      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-purple-600 to-pink-600" />
        <div className="p-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">
              Create Account
            </DialogTitle>
          </DialogHeader>
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSubmit}
            className="space-y-6 mt-6"
          >
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                  className="pl-10"
                  placeholder="Choose a username"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="pl-10"
                  placeholder="Enter your email"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  className="pl-10"
                  placeholder="Create a password"
                  minLength={6}
                />
              </div>
            </div>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 transition-opacity text-white"
            >
              {isLoading ? "Creating account..." : "Create Account"}
            </Button>
            <div className="text-center space-y-2">
              <div className="text-sm text-gray-500">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={onSwitchToLogin}
                  className="text-purple-600 hover:text-purple-700 font-medium"
                >
                  Sign in
                </button>
              </div>
            </div>
          </motion.form>
        </div>
      </DialogContent>
    </Dialog>
  );
};