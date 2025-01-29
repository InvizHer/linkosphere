import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";
import { Share2, Copy, ExternalLink, Lock } from "lucide-react";

const ViewLink = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [link, setLink] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const fetchLink = async () => {
      if (!token) {
        setError("Invalid link");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("links")
        .select("*")
        .eq("token", token)
        .single();

      if (error) {
        setError("Link not found");
        setLoading(false);
        return;
      }

      setLink(data);
      setLoading(false);

      // Increment views
      await supabase.rpc("increment_link_views", { link_id: data.id });
    };

    fetchLink();
  }, [token]);

  const handlePasswordSubmit = () => {
    if (password === link.password) {
      window.location.href = link.original_url;
    } else {
      toast({
        title: "Error",
        description: "Incorrect password",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: link.name,
        text: link.description,
        url: window.location.href,
      });
    } catch (error) {
      // Fallback to copying to clipboard
      handleCopyLink();
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link copied",
      description: "The link has been copied to your clipboard",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-4">{error}</h1>
          <Link to="/" className="text-primary hover:underline">
            Go back home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md mx-auto"
      >
        <div className="bg-white/10 dark:bg-gray-800/10 backdrop-blur-lg rounded-3xl shadow-xl overflow-hidden">
          {link.thumbnail_url && (
            <img
              src={link.thumbnail_url}
              alt={link.name}
              className="w-full h-48 object-cover"
            />
          )}
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {link.name}
            </h1>
            {link.description && (
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {link.description}
              </p>
            )}
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-6">
              <span>Views: {link.views}</span>
              <span className="mx-2">•</span>
              <span>Created: {new Date(link.created_at).toLocaleDateString()}</span>
            </div>

            <div className="space-y-4">
              {link.password ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                    <Lock className="h-4 w-4" />
                    <span>This link is password protected</span>
                  </div>
                  {link.show_password && (
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Password: {link.password}
                    </div>
                  )}
                  <Input
                    type="password"
                    placeholder="Enter password to access link"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-white/5 border-0"
                  />
                  <Button
                    className="w-full"
                    onClick={handlePasswordSubmit}
                  >
                    Access Link
                  </Button>
                </div>
              ) : (
                <Button
                  className="w-full"
                  onClick={() => window.location.href = link.original_url}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Visit Link
                </Button>
              )}

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  className="flex-1 bg-white/5 border-0"
                  onClick={handleShare}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 bg-white/5 border-0"
                  onClick={handleCopyLink}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="text-center">
                <h2 className="text-lg font-semibold mb-2">Create Your Own Links</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Want to create your own custom links? Join LinkManager today!
                </p>
                <Link to="/">
                  <Button variant="default" className="w-full">
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ViewLink;