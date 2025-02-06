import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Share2,
  Copy,
  ExternalLink,
  Lock,
  Eye,
  Calendar,
  Heart,
  LinkIcon,
  Facebook,
  Twitter,
  MessageCircle,
  MessageSquare,
} from "lucide-react";

import { Footer } from "@/components/layout/Footer";

const ViewLink = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [link, setLink] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isVerified, setIsVerified] = useState(false);
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
      setIsVerified(true);
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

  const handleShare = (platform: string) => {
    const shareUrl = window.location.href;
    const urls = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(shareUrl)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        shareUrl
      )}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(
        shareUrl
      )}`,
    };

    window.open(urls[platform as keyof typeof urls], "_blank");
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link
              to="/"
              className="flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors"
            >
              <LinkIcon className="h-6 w-6" />
              <span className="font-semibold">LinkManager</span>
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Share2 className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleShare("whatsapp")}>
                  <MessageSquare className="h-4 w-4 mr-2" color="#25D366" />
                  WhatsApp
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleShare("telegram")}>
                  <MessageCircle className="h-4 w-4 mr-2" color="#0088cc" />
                  Telegram
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleShare("facebook")}>
                  <Facebook className="h-4 w-4 mr-2" color="#1877f2" />
                  Facebook
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleShare("twitter")}>
                  <Twitter className="h-4 w-4 mr-2" color="#1da1f2" />
                  Twitter
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleCopyLink}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Link
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 pt-24 pb-24 flex-grow">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          {/* Link Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden">
            {link.thumbnail_url && (
              <div className="relative h-48 md:h-64">
                <img
                  src={link.thumbnail_url}
                  alt={link.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h1 className="text-2xl font-bold mb-2">{link.name}</h1>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {link.views} views
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(link.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="p-6 space-y-6">
              {link.description && (
                <p className="text-gray-600 dark:text-gray-400">
                  {link.description}
                </p>
              )}

              {link.password && !isVerified ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Lock className="h-4 w-4 text-primary" />
                    <span>This link is password protected</span>
                  </div>
                  {link.show_password && (
                    <div className="text-sm text-gray-500">
                      Password: {link.password}
                    </div>
                  )}
                  <Input
                    type="password"
                    placeholder="Enter password to access link"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-gray-50 dark:bg-gray-900"
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
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <span className="text-gray-600 dark:text-gray-400 break-all">
                        {link.original_url}
                      </span>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            navigator.clipboard.writeText(link.original_url)
                          }
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copy
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(link.original_url, "_blank")}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Visit
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Promotional Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8 text-center bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6"
          >
            <h2 className="text-2xl font-bold mb-4">Want to create your own link?</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Start creating professional, trackable links with advanced features like password protection and analytics.
            </p>
            <Link
              to="/signup"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary/90 transition-colors"
            >
              Get Started
            </Link>
          </motion.div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default ViewLink;
