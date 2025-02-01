import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";
import ShareModal from "@/components/share/ShareModal";
import {
  Share2,
  Copy,
  ExternalLink,
  Lock,
  Eye,
  Calendar,
  Heart,
  LinkIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const ViewLink = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [link, setLink] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#9b87f5]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-4">{error}</h1>
          <Link to="/" className="text-[#9b87f5] hover:underline">
            Go back home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link
              to="/"
              className="flex items-center space-x-2 text-[#9b87f5] hover:text-[#7E69AB] transition-colors"
            >
              <LinkIcon className="h-6 w-6" />
              <span className="font-semibold">LinkManager</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsShareModalOpen(true)}
                className="text-[#9b87f5] hover:text-[#7E69AB]"
              >
                <Share2 className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCopyLink}
                className="text-[#9b87f5] hover:text-[#7E69AB]"
              >
                <Copy className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 pt-24 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto space-y-8"
        >
          <Card className="overflow-hidden bg-white/10 dark:bg-gray-800/10 backdrop-blur-lg border-0 shadow-xl">
            {link.thumbnail_url && (
              <div className="relative h-48 overflow-hidden">
                <img
                  src={link.thumbnail_url}
                  alt={link.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <h1 className="text-2xl font-bold">{link.name}</h1>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className="flex items-center">
                      <Eye className="h-4 w-4 mr-1" />
                      {link.views} views
                    </span>
                    <span className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(link.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            )}
            <CardContent className="p-6 space-y-6">
              {link.description && (
                <p className="text-gray-600 dark:text-gray-400">
                  {link.description}
                </p>
              )}

              <div className="space-y-4">
                {link.password ? (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                      <Lock className="h-4 w-4 text-[#9b87f5]" />
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
                      className="bg-white/5 border-gray-200 dark:border-gray-700"
                    />
                    <Button
                      className="w-full bg-[#9b87f5] hover:bg-[#7E69AB] text-white"
                      onClick={handlePasswordSubmit}
                    >
                      <Lock className="h-4 w-4 mr-2" />
                      Access Link
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-white/5 dark:bg-gray-800/5 rounded-lg">
                      <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                        <ExternalLink className="h-4 w-4 text-[#9b87f5]" />
                        <span className="truncate">{link.original_url}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            navigator.clipboard.writeText(link.original_url)
                          }
                          className="text-[#9b87f5] hover:text-[#7E69AB]"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            window.open(link.original_url, "_blank")
                          }
                          className="text-[#9b87f5] hover:text-[#7E69AB]"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-t border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Powered by LinkManager © {new Date().getFullYear()}
            </p>
            <div className="flex items-center space-x-2">
              <Heart className="h-4 w-4 text-[#9b87f5]" />
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Made with love
              </span>
            </div>
          </div>
        </div>
      </footer>

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        url={window.location.href}
      />
    </div>
  );
};

export default ViewLink;