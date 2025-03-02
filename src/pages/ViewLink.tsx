
import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";
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
  ArrowRight,
  Clock,
  Shield,
  Check,
  QrCode,
  ArrowUpRight,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Footer } from "@/components/layout/Footer";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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

      // Record view if not password protected or already verified
      if (!data.password || isVerified) {
        await recordView(data.id);
      }
    };

    fetchLink();
  }, [token, isVerified]);

  const recordView = async (linkId: string) => {
    try {
      // Insert view record
      await supabase.from("link_views").insert({
        link_id: linkId,
        ip_address: "anonymous", // You could implement IP tracking if needed
        user_agent: navigator.userAgent,
      });

      // Increment the views counter
      await supabase.rpc("increment_link_views", { link_id: linkId });
    } catch (error) {
      console.error("Error recording view:", error);
    }
  };

  const handlePasswordSubmit = async () => {
    if (password === link.password) {
      setIsVerified(true);
      await recordView(link.id);
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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center p-8 rounded-xl bg-white/90 dark:bg-gray-800/90 shadow-xl border border-gray-100/50 dark:border-gray-700/50"
        >
          <h1 className="text-2xl font-bold text-red-500 mb-4">{error}</h1>
          <Link to="/" className="text-indigo-600 hover:underline dark:text-indigo-400">
            Go back home
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link
              to="/"
              className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
            >
              <LinkIcon className="h-6 w-6" />
              <span className="font-semibold">LinkManager</span>
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30">
                  <Share2 className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-lg">
                <DropdownMenuItem onClick={() => handleShare("whatsapp")} className="hover:bg-indigo-50 dark:hover:bg-indigo-900/30 cursor-pointer">
                  <MessageSquare className="h-4 w-4 mr-2" color="#25D366" />
                  WhatsApp
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleShare("telegram")} className="hover:bg-indigo-50 dark:hover:bg-indigo-900/30 cursor-pointer">
                  <MessageCircle className="h-4 w-4 mr-2" color="#0088cc" />
                  Telegram
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleShare("facebook")} className="hover:bg-indigo-50 dark:hover:bg-indigo-900/30 cursor-pointer">
                  <Facebook className="h-4 w-4 mr-2" color="#1877f2" />
                  Facebook
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleShare("twitter")} className="hover:bg-indigo-50 dark:hover:bg-indigo-900/30 cursor-pointer">
                  <Twitter className="h-4 w-4 mr-2" color="#1da1f2" />
                  Twitter
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleCopyLink} className="hover:bg-indigo-50 dark:hover:bg-indigo-900/30 cursor-pointer">
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
          className="max-w-3xl mx-auto"
        >
          {/* Link Card */}
          <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-100/50 dark:border-gray-700/50 shadow-xl overflow-hidden rounded-xl">
            {link.thumbnail_url && (
              <div className="relative h-52 md:h-72">
                <img
                  src={link.thumbnail_url}
                  alt={link.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h1 className="text-2xl md:text-3xl font-bold mb-3">{link.name}</h1>
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <span className="flex items-center gap-1 bg-black/30 px-3 py-1 rounded-full">
                      <Eye className="h-4 w-4" />
                      {link.views} views
                    </span>
                    <span className="flex items-center gap-1 bg-black/30 px-3 py-1 rounded-full">
                      <Calendar className="h-4 w-4" />
                      {new Date(link.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <CardContent className="p-6 space-y-6">
              {link.description && (
                <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed border-l-4 border-indigo-500 pl-4 py-2 bg-indigo-50/50 dark:bg-indigo-900/20 rounded-r-lg">
                  {link.description}
                </p>
              )}

              {link.password && !isVerified ? (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="space-y-4 p-6 bg-indigo-50/50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-700/50"
                >
                  <div className="flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 mb-2">
                    <Lock className="h-5 w-5" />
                    <span className="font-medium">This link is password protected</span>
                  </div>
                  {link.show_password && (
                    <div className="text-sm bg-white/80 dark:bg-gray-800/80 p-3 rounded-lg border border-indigo-100 dark:border-indigo-700/50">
                      <span className="font-medium">Password:</span> {link.password}
                    </div>
                  )}
                  <Input
                    type="password"
                    placeholder="Enter password to access link"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-white dark:bg-gray-900 border-indigo-200 dark:border-indigo-700 shadow-sm"
                  />
                  <Button
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                    onClick={handlePasswordSubmit}
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    Access Link
                  </Button>
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <Card className="border-indigo-100 dark:border-indigo-800/50 bg-white dark:bg-gray-900/50 shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg font-medium text-gray-700 dark:text-gray-300">Original URL</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="text-indigo-600 dark:text-indigo-400 text-base font-medium break-all">
                          {link.original_url}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              navigator.clipboard.writeText(link.original_url)
                            }
                            className="border-indigo-200 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
                          >
                            <Copy className="h-4 w-4 mr-2" />
                            Copy
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => window.open(link.original_url, "_blank")}
                            className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:opacity-90 text-white border-0"
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Visit
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-0 pb-3 px-6">
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <Clock className="h-3 w-3" />
                        <span>Last accessed {new Date().toLocaleDateString()}</span>
                      </div>
                    </CardFooter>
                  </Card>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                    <div className="bg-white/80 dark:bg-gray-800/80 p-4 rounded-xl border border-gray-100/50 dark:border-gray-700/50 shadow-sm flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <h3 className="font-medium">Verified Link</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Safe to access</p>
                      </div>
                    </div>
                    <div className="bg-white/80 dark:bg-gray-800/80 p-4 rounded-xl border border-gray-100/50 dark:border-gray-700/50 shadow-sm flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                        <QrCode className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div>
                        <h3 className="font-medium">Easy Sharing</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Share across platforms</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>

          {/* Promotional Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-xl shadow-xl border border-indigo-100/50 dark:border-indigo-800/30 overflow-hidden"
          >
            <div className="p-6 md:p-8 flex flex-col md:flex-row items-center gap-6">
              <div className="text-center md:text-left">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">Create your own professional links</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-lg">
                  Start creating branded, trackable links with advanced features like password protection, custom thumbnails, and comprehensive analytics.
                </p>
                <Link
                  to="/signup"
                  className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-500/20 transition-all"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </div>
              <div className="hidden md:block bg-white/20 dark:bg-gray-700/20 rounded-lg p-1 flex-shrink-0">
                <img 
                  src="https://images.unsplash.com/photo-1557853197-aefb550b6fdc?auto=format&fit=crop&w=300&q=80" 
                  alt="Analytics" 
                  className="w-48 h-48 object-cover rounded-lg"
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default ViewLink;
