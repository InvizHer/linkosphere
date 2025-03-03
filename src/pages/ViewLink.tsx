
import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Lock, ExternalLink, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

const ViewLink = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const { toast } = useToast();

  const [link, setLink] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [isPasswordProtected, setIsPasswordProtected] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [viewCounted, setViewCounted] = useState(false);

  useEffect(() => {
    if (token) {
      fetchLink();
    } else {
      setError("No link token provided");
      setLoading(false);
    }
  }, [token]);

  const fetchLink = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("links")
        .select("*")
        .eq("token", token)
        .single();

      if (error) throw error;

      setLink(data);
      setIsPasswordProtected(!!data.password);
      
      // If link is not password protected, consider it authenticated
      if (!data.password) {
        setIsAuthenticated(true);
        recordView(data.id);
      }

      setLoading(false);
    } catch (error: any) {
      console.error("Error fetching link:", error);
      setError("Link not found or has expired");
      setLoading(false);
    }
  };

  const recordView = async (linkId: string) => {
    if (viewCounted) return; // Prevent multiple view counts

    try {
      console.log("Recording view for link ID:", linkId);
      
      // Try to use the RPC function first (preferred method)
      const { error: rpcError } = await supabase.rpc('increment_link_views', { link_id: linkId });
      
      // If RPC fails, fall back to direct update
      if (rpcError) {
        console.log("RPC failed, using direct update:", rpcError);
        
        // First get the current view count
        const { data: linkData, error: fetchError } = await supabase
          .from("links")
          .select("views")
          .eq("id", linkId)
          .single();
          
        if (fetchError) throw fetchError;
        
        const currentViews = linkData?.views || 0;
        
        // Then update with incremented value
        const { error: updateError } = await supabase
          .from("links")
          .update({ views: currentViews + 1 })
          .eq("id", linkId);
          
        if (updateError) throw updateError;
      }

      // Also record the view in the link_views table for statistics
      const { error: viewError } = await supabase
        .from("link_views")
        .insert({
          link_id: linkId,
          viewed_at: new Date().toISOString(),
        });

      if (viewError && viewError.code !== '23505') {
        console.error("Error recording view stat:", viewError);
      }
      
      console.log("View recorded successfully");
      setViewCounted(true);
    } catch (error: any) {
      console.error("Error recording view:", error);
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password === link?.password) {
      setIsAuthenticated(true);
      setPasswordError(false);
      recordView(link.id);
    } else {
      setPasswordError(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Link Error</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <Link to="/">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (isPasswordProtected && !isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
        >
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Lock className="h-6 w-6 text-primary" />
            </div>
          </div>
          
          <h1 className="text-xl font-bold text-center mb-2">Password Protected Link</h1>
          <p className="text-center text-gray-500 dark:text-gray-400 mb-4">
            This link is protected by a password. Please enter the password to continue.
          </p>
          
          {link?.show_password && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md mb-4">
              <p className="text-sm text-blue-600 dark:text-blue-400">
                <span className="font-medium">Hint:</span> The password is <span className="font-mono bg-blue-100 dark:bg-blue-800/30 px-1.5 py-0.5 rounded">{link.password}</span>
              </p>
            </div>
          )}
          
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <Input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={passwordError ? "border-red-500" : ""}
              />
              {passwordError && (
                <p className="text-red-500 text-sm mt-1">Incorrect password</p>
              )}
            </div>
            
            <Button type="submit" className="w-full">
              Unlock Link
            </Button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
      >
        <div className="flex justify-center mb-6">
          {link?.thumbnail_url ? (
            <div className="h-24 w-24 rounded-full overflow-hidden border-4 border-primary/20">
              <img 
                src={link.thumbnail_url} 
                alt={link.name} 
                className="h-full w-full object-cover"
                onError={(e) => (e.currentTarget.src = "/placeholder.svg")}
              />
            </div>
          ) : (
            <div className="h-24 w-24 flex items-center justify-center bg-primary/10 rounded-full">
              <ExternalLink className="h-8 w-8 text-primary" />
            </div>
          )}
        </div>
        
        <h1 className="text-2xl font-bold text-center mb-2">{link?.name}</h1>
        
        {link?.description && (
          <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
            {link.description}
          </p>
        )}
        
        <Button 
          onClick={() => window.location.href = link?.original_url}
          className="w-full mb-4"
        >
          <ExternalLink className="mr-2 h-4 w-4" />
          Continue to Destination
        </Button>
        
        <p className="text-center text-xs text-gray-500 dark:text-gray-400">
          You are being redirected to: {link?.original_url}
        </p>
      </motion.div>
    </div>
  );
};

export default ViewLink;
