
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Link, 
  ArrowLeft, 
  Save, 
  Trash2, 
  Eye, 
  Calendar, 
  ExternalLink, 
  Copy, 
  Lock, 
  Globe, 
  Image 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

const LinkEditor = () => {
  const { linkId } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [link, setLink] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState<any[]>([]);

  // Form states
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [originalUrl, setOriginalUrl] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState("");

  useEffect(() => {
    if (user?.id) {
      fetchLink();
      fetchLinkStats();
    }
  }, [linkId, user?.id]);

  const fetchLink = async () => {
    if (!linkId) {
      toast({
        title: "Error",
        description: "No link ID provided",
        variant: "destructive",
      });
      navigate("/dashboard/manage");
      return;
    }

    if (!user?.id) {
      // Wait for user to be loaded
      return;
    }

    try {
      setLoading(true);
      
      // Using maybeSingle instead of single to handle the case where no link is found
      const { data, error } = await supabase
        .from("links")
        .select("*")
        .eq("id", linkId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      
      if (!data) {
        toast({
          title: "Error",
          description: "Link not found or you don't have permission to edit it",
          variant: "destructive",
        });
        navigate("/dashboard/manage");
        return;
      }

      setLink(data);
      setName(data.name || "");
      setDescription(data.description || "");
      setOriginalUrl(data.original_url || "");
      setPassword(data.password || "");
      setShowPassword(data.show_password || false);
      setThumbnailUrl(data.thumbnail_url || "");
      
      setLoading(false);
    } catch (error: any) {
      console.error("Error fetching link:", error.message);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      setLoading(false);
      navigate("/dashboard/manage");
    }
  };

  const fetchLinkStats = async () => {
    if (!linkId || !user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from("link_views")
        .select("*")
        .eq("link_id", linkId)
        .order("viewed_at", { ascending: false });

      if (error) throw error;
      
      setStats(data || []);
    } catch (error: any) {
      console.error("Error fetching link stats:", error.message);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !originalUrl) {
      toast({
        title: "Error",
        description: "Name and URL are required",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);
      
      const { error } = await supabase
        .from("links")
        .update({
          name,
          description,
          original_url: originalUrl,
          password,
          show_password: showPassword,
          thumbnail_url: thumbnailUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", linkId)
        .eq("user_id", user?.id);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Link updated successfully",
      });
      
      setSaving(false);
    } catch (error: any) {
      setSaving(false);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this link?")) {
      return;
    }
    
    try {
      setSaving(true);
      
      const { error } = await supabase
        .from("links")
        .delete()
        .eq("id", linkId)
        .eq("user_id", user?.id);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Link deleted successfully",
      });
      
      navigate("/dashboard/manage");
    } catch (error: any) {
      setSaving(false);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const copyLinkToClipboard = () => {
    if (!link) return;
    
    const url = `${window.location.origin}/view?token=${link.token}`;
    navigator.clipboard.writeText(url);
    
    toast({
      title: "Link Copied",
      description: "The shortened link has been copied to your clipboard.",
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="grid gap-6">
          <div className="flex flex-col space-y-3">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <Skeleton className="h-64 col-span-2" />
            <Skeleton className="h-64" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl mb-20">
      <div className="mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/dashboard/manage")}
          className="text-gray-500 hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Manage Links
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="shadow-md border border-gray-100 dark:border-gray-800">
            <CardHeader>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Edit Link
              </CardTitle>
              <CardDescription>
                Update your link details and settings
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Link Name</Label>
                    <Input
                      id="name"
                      placeholder="My Awesome Link"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="token">Short Link</Label>
                    <div className="flex items-center gap-2">
                      <div className="bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-3 py-2 rounded-l-md border border-r-0 border-gray-200 dark:border-gray-700">
                        {window.location.origin}/view?token=
                      </div>
                      <Input
                        id="token"
                        value={link?.token || ""}
                        readOnly
                        className="rounded-l-none font-mono bg-gray-50 dark:bg-gray-800"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={copyLinkToClipboard}
                        className="flex-shrink-0"
                        title="Copy link"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="original_url">Original URL</Label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-grow">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <Input
                        id="original_url"
                        placeholder="https://example.com/your-long-url"
                        value={originalUrl}
                        onChange={(e) => setOriginalUrl(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => window.open(originalUrl, "_blank")}
                      className="flex-shrink-0"
                      title="Open original URL"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe what this link is for..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="resize-none"
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="thumbnail_url">Thumbnail URL (Optional)</Label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-grow">
                      <Image className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <Input
                        id="thumbnail_url"
                        placeholder="https://example.com/image.jpg"
                        value={thumbnailUrl}
                        onChange={(e) => setThumbnailUrl(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    {thumbnailUrl && (
                      <div className="h-10 w-10 rounded overflow-hidden flex-shrink-0 border border-gray-200 dark:border-gray-700">
                        <img
                          src={thumbnailUrl}
                          alt="Thumbnail"
                          className="h-full w-full object-cover"
                          onError={(e) => (e.currentTarget.src = "/placeholder.svg")}
                        />
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <h3 className="font-medium flex items-center gap-2">
                    <Lock className="h-4 w-4 text-gray-500" />
                    Password Protection
                  </h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Password (Optional)</Label>
                    <Input
                      id="password"
                      type="text"
                      placeholder="Leave empty for no password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    
                    <div className="flex items-center space-x-2 pt-2">
                      <Switch
                        id="show-password"
                        checked={showPassword}
                        onCheckedChange={setShowPassword}
                      />
                      <Label htmlFor="show-password" className="cursor-pointer">
                        Show password to visitors
                      </Label>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-red-800 dark:hover:bg-red-900/20"
                    onClick={handleDelete}
                    disabled={saving}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Link
                  </Button>
                  
                  <Button type="submit" disabled={saving}>
                    {saving ? (
                      "Saving..."
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card className="shadow-md border border-gray-100 dark:border-gray-800">
            <CardHeader>
              <CardTitle>Link Statistics</CardTitle>
              <CardDescription>View performance metrics for this link</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-primary/10 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold">{link?.views || 0}</div>
                  <div className="text-xs text-gray-500">Total Views</div>
                </div>
                <div className="bg-primary/10 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold">{stats.length}</div>
                  <div className="text-xs text-gray-500">Unique Visits</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Recent Activity</h3>
                {stats.length === 0 ? (
                  <div className="text-center py-6 text-gray-500">
                    <Eye className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    <p>No views recorded yet</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-72 overflow-y-auto pr-2">
                    {stats.slice(0, 10).map((view, index) => (
                      <motion.div
                        key={view.id || index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-sm"
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <Eye className="h-3.5 w-3.5 text-primary" />
                            <span>View</span>
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(view.viewed_at).toLocaleString()}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LinkEditor;
