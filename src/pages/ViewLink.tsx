import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";
import { Lock, ExternalLink, ArrowLeft } from "lucide-react";
import { Header } from "@/components/layout/Header";

const ViewLink = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const { toast } = useToast();
  const [link, setLink] = useState<any>(null);
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isPasswordProtected, setIsPasswordProtected] = useState(false);
  const [isPasswordVerified, setIsPasswordVerified] = useState(false);

  useEffect(() => {
    if (token) {
      fetchLink();
    }
  }, [token]);

  const fetchLink = async () => {
    try {
      const { data, error } = await supabase
        .from("links")
        .select("*")
        .eq("token", token)
        .single();

      if (error) throw error;

      setLink(data);
      setIsPasswordProtected(data.show_password);
      if (!data.show_password) {
        incrementViews(data.id);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Link not found",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const incrementViews = async (linkId: string) => {
    try {
      await supabase.rpc("increment_link_views", { link_id: linkId });
    } catch (error) {
      console.error("Error incrementing views:", error);
    }
  };

  const verifyPassword = async () => {
    if (link && password === link.password) {
      setIsPasswordVerified(true);
      incrementViews(link.id);
      window.location.href = link.original_url;
    } else {
      toast({
        title: "Error",
        description: "Incorrect password",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!link) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <Header />
        <div className="container mx-auto px-4 pt-32 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto"
          >
            <h1 className="text-4xl font-bold mb-4">Link Not Found</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              The link you're looking for doesn't exist or has been removed.
            </p>
            <Button
              onClick={() => window.location.href = "/"}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Go Home</span>
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  if (isPasswordProtected && !isPasswordVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <Header />
        <div className="container mx-auto px-4 pt-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-200 dark:border-gray-700"
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Password Protected</h2>
              <p className="text-gray-600 dark:text-gray-400">
                This link is protected. Please enter the password to continue.
              </p>
            </div>
            <div className="space-y-4">
              <Input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && verifyPassword()}
              />
              <Button
                onClick={verifyPassword}
                className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
              >
                Continue
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Header />
      <div className="container mx-auto px-4 pt-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-200 dark:border-gray-700"
        >
          {link.thumbnail_url && (
            <img
              src={link.thumbnail_url}
              alt={link.name}
              className="w-full h-48 object-cover rounded-xl mb-6"
            />
          )}
          <h1 className="text-3xl font-bold mb-4">{link.name}</h1>
          {link.description && (
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {link.description}
            </p>
          )}
          <Button
            onClick={() => window.location.href = link.original_url}
            className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity flex items-center justify-center space-x-2"
          >
            <span>Continue to Website</span>
            <ExternalLink className="w-4 h-4" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default ViewLink;