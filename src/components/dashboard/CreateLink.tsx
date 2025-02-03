import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Link, Lock, Image, FileText, Copy, ExternalLink, PartyPopper, Clock, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

const DEFAULT_THUMBNAIL = "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b";

const CreateLink = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [createdLink, setCreatedLink] = useState<string | null>(null);
  const createdLinkRef = useRef<HTMLDivElement>(null);
  const [recentLinks, setRecentLinks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordField, setShowPasswordField] = useState(false);
  const [useDefaultThumbnail, setUseDefaultThumbnail] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    original_url: "",
    thumbnail_url: "",
    password: "",
    show_password: false,
  });

  useEffect(() => {
    const fetchRecentLinks = async () => {
      const { data } = await supabase
        .from("links")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false })
        .limit(3);
      
      if (data) {
        setRecentLinks(data);
      }
    };

    if (user) {
      fetchRecentLinks();
    }
  }, [user, createdLink]);

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const lines = e.target.value.split('\n');
    if (lines.length <= 2) {
      setFormData({ ...formData, description: e.target.value });
    } else {
      toast({
        title: "Description limit reached",
        description: "Description is limited to 2 lines",
        variant: "destructive",
      });
    }
  };

  const clearForm = () => {
    setFormData({
      name: "",
      description: "",
      original_url: "",
      thumbnail_url: "",
      password: "",
      show_password: false,
    });
    setShowPasswordField(false);
    setUseDefaultThumbnail(true);
  };

  const validateDescription = (description: string) => {
    const lines = description.split('\n');
    return lines.length <= 2;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateDescription(formData.description)) {
      toast({
        title: "Invalid Description",
        description: "Please limit the description to 2 lines",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("links")
        .insert({
          name: formData.name,
          description: formData.description || null,
          original_url: formData.original_url,
          thumbnail_url: formData.thumbnail_url || (useDefaultThumbnail ? DEFAULT_THUMBNAIL : null),
          password: showPasswordField ? formData.password : null,
          show_password: formData.show_password,
          user_id: user?.id,
        } as any)
        .select()
        .single();

      if (error) throw error;

      const linkUrl = `${window.location.origin}/view?token=${data.token}`;
      setCreatedLink(linkUrl);
      clearForm();

      toast({
        title: "Link Created",
        description: "Your link has been created successfully",
      });

      setTimeout(() => {
        createdLinkRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
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

  const copyToClipboard = async () => {
    if (createdLink) {
      await navigator.clipboard.writeText(createdLink);
      toast({
        title: "Copied!",
        description: "Link copied to clipboard",
      });
    }
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              <Link className="h-6 w-6" />
              Create New Link
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Link Name
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-gray-200 dark:border-gray-700 focus:border-primary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Description (Max 2 lines)
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={handleDescriptionChange}
                  className="two-line-description bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-gray-200 dark:border-gray-700 focus:border-primary"
                  placeholder="Enter a brief description (max 2 lines)"
                />
                {!validateDescription(formData.description) && (
                  <Alert variant="destructive">
                    <AlertDescription>
                      Description cannot exceed 2 lines
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="original_url" className="flex items-center gap-2">
                  <Link className="h-4 w-4" />
                  Original URL
                </Label>
                <Input
                  id="original_url"
                  type="url"
                  value={formData.original_url}
                  onChange={(e) =>
                    setFormData({ ...formData, original_url: e.target.value })
                  }
                  required
                  className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-gray-200 dark:border-gray-700 focus:border-primary"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="thumbnail_url" className="flex items-center gap-2">
                    <Image className="h-4 w-4" />
                    Thumbnail URL (Optional)
                  </Label>
                  <Switch
                    checked={useDefaultThumbnail}
                    onCheckedChange={setUseDefaultThumbnail}
                    aria-label="Use default thumbnail"
                  />
                </div>
                {!useDefaultThumbnail && (
                  <Input
                    id="thumbnail_url"
                    type="url"
                    value={formData.thumbnail_url}
                    onChange={(e) =>
                      setFormData({ ...formData, thumbnail_url: e.target.value })
                    }
                    className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-gray-200 dark:border-gray-700 focus:border-primary"
                    placeholder="Enter custom thumbnail URL"
                  />
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Password Protection
                  </Label>
                  <Switch
                    checked={showPasswordField}
                    onCheckedChange={setShowPasswordField}
                    aria-label="Enable password protection"
                  />
                </div>
                {showPasswordField && (
                  <div className="space-y-4">
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-gray-200 dark:border-gray-700 focus:border-primary"
                      required={showPasswordField}
                    />
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="show_password"
                        checked={formData.show_password}
                        onCheckedChange={(checked) =>
                          setFormData({ ...formData, show_password: checked })
                        }
                      />
                      <Label htmlFor="show_password">Show password to visitors</Label>
                    </div>
                  </div>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity relative"
                disabled={isLoading}
              >
                {isLoading ? (
                  <motion.div
                    className="flex items-center gap-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating Link...
                  </motion.div>
                ) : (
                  "Create Link"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>

      <AnimatePresence>
        {createdLink && (
          <motion.div
            ref={createdLinkRef}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg border border-gray-200 dark:border-gray-700 max-w-2xl mx-auto"
          >
            <div className="flex items-center gap-2 mb-4 text-primary">
              <PartyPopper className="h-6 w-6" />
              <h3 className="text-xl font-semibold">Congratulations!</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Your link has been created successfully. You can now share it with others!
            </p>
            <div className="flex flex-col space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Your Link:</span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyToClipboard}
                    className="flex items-center gap-1"
                  >
                    <Copy className="h-4 w-4" />
                    Copy
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(createdLink, "_blank")}
                    className="flex items-center gap-1"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Visit
                  </Button>
                </div>
              </div>
              <Input
                value={createdLink}
                readOnly
                className="bg-white dark:bg-gray-800 font-mono text-sm"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recent Links Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="max-w-2xl mx-auto"
      >
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Links
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/dashboard/manage")}
              className="flex items-center gap-2"
            >
              <Link className="h-4 w-4" />
              Manage All Links
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {recentLinks.map((link) => (
                <motion.div
                  key={link.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.02 }}
                  className="relative group overflow-hidden rounded-lg bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 p-4"
                >
                  <div className="flex flex-col h-full">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium line-clamp-1">{link.name}</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(`/view?token=${link.token}`, "_blank")}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-2">
                      {link.description || link.original_url}
                    </p>
                    <div className="mt-auto flex items-center text-xs text-gray-500 dark:text-gray-400">
                      <Clock className="h-3 w-3 mr-1" />
                      {new Date(link.created_at).toLocaleDateString()}
                      {link.views > 0 && (
                        <span className="ml-2 flex items-center">
                          <Check className="h-3 w-3 mr-1" />
                          {link.views} views
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
              {recentLinks.length === 0 && (
                <div className="col-span-2 text-center text-gray-500 dark:text-gray-400 py-8">
                  <p className="text-lg font-medium mb-2">No links created yet</p>
                  <p className="text-sm">Create your first link above to get started!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default CreateLink;