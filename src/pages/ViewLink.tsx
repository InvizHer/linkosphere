import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";
import { Share2, Copy, ExternalLink, Lock, Eye, Calendar, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-2">
              <ArrowLeft className="h-5 w-5" />
              <span className="font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Back to Home
              </span>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 pt-24 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto space-y-8"
        >
          {loading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <h1 className="text-2xl font-bold text-red-500 mb-4">{error}</h1>
              <Link to="/" className="text-primary hover:underline">
                Go back home
              </Link>
            </div>
          ) : (
            <>
              {/* Link Data Card */}
              <Card className="overflow-hidden bg-white/10 dark:bg-gray-800/10 backdrop-blur-lg border-0 shadow-xl">
                {link.thumbnail_url && (
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={link.thumbnail_url}
                      alt={link.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    {link.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {link.description && (
                    <p className="text-gray-600 dark:text-gray-400">
                      {link.description}
                    </p>
                  )}
                  
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      <span>{link.views} views</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>Created {new Date(link.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

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
                        className="bg-white/5 border-gray-200 dark:border-gray-700"
                      />
                      <Button
                        className="w-full"
                        onClick={handlePasswordSubmit}
                      >
                        <Lock className="h-4 w-4 mr-2" />
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
                </CardContent>
              </Card>

              {/* Share and Promotional Section */}
              <div className="space-y-8">
                <Card className="bg-white/10 dark:bg-gray-800/10 backdrop-blur-lg border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Button
                        variant="outline"
                        className="flex-1 bg-white/5 border-gray-200 dark:border-gray-700"
                        onClick={handleShare}
                      >
                        <Share2 className="h-4 w-4 mr-2" />
                        Share Link
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 bg-white/5 border-gray-200 dark:border-gray-700"
                        onClick={handleCopyLink}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Link
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-0 shadow-lg">
                  <CardContent className="p-6 text-center">
                    <h2 className="text-xl font-semibold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                      Create Your Own Custom Links
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Join LinkManager today and start creating your own personalized links with advanced features!
                    </p>
                    <Link to="/">
                      <Button variant="default" className="w-full sm:w-auto">
                        Get Started
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-t border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Powered by LinkManager © {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default ViewLink;