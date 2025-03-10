
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
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
  BarChart2,
  CheckCircle,
  X,
  AlertCircle,
  Info,
  Key,
  Palette,
  Layout,
  Shield,
  Clipboard,
  Code,
  ArrowUpRight,
  LinkIcon,
  Pencil,
  User as UserIcon
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Badge } from "@/components/ui/badge";
import { format, formatDistanceToNow } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Define form schema
const linkFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  description: z.string().optional(),
  original_url: z.string().url({ message: "Please enter a valid URL" }),
  password: z.string().optional(),
  show_password: z.boolean().default(false),
  thumbnail_url: z.string().url({ message: "Please enter a valid URL" }).optional().or(z.literal("")),
  color: z.string().optional(),
});

// Extended link type to include the color property
interface Link {
  created_at: string;
  description: string;
  id: string;
  name: string;
  original_url: string;
  password: string;
  show_password: boolean;
  thumbnail_url: string;
  token: string;
  updated_at: string;
  user_id: string;
  views: number;
  color?: string;
}

type LinkFormValues = z.infer<typeof linkFormSchema>;

const colorOptions = [
  { value: "indigo", label: "Indigo", class: "bg-indigo-500" },
  { value: "purple", label: "Purple", class: "bg-purple-500" },
  { value: "blue", label: "Blue", class: "bg-blue-500" },
  { value: "green", label: "Green", class: "bg-green-500" },
  { value: "amber", label: "Amber", class: "bg-amber-500" },
  { value: "red", label: "Red", class: "bg-red-500" },
  { value: "pink", label: "Pink", class: "bg-pink-500" },
  { value: "teal", label: "Teal", class: "bg-teal-500" },
];

const LinkEditor = () => {
  const { linkId } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const [link, setLink] = useState<Link | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [stats, setStats] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("details");
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [isFormDirty, setIsFormDirty] = useState(false);

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
      color: "indigo"
    },
  });

  useEffect(() => {
    fetchLink();
    fetchLinkStats();
  }, [linkId, user?.id]);

  useEffect(() => {
    const subscription = form.watch(() => {
      setIsFormDirty(true);
    });
    return () => subscription.unsubscribe();
  }, [form.watch]);

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
        color: data.color || "indigo"
      });
      
      setIsFormDirty(false);
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
          color: values.color,
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
      setIsFormDirty(false);
      
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

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    return formatDistanceToNow(date, { addSuffix: true });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl mb-20">
      {/* Header with Back Button */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/dashboard/manage")}
            className="text-gray-500 hover:text-primary w-fit"
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Manage Links
          </Button>
          
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1 text-xs">
              <Calendar className="h-3 w-3" /> 
              {link?.created_at ? format(new Date(link.created_at), 'MMM dd, yyyy') : 'N/A'}
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1 text-xs">
              <Clock className="h-3 w-3" /> 
              {link?.updated_at ? formatTimeAgo(link.updated_at) : 'N/A'}
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1 text-xs">
              <Eye className="h-3 w-3" /> 
              {link?.views || 0} views
            </Badge>
          </div>
        </div>
        
        {/* Title and Link Preview */}
        <div className="mt-4 mb-6">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Edit: {link?.name}
          </h1>
          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 mt-2">
            <div 
              className="group flex items-center gap-1.5 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 px-3 py-1 rounded-full cursor-pointer max-w-full"
              onClick={copyLinkToClipboard}
            >
              <Link className="h-3.5 w-3.5 text-indigo-500 flex-shrink-0" />
              <span className="font-mono text-indigo-600 dark:text-indigo-400 truncate">{window.location.origin}/view?token={link?.token}</span>
              <Copy className="h-3.5 w-3.5 text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content with Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 w-full mb-6">
              <TabsTrigger value="details" className="text-sm">
                <FileText className="h-4 w-4 mr-2" /> Link Details
              </TabsTrigger>
              <TabsTrigger value="analytics" className="text-sm">
                <BarChart2 className="h-4 w-4 mr-2" /> Analytics
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="details">
              <Card className="shadow-md border border-indigo-100 dark:border-indigo-800 bg-white/90 dark:bg-indigo-950/20 backdrop-blur-sm">
                <CardHeader className="p-6 border-b border-indigo-100/50 dark:border-indigo-800/30">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg text-white">
                      <Pencil className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-xl text-indigo-700 dark:text-indigo-300">
                        Edit Link Details
                      </CardTitle>
                      <CardDescription className="text-indigo-500 dark:text-indigo-400">
                        Update your link details and settings
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-6 pt-6">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-indigo-700 dark:text-indigo-300">Link Name</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-400" />
                                    <Input 
                                      placeholder="My Awesome Link" 
                                      className="pl-10 border-indigo-200 dark:border-indigo-700/30"
                                      {...field} 
                                    />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="space-y-2">
                            <Label className="text-indigo-700 dark:text-indigo-300">Short Link Token</Label>
                            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                              {!isMobile ? (
                                <div className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500 dark:text-indigo-400 px-3 py-2 rounded-l-md border border-r-0 border-indigo-200 dark:border-indigo-700/30 text-xs sm:text-sm truncate max-w-[120px] sm:max-w-none">
                                  {window.location.origin}/view?token=
                                </div>
                              ) : null}
                              <Input
                                value={link?.token || ""}
                                readOnly
                                className={`${!isMobile ? "rounded-l-none" : ""} font-mono bg-indigo-50 dark:bg-indigo-900/30 text-xs sm:text-sm flex-grow border-indigo-200 dark:border-indigo-700/30`}
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={copyLinkToClipboard}
                                className="flex-shrink-0 h-9 w-9 border-indigo-200 dark:border-indigo-700/30"
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
                              <FormLabel className="text-indigo-700 dark:text-indigo-300">Original URL</FormLabel>
                              <div className="flex items-center gap-2">
                                <div className="relative flex-grow">
                                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-400" />
                                  <FormControl>
                                    <Input
                                      placeholder="https://example.com/your-long-url"
                                      className="pl-10 border-indigo-200 dark:border-indigo-700/30"
                                      {...field}
                                    />
                                  </FormControl>
                                </div>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  onClick={openOriginalUrl}
                                  className="flex-shrink-0 h-9 w-9 border-indigo-200 dark:border-indigo-700/30"
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
                              <FormLabel className="text-indigo-700 dark:text-indigo-300">Description (Optional)</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <FileText className="absolute left-3 top-3 h-4 w-4 text-indigo-400" />
                                  <Textarea
                                    placeholder="Describe what this link is for..."
                                    className="resize-none pl-10 border-indigo-200 dark:border-indigo-700/30"
                                    rows={3}
                                    {...field}
                                  />
                                </div>
                              </FormControl>
                              <FormDescription className="text-indigo-400 dark:text-indigo-500 text-xs">
                                Add a brief description to help identify this link later
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="grid md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="thumbnail_url"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-indigo-700 dark:text-indigo-300">Thumbnail URL (Optional)</FormLabel>
                                <div className="flex items-center gap-2">
                                  <div className="relative flex-grow">
                                    <Image className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-400" />
                                    <FormControl>
                                      <Input
                                        placeholder="https://example.com/image.jpg"
                                        className="pl-10 border-indigo-200 dark:border-indigo-700/30"
                                        {...field}
                                      />
                                    </FormControl>
                                  </div>
                                  {field.value && (
                                    <div className="h-9 w-9 rounded overflow-hidden flex-shrink-0 border border-indigo-200 dark:border-indigo-700/30">
                                      <img
                                        src={field.value}
                                        alt="Thumbnail"
                                        className="h-full w-full object-cover"
                                        onError={(e) => (e.currentTarget.src = "/placeholder.svg")}
                                      />
                                    </div>
                                  )}
                                </div>
                                <FormDescription className="text-indigo-400 dark:text-indigo-500 text-xs">
                                  Add an image that will be displayed with your link
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="color"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-indigo-700 dark:text-indigo-300">Link Color</FormLabel>
                                <div className="flex items-center gap-2">
                                  <div className="relative flex-grow">
                                    <Palette className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-400" />
                                    <FormControl>
                                      <Select 
                                        onValueChange={field.onChange} 
                                        defaultValue={field.value}
                                        value={field.value}
                                      >
                                        <SelectTrigger className="pl-10 border-indigo-200 dark:border-indigo-700/30">
                                          <SelectValue placeholder="Select a color" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {colorOptions.map((color) => (
                                            <SelectItem key={color.value} value={color.value} className="flex items-center gap-2">
                                              <div className="flex items-center gap-2">
                                                <div className={`h-4 w-4 rounded-full ${color.class}`}></div>
                                                <span>{color.label}</span>
                                              </div>
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </FormControl>
                                  </div>
                                  {field.value && (
                                    <div className={`h-9 w-9 rounded-full flex-shrink-0 bg-${field.value}-500`}></div>
                                  )}
                                </div>
                                <FormDescription className="text-indigo-400 dark:text-indigo-500 text-xs">
                                  Choose a color theme for your link
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <div className="space-y-4 pt-4 border-t border-indigo-100 dark:border-indigo-800/30">
                          <h3 className="font-medium flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
                            <Shield className="h-4 w-4 text-indigo-500" />
                            <span>Password Protection</span>
                          </h3>
                          
                          <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-indigo-700 dark:text-indigo-300">Password (Optional)</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-400" />
                                    <Input
                                      type="text"
                                      placeholder="Leave empty for no password"
                                      className="pl-10 border-indigo-200 dark:border-indigo-700/30"
                                      {...field}
                                    />
                                  </div>
                                </FormControl>
                                <FormDescription className="text-indigo-400 dark:text-indigo-500 text-xs">
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
                              <FormItem className="flex items-start sm:items-center space-x-2 sm:space-x-3">
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    className="data-[state=checked]:bg-indigo-600"
                                  />
                                </FormControl>
                                <div className="space-y-0.5">
                                  <FormLabel className="text-indigo-700 dark:text-indigo-300">Show password to visitors</FormLabel>
                                  <FormDescription className="text-indigo-400 dark:text-indigo-500 text-xs">
                                    Display the password on the link page
                                  </FormDescription>
                                </div>
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </form>
                  </Form>
                </CardContent>
                
                <CardFooter className="p-6 border-t border-indigo-100/50 dark:border-indigo-800/30 flex flex-col-reverse sm:flex-row sm:justify-between gap-3">
                  <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
                    <AlertDialogTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-red-800/30 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Link
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete this link
                          and all of its associated data.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={handleDelete}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          {deleting ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  
                  <Button 
                    type="button"
                    onClick={form.handleSubmit(onSubmit)}
                    disabled={saving || !isFormDirty}
                    variant="gradient"
                    className="w-full sm:w-auto"
                  >
                    {saving ? (
                      "Saving..."
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="analytics">
              <Card className="shadow-md border border-indigo-100 dark:border-indigo-800 bg-white/90 dark:bg-indigo-950/20 backdrop-blur-sm">
                <CardHeader className="p-6 border-b border-indigo-100/50 dark:border-indigo-800/30">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-blue-500 to-sky-600 rounded-lg text-white">
                      <BarChart2 className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-xl text-indigo-700 dark:text-indigo-300">
                        Link Analytics
                      </CardTitle>
                      <CardDescription className="text-indigo-500 dark:text-indigo-400">
                        View performance metrics for this link
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="rounded-lg overflow-hidden"
                    >
                      <Card className="h-full bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border-indigo-200/50 dark:border-indigo-800/30">
                        <CardContent className="p-4 text-center">
                          <div className="flex flex-col items-center">
                            <div className="p-2 rounded-full bg-indigo-100 dark:bg-indigo-800/30 mb-2">
                              <Eye className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <p className="text-xs uppercase text-indigo-500 dark:text-indigo-400 mb-1">Total Views</p>
                            <p className="text-2xl sm:text-3xl font-bold text-indigo-700 dark:text-indigo-300">{link?.views || 0}</p>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                    
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                      className="rounded-lg overflow-hidden"
                    >
                      <Card className="h-full bg-gradient-to-br from-purple-500/5 to-pink-500/5 border-indigo-200/50 dark:border-indigo-800/30">
                        <CardContent className="p-4 text-center">
                          <div className="flex flex-col items-center">
                            <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-800/30 mb-2">
                              <UserIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <p className="text-xs uppercase text-indigo-500 dark:text-indigo-400 mb-1">Unique Visits</p>
                            <p className="text-2xl sm:text-3xl font-bold text-indigo-700 dark:text-indigo-300">{stats.length}</p>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                    
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.2 }}
                      className="rounded-lg overflow-hidden"
                    >
                      <Card className="h-full bg-gradient-to-br from-blue-500/5 to-sky-500/5 border-indigo-200/50 dark:border-indigo-800/30">
                        <CardContent className="p-4 text-center">
                          <div className="flex flex-col items-center">
                            <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-800/30 mb-2">
                              <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <p className="text-xs uppercase text-indigo-500 dark:text-indigo-400 mb-1">Created</p>
                            <p className="text-lg font-semibold text-indigo-700 dark:text-indigo-300">
                              {link?.created_at ? format(new Date(link.created_at), 'MMM dd, yyyy') : 'N/A'}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-medium flex items-center gap-1.5 text-indigo-700 dark:text-indigo-300">
                        <Clock className="h-4 w-4 text-indigo-500" />
                        Recent Activity
                      </h3>
                      
                      <Button variant="outline" size="sm" onClick={fetchLinkStats} className="text-xs border-indigo-200 dark:border-indigo-800/30">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"></path><path d="M16 21h5v-5"></path></svg>
                        Refresh
                      </Button>
                    </div>
                    
                    {stats.length === 0 ? (
                      <div className="text-center py-10 text-indigo-500 bg-indigo-50/80 dark:bg-indigo-900/20 rounded-lg">
                        <div className="bg-white dark:bg-indigo-800/20 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                          <Eye className="h-8 w-8 opacity-30 text-indigo-400" />
                        </div>
                        <p className="text-lg font-medium text-indigo-700 dark:text-indigo-300">No views recorded yet</p>
                        <p className="text-sm mt-1 text-indigo-500 dark:text-indigo-400 max-w-xs mx-auto">
                          Views will appear here once your link is visited. Share your link to start collecting data.
                        </p>
                        <Button 
                          variant="outline" 
                          className="mt-4 border-indigo-200 dark:border-indigo-800/30" 
                          size="sm"
                          onClick={copyLinkToClipboard}
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copy Link
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-96 overflow-y-auto pr-2 rounded-lg">
                        <AnimatePresence>
                          {stats.slice(0, 20).map((view, index) => (
                            <motion.div
                              key={view.id || index}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.03 }}
                            >
                              <Card className="bg-indigo-50/50 dark:bg-indigo-900/10 border-indigo-100/50 dark:border-indigo-800/20">
                                <CardContent className="p-3">
                                  <div className="flex justify-between items-center flex-wrap sm:flex-nowrap gap-2">
                                    <div className="flex items-center gap-3">
                                      <div className="h-10 w-10 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-800/30 dark:to-purple-800/20 rounded-full flex items-center justify-center">
                                        <Eye className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                      </div>
                                      <div>
                                        <div className="font-medium text-xs text-indigo-700 dark:text-indigo-300">View</div>
                                        <div className="text-[10px] text-indigo-500 dark:text-indigo-400">
                                          {view.user_agent?.split(' ')[0] || "Unknown browser"}
                                          {view.ip_address ? ` • ${view.ip_address.split('.').slice(0,2).join('.')}.**` : ''}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="text-[10px] text-indigo-500 dark:text-indigo-400 w-full sm:w-auto text-right">
                                      {view.viewed_at 
                                        ? format(new Date(view.viewed_at), 'MMM dd, yyyy HH:mm') 
                                        : 'Unknown date'}
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
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
          <Card className="shadow-md border border-indigo-100 dark:border-indigo-800 lg:sticky lg:top-4 bg-white/90 dark:bg-indigo-950/20 backdrop-blur-sm">
            <CardHeader className="p-6 border-b border-indigo-100/50 dark:border-indigo-800/30">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg text-white">
                  <Tag className="h-5 w-5" />
                </div>
                <CardTitle className="text-xl text-indigo-700 dark:text-indigo-300">
                  Link Preview
                </CardTitle>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-5 p-6">
              <div>
                <h3 className="text-sm font-medium mb-3 text-indigo-700 dark:text-indigo-300">Link Preview</h3>
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/10 rounded-xl p-5">
                  <div className="flex items-center gap-4 mb-3">
                    {form.watch("thumbnail_url") ? (
                      <div className="h-12 w-12 rounded-lg overflow-hidden bg-white ring-2 ring-white dark:ring-indigo-800">
                        <img 
                          src={form.watch("thumbnail_url")} 
                          alt={form.watch("name")}
                          className="h-full w-full object-cover"
                          onError={(e) => (e.currentTarget.src = "/placeholder.svg")}
                        />
                      </div>
                    ) : (
                      <div className={`h-12 w-12 rounded-lg bg-${form.watch("color") || "indigo"}-500 flex items-center justify-center`}>
                        <LinkIcon className="h-6 w-6 text-white" />
                      </div>
                    )}
                    <div className="overflow-hidden">
                      <div className="font-medium line-clamp-1 text-indigo-700 dark:text-indigo-300">
                        {form.watch("name") || "Untitled Link"}
                      </div>
                      <div className="text-xs text-indigo-500 dark:text-indigo-400 truncate">
                        {window.location.origin}/view?token={link?.token}
                      </div>
                    </div>
                  </div>
                  
                  {form.watch("description") && (
                    <div className="text-xs text-indigo-600 dark:text-indigo-400 line-clamp-3 mt-3 pl-3 border-l-2 border-indigo-300 dark:border-indigo-600">
                      {form.watch("description")}
                    </div>
                  )}
                  
                  <div className="mt-4 pt-3 border-t border-indigo-200/50 dark:border-indigo-700/20">
                    <div className="bg-white/70 dark:bg-indigo-800/10 rounded-lg p-3 flex items-center justify-between">
                      <span className="text-xs text-indigo-600 dark:text-indigo-400">
                        {form.watch("original_url") ? (
                          <span className="truncate block max-w-[120px]">{form.watch("original_url")}</span>
                        ) : (
                          "Original URL"
                        )}
                      </span>
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        className="h-7 text-xs"
                        disabled={!form.watch("original_url")}
                        onClick={openOriginalUrl}
                      >
                        <ArrowUpRight className="h-3 w-3 mr-1" />
                        Visit
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              
              <Separator className="bg-indigo-100 dark:bg-indigo-800/30" />
              
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-indigo-700 dark:text-indigo-300">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    className="text-xs"
                    variant="outline"
                    onClick={copyLinkToClipboard}
                  >
                    <Copy className="h-3.5 w-3.5 mr-1.5" />
                    Copy Link
                  </Button>
                  
                  <Button
                    className="text-xs"
                    variant="outline"
                    onClick={() => window.open(`/view?token=${link?.token}`, '_blank')}
                  >
                    <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                    Open Link
                  </Button>
                </div>
                
                <Button
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs"
                  onClick={openOriginalUrl}
                >
                  <ArrowUpRight className="h-3.5 w-3.5 mr-1.5" />
                  Visit Original URL
                </Button>
              </div>
              
              {form.watch("password") && (
                <div className="pt-3 border-t border-indigo-100 dark:border-indigo-800/30">
                  <div className="flex items-center gap-2 mb-2 text-indigo-700 dark:text-indigo-300">
                    <Lock className="h-4 w-4 text-amber-500" />
                    <h3 className="text-sm font-medium">Password Protected</h3>
                  </div>
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/10 text-amber-800 dark:text-amber-300 p-3 rounded-lg text-xs">
                    <p>This link is protected with a password:</p>
                    <code className="font-mono bg-white/70 dark:bg-gray-800/50 px-2 py-1 rounded mt-2 inline-block">
                      {form.watch("password")}
                    </code>
                    {form.watch("show_password") && (
                      <div className="flex items-center gap-1.5 mt-2 text-[10px] text-amber-600 dark:text-amber-400">
                        <Info className="h-3 w-3" />
                        <span>Password will be visible to visitors</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              <div className="space-y-2 pt-3 border-t border-indigo-100 dark:border-indigo-800/30">
                <div className="flex items-center gap-2 text-xs text-indigo-500 dark:text-indigo-400">
                  <Code className="h-3.5 w-3.5" />
                  <span>Embed this link</span>
                </div>
                <div className="bg-indigo-50/80 dark:bg-indigo-900/20 p-2 rounded-md text-[10px] font-mono text-indigo-600 dark:text-indigo-400 overflow-x-auto">
                  &lt;a href="{window.location.origin}/view?token={link?.token}"&gt;{form.watch("name") || "Untitled Link"}&lt;/a&gt;
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="p-6 pt-0 flex justify-center">
              <Badge className="bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/20 text-indigo-700 dark:text-indigo-300 hover:from-indigo-200 hover:to-purple-200 dark:hover:from-indigo-900/40 dark:hover:to-purple-900/30">
                {isFormDirty ? (
                  <div className="flex items-center gap-1.5">
                    <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                    <span className="text-amber-600 dark:text-amber-400">Unsaved changes</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="text-emerald-600 dark:text-emerald-400">All changes saved</span>
                  </div>
                )}
              </Badge>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LinkEditor;
