
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
  Image,
  FileText,
  Tag,
  Clock,
  BarChart2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

// Define form schema
const linkFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  description: z.string().optional(),
  original_url: z.string().url({ message: "Please enter a valid URL" }),
  password: z.string().optional(),
  show_password: z.boolean().default(false),
  thumbnail_url: z.string().url({ message: "Please enter a valid URL" }).optional().or(z.literal("")),
});

type LinkFormValues = z.infer<typeof linkFormSchema>;

const LinkEditor = () => {
  const { linkId } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [link, setLink] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [stats, setStats] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("details");

  // Form handling with react-hook-form
  const form = useForm<LinkFormValues>({
    resolver: zodResolver(linkFormSchema),
    defaultValues: {
      name: "",
      description: "",
      original_url: "",
      password: "",
      show_password: false,
      thumbnail_url: "",
    },
  });

  useEffect(() => {
    fetchLink();
    fetchLinkStats();
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
      
      // Set form values
      form.reset({
        name: data.name || "",
        description: data.description || "",
        original_url: data.original_url || "",
        password: data.password || "",
        show_password: data.show_password || false,
        thumbnail_url: data.thumbnail_url || "",
      });
      
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

  const onSubmit = async (values: LinkFormValues) => {
    try {
      setSaving(true);
      
      const { error } = await supabase
        .from("links")
        .update({
          name: values.name,
          description: values.description,
          original_url: values.original_url,
          password: values.password,
          show_password: values.show_password,
          thumbnail_url: values.thumbnail_url,
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
      
      // Refresh link data
      fetchLink();
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
      setDeleting(true);
      
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
      setDeleting(false);
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

  const openOriginalUrl = () => {
    if (link?.original_url) {
      window.open(link.original_url, "_blank");
    }
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
      {/* Header with Back Button */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/dashboard/manage")}
            className="text-gray-500 hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Manage Links
          </Button>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1 text-xs">
              <Calendar className="h-3 w-3" /> 
              Created: {format(new Date(link?.created_at), 'MMM dd, yyyy')}
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1 text-xs">
              <Clock className="h-3 w-3" /> 
              Updated: {format(new Date(link?.updated_at), 'MMM dd, yyyy')}
            </Badge>
          </div>
        </div>
        
        {/* Title and Link Preview */}
        <div className="mt-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
            {link?.name}
          </h1>
          <div className="flex items-center flex-wrap gap-2 text-sm text-gray-500 mt-2">
            <div 
              className="group flex items-center gap-1.5 bg-primary/10 px-3 py-1 rounded-full cursor-pointer"
              onClick={copyLinkToClipboard}
            >
              <Link className="h-3.5 w-3.5 text-primary" />
              <span className="font-mono text-primary">{window.location.origin}/view?token={link?.token}</span>
              <Copy className="h-3.5 w-3.5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" /> {link?.views || 0} views
            </Badge>
          </div>
        </div>
      </div>
      
      {/* Main Content with Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 w-full mb-6">
              <TabsTrigger value="details">
                <FileText className="h-4 w-4 mr-2" /> Link Details
              </TabsTrigger>
              <TabsTrigger value="analytics">
                <BarChart2 className="h-4 w-4 mr-2" /> Analytics
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="details">
              <Card className="shadow-md border border-gray-100 dark:border-gray-800">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    Edit Link Details
                  </CardTitle>
                  <CardDescription>
                    Update your link details and settings
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Link Name</FormLabel>
                              <FormControl>
                                <Input placeholder="My Awesome Link" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="space-y-2">
                          <Label htmlFor="token">Short Link Token</Label>
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
                      
                      <FormField
                        control={form.control}
                        name="original_url"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Original URL</FormLabel>
                            <div className="flex items-center gap-2">
                              <div className="relative flex-grow">
                                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                                <FormControl>
                                  <Input
                                    placeholder="https://example.com/your-long-url"
                                    className="pl-10"
                                    {...field}
                                  />
                                </FormControl>
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={openOriginalUrl}
                                className="flex-shrink-0"
                                title="Open original URL"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description (Optional)</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Describe what this link is for..."
                                className="resize-none"
                                rows={3}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="thumbnail_url"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Thumbnail URL (Optional)</FormLabel>
                            <div className="flex items-center gap-2">
                              <div className="relative flex-grow">
                                <Image className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                                <FormControl>
                                  <Input
                                    placeholder="https://example.com/image.jpg"
                                    className="pl-10"
                                    {...field}
                                  />
                                </FormControl>
                              </div>
                              {field.value && (
                                <div className="h-10 w-10 rounded overflow-hidden flex-shrink-0 border border-gray-200 dark:border-gray-700">
                                  <img
                                    src={field.value}
                                    alt="Thumbnail"
                                    className="h-full w-full object-cover"
                                    onError={(e) => (e.currentTarget.src = "/placeholder.svg")}
                                  />
                                </div>
                              )}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                        <h3 className="font-medium flex items-center gap-2">
                          <Lock className="h-4 w-4 text-gray-500" />
                          Password Protection
                        </h3>
                        
                        <FormField
                          control={form.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password (Optional)</FormLabel>
                              <FormControl>
                                <Input
                                  type="text"
                                  placeholder="Leave empty for no password"
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                Add a password to restrict access to your link
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="show_password"
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-2">
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-0.5">
                                <FormLabel>Show password to visitors</FormLabel>
                                <FormDescription>
                                  Display the password on the link page
                                </FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="flex justify-between pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-red-800 dark:hover:bg-red-900/20"
                          onClick={handleDelete}
                          disabled={deleting}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          {deleting ? "Deleting..." : "Delete Link"}
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
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="analytics">
              <Card className="shadow-md border border-gray-100 dark:border-gray-800">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    Link Statistics
                  </CardTitle>
                  <CardDescription>
                    View performance metrics for this link
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                    <Card className="bg-primary/5 border-primary/10">
                      <CardContent className="p-4 text-center">
                        <p className="text-xs uppercase text-gray-500 dark:text-gray-400 mb-1">Total Views</p>
                        <p className="text-3xl font-bold text-primary">{link?.views || 0}</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-primary/5 border-primary/10">
                      <CardContent className="p-4 text-center">
                        <p className="text-xs uppercase text-gray-500 dark:text-gray-400 mb-1">Unique Visits</p>
                        <p className="text-3xl font-bold text-primary">{stats.length}</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-primary/5 border-primary/10 col-span-2 md:col-span-1">
                      <CardContent className="p-4 text-center">
                        <p className="text-xs uppercase text-gray-500 dark:text-gray-400 mb-1">Created</p>
                        <p className="text-lg font-semibold text-primary">{format(new Date(link?.created_at), 'MMM dd, yyyy')}</p>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-gray-500" />
                      Recent Activity
                    </h3>
                    {stats.length === 0 ? (
                      <div className="text-center py-10 text-gray-500 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                        <Eye className="h-10 w-10 mx-auto mb-2 opacity-30" />
                        <p className="text-lg font-medium">No views recorded yet</p>
                        <p className="text-sm mt-1">Views will appear here once your link is visited</p>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                        <AnimatePresence>
                          {stats.slice(0, 20).map((view, index) => (
                            <motion.div
                              key={view.id || index}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.03 }}
                              className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg"
                            >
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                  <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                                    <Eye className="h-4 w-4 text-primary" />
                                  </div>
                                  <div>
                                    <div className="font-medium">View</div>
                                    <div className="text-xs text-gray-500">
                                      {view.user_agent?.split(' ')[0] || "Unknown browser"}
                                    </div>
                                  </div>
                                </div>
                                <div className="text-xs text-gray-500">
                                  {format(new Date(view.viewed_at), 'MMM dd, yyyy HH:mm')}
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        <div>
          <Card className="shadow-md border border-gray-100 dark:border-gray-800 sticky top-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-4 w-4" /> Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                className="w-full"
                variant="outline"
                onClick={copyLinkToClipboard}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Shortened Link
              </Button>
              
              <Button
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600"
                onClick={openOriginalUrl}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Original URL
              </Button>
              
              <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                <h3 className="text-sm font-medium mb-2">Link Preview</h3>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    {link?.thumbnail_url ? (
                      <div className="h-10 w-10 rounded-md overflow-hidden bg-white">
                        <img 
                          src={link.thumbnail_url} 
                          alt={link.name}
                          className="h-full w-full object-cover"
                          onError={(e) => (e.currentTarget.src = "/placeholder.svg")}
                        />
                      </div>
                    ) : (
                      <div className="h-10 w-10 rounded-md bg-primary/20 flex items-center justify-center">
                        <Link className="h-5 w-5 text-primary" />
                      </div>
                    )}
                    <div>
                      <div className="font-medium line-clamp-1">{link?.name}</div>
                      <div className="text-xs text-gray-500">{window.location.origin}/view?token={link?.token}</div>
                    </div>
                  </div>
                  {link?.description && (
                    <div className="text-xs text-gray-500 line-clamp-3 mt-2 pl-2 border-l-2 border-primary/30">
                      {link.description}
                    </div>
                  )}
                </div>
              </div>
              
              {link?.password && (
                <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                  <h3 className="text-sm font-medium mb-2 flex items-center gap-1.5">
                    <Lock className="h-4 w-4 text-amber-500" />
                    Password Protected
                  </h3>
                  <div className="bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300 p-3 rounded-lg text-sm">
                    This link is protected with a password:
                    <code className="font-mono bg-white dark:bg-gray-800 px-1.5 py-0.5 rounded ml-1 text-xs">
                      {link?.password}
                    </code>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LinkEditor;
