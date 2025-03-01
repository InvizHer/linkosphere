
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Trash2,
  Eye,
  Calendar,
  Link as LinkIcon,
  Clock,
  Lock,
  BarChart2,
  ExternalLink,
  Share2,
  Pencil,
  Key,
  Image,
  FileText,
  Info,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { format, subDays, startOfMonth, endOfMonth, subMonths, differenceInHours } from "date-fns";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const EditLink = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    original_url: "",
    thumbnail_url: "",
    password: "",
    show_password: false,
  });
  
  const [stats, setStats] = useState({
    views: 0,
    created_at: "",
    updated_at: "",
  });

  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);

  useEffect(() => {
    fetchLink();
  }, [token]);

  const fetchLink = async () => {
    try {
      if (!token) {
        toast({
          title: "Error",
          description: "No token provided",
          variant: "destructive",
        });
        navigate("/dashboard/manage");
        return;
      }

      const { data: linkData, error: linkError } = await supabase
        .from("links")
        .select("*, link_views(*)")
        .eq("token", token)
        .eq("user_id", user?.id)
        .single();

      if (linkError) throw linkError;

      if (!linkData) {
        toast({
          title: "Error",
          description: "Link not found",
          variant: "destructive",
        });
        navigate("/dashboard/manage");
        return;
      }

      setFormData({
        name: linkData.name,
        description: linkData.description || "",
        original_url: linkData.original_url,
        thumbnail_url: linkData.thumbnail_url || "",
        password: linkData.password || "",
        show_password: linkData.show_password || false,
      });

      setStats({
        views: linkData.views || 0,
        created_at: linkData.created_at,
        updated_at: linkData.updated_at,
      });

      // Process weekly data from real view records
      const viewsData = linkData.link_views || [];
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = subDays(new Date(), i);
        const dayViews = viewsData.filter(
          (view: any) => 
            format(new Date(view.viewed_at), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
        ).length;
        return {
          date: format(date, "EEE"),
          views: dayViews,
        };
      }).reverse();
      setWeeklyData(last7Days);

      // Process monthly data from real view records
      const last6Months = Array.from({ length: 6 }, (_, i) => {
        const monthStart = startOfMonth(subMonths(new Date(), i));
        const monthEnd = endOfMonth(subMonths(new Date(), i));
        const monthViews = viewsData.filter(
          (view: any) => {
            const viewDate = new Date(view.viewed_at);
            return viewDate >= monthStart && viewDate <= monthEnd;
          }
        ).length;
        return {
          month: format(monthStart, "MMM"),
          views: monthViews,
        };
      }).reverse();
      setMonthlyData(last6Months);

      setLoading(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      navigate("/dashboard/manage");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from("links")
        .update({
          name: formData.name,
          description: formData.description,
          original_url: formData.original_url,
          thumbnail_url: formData.thumbnail_url,
          password: formData.password,
          show_password: formData.show_password,
        })
        .eq("token", token)
        .eq("user_id", user?.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Link updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this link?")) return;

    try {
      const { error } = await supabase
        .from("links")
        .delete()
        .eq("token", token)
        .eq("user_id", user?.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Link deleted successfully",
      });
      navigate("/dashboard/manage");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getAverageViewsPerDay = () => {
    const days = differenceInHours(new Date(), new Date(stats.created_at)) / 24;
    return days > 0 ? (stats.views / days).toFixed(1) : "0";
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-sm z-10 py-3 px-4 rounded-xl shadow-sm"
      >
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard/manage")}
          className="flex items-center gap-2 hover:bg-background/90"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Links
        </Button>
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  onClick={() => window.open(`/view?token=${token}`, '_blank')}
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span className="hidden sm:inline">View</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Open link in new tab</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/view?token=${token}`);
                    toast({
                      title: "Success",
                      description: "Link copied to clipboard",
                    });
                  }}
                  className="flex items-center gap-2"
                >
                  <Share2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Share</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Copy link to clipboard</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  className="flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Delete</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Delete this link</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </motion.div>

      <Tabs defaultValue="statistics" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 mb-4 mx-auto max-w-md">
          <TabsTrigger value="statistics" className="flex items-center gap-2">
            <BarChart2 className="h-4 w-4" />
            Statistics
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Pencil className="h-4 w-4" />
            Edit Link
          </TabsTrigger>
        </TabsList>

        <TabsContent value="statistics" className="space-y-6 animate-fade-in">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                  <Eye className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.views}</div>
                  <p className="text-xs text-muted-foreground">All time views</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Views</CardTitle>
                  <BarChart2 className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{getAverageViewsPerDay()}</div>
                  <p className="text-xs text-muted-foreground">Views per day</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Created</CardTitle>
                  <Calendar className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {new Date(stats.created_at).toLocaleDateString()}
                  </div>
                  <p className="text-xs text-muted-foreground">Creation date</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Updated</CardTitle>
                  <Clock className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {new Date(stats.updated_at).toLocaleDateString()}
                  </div>
                  <p className="text-xs text-muted-foreground">Last update</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.5 }}
            >
              <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-lg">Weekly Views</CardTitle>
                  <CardDescription>Views over the last 7 days</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <RechartsTooltip 
                        contentStyle={{ 
                          backgroundColor: "rgba(255, 255, 255, 0.9)",
                          borderRadius: "8px",
                          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                          border: "none"
                        }}
                      />
                      <Bar dataKey="views" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.6 }}
            >
              <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-lg">Monthly Views</CardTitle>
                  <CardDescription>Views over the last 6 months</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <RechartsTooltip 
                        contentStyle={{ 
                          backgroundColor: "rgba(255, 255, 255, 0.9)",
                          borderRadius: "8px",
                          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                          border: "none"
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="views" 
                        stroke="#3b82f6" 
                        strokeWidth={2} 
                        dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                        activeDot={{ fill: "#1d4ed8", strokeWidth: 0, r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6 animate-fade-in">
          <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <LinkIcon className="h-5 w-5 text-blue-500" />
                Link Settings
              </CardTitle>
              <CardDescription>Customize your shortened link's appearance and behavior</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="flex items-center gap-1.5">
                      <Info className="h-4 w-4 text-blue-500" />
                      Name
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="border-gray-200 focus:border-blue-500 transition-colors"
                      placeholder="Enter a name for your link"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="flex items-center gap-1.5">
                      <FileText className="h-4 w-4 text-green-500" />
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      className="border-gray-200 focus:border-blue-500 transition-colors min-h-[100px]"
                      placeholder="Add a description (optional)"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="original_url" className="flex items-center gap-1.5">
                      <LinkIcon className="h-4 w-4 text-purple-500" />
                      Original URL
                    </Label>
                    <Input
                      id="original_url"
                      value={formData.original_url}
                      onChange={(e) =>
                        setFormData({ ...formData, original_url: e.target.value })
                      }
                      className="border-gray-200 focus:border-blue-500 transition-colors"
                      placeholder="https://example.com/very-long-url-that-needs-shortening"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="thumbnail_url" className="flex items-center gap-1.5">
                      <Image className="h-4 w-4 text-orange-500" />
                      Thumbnail URL
                    </Label>
                    <Input
                      id="thumbnail_url"
                      value={formData.thumbnail_url}
                      onChange={(e) =>
                        setFormData({ ...formData, thumbnail_url: e.target.value })
                      }
                      className="border-gray-200 focus:border-blue-500 transition-colors"
                      placeholder="https://example.com/image.jpg (optional)"
                    />
                  </div>

                  <div className="space-y-4 pt-2">
                    <Label htmlFor="password" className="flex items-center gap-1.5">
                      <Key className="h-4 w-4 text-red-500" />
                      Password Protection
                    </Label>
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="space-y-0.5">
                        <div className="text-sm font-medium">
                          Enable Password Protection
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Require a password to access this link
                        </div>
                      </div>
                      <Switch
                        id="show_password"
                        checked={formData.show_password}
                        onCheckedChange={(checked) =>
                          setFormData({ ...formData, show_password: checked })
                        }
                      />
                    </div>
                    {formData.show_password && (
                      <div className="pt-2">
                        <Input
                          id="password"
                          type="password"
                          value={formData.password}
                          onChange={(e) =>
                            setFormData({ ...formData, password: e.target.value })
                          }
                          className="border-gray-200 focus:border-blue-500 transition-colors"
                          placeholder="Enter password"
                        />
                      </div>
                    )}
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2 py-5"
                >
                  <Pencil className="h-4 w-4" />
                  Save Changes
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EditLink;
