
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
  Save,
  FileText,
  Image,
  AlertTriangle,
  CheckCircle,
  Copy,
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
import { 
  format, 
  subDays, 
  startOfMonth, 
  endOfMonth, 
  subMonths, 
  differenceInHours 
} from "date-fns";

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
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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
    setIsSaving(true);
    
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
      
      // Update the stats
      setStats({
        ...stats,
        updated_at: new Date().toISOString(),
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this link? This action cannot be undone.")) return;

    setIsDeleting(true);
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
      setIsDeleting(false);
    }
  };

  const getAverageViewsPerDay = () => {
    const days = differenceInHours(new Date(), new Date(stats.created_at)) / 24;
    return days > 0 ? (stats.views / days).toFixed(1) : "0";
  };

  const copyToClipboard = async () => {
    const linkUrl = `${window.location.origin}/view?token=${token}`;
    await navigator.clipboard.writeText(linkUrl);
    toast({
      title: "Copied!",
      description: "Link copied to clipboard",
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between sticky top-0 bg-background/80 backdrop-blur-sm z-10 py-3 gap-4">
        <Button
          variant="outline"
          onClick={() => navigate("/dashboard/manage")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Links
        </Button>
        <div className="flex items-center gap-2 w-full sm:w-auto">
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
                  onClick={copyToClipboard}
                  className="flex items-center gap-2"
                >
                  <Copy className="h-4 w-4" />
                  <span className="hidden sm:inline">Copy</span>
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
                  disabled={isDeleting}
                  className="flex items-center gap-2 ml-auto sm:ml-0"
                >
                  {isDeleting ? (
                    <div className="animate-spin h-4 w-4 border-2 border-white border-opacity-50 rounded-full border-t-transparent"></div>
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                  <span className="hidden sm:inline">Delete</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Delete this link</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl p-6 mb-4 border border-blue-100 dark:border-blue-900/50">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-2">{formData.name}</h1>
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
          <LinkIcon className="h-4 w-4 mr-1" />
          <span className="truncate">{formData.original_url}</span>
        </div>
      </div>

      <Tabs defaultValue="statistics" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 mb-2">
          <TabsTrigger value="statistics" className="flex items-center gap-2">
            <BarChart2 className="h-4 w-4" />
            Statistics
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="statistics" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                <Eye className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.views}</div>
                <p className="text-xs text-muted-foreground">All time views</p>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Views</CardTitle>
                <BarChart2 className="h-4 w-4 text-indigo-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{getAverageViewsPerDay()}</div>
                <p className="text-xs text-muted-foreground">Views per day</p>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Created</CardTitle>
                <Calendar className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {new Date(stats.created_at).toLocaleDateString()}
                </div>
                <p className="text-xs text-muted-foreground">Creation date</p>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Updated</CardTitle>
                <Clock className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {new Date(stats.updated_at).toLocaleDateString()}
                </div>
                <p className="text-xs text-muted-foreground">Last update</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-lg">Weekly Views</CardTitle>
                <CardDescription>Views over the last 7 days</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <RechartsTooltip />
                    <Bar dataKey="views" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-lg">Monthly Views</CardTitle>
                <CardDescription>Views over the last 6 months</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <RechartsTooltip />
                    <Line type="monotone" dataKey="views" stroke="#3b82f6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
            <CardHeader className="pb-3 border-b border-gray-200 dark:border-gray-700">
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5 text-blue-500" />
                Edit Link
              </CardTitle>
              <CardDescription>
                Modify your link's information
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-500" />
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                    className="border border-gray-300 dark:border-gray-600"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-500" />
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="border border-gray-300 dark:border-gray-600"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="original_url" className="flex items-center gap-2">
                    <LinkIcon className="h-4 w-4 text-blue-500" />
                    Original URL
                  </Label>
                  <Input
                    id="original_url"
                    value={formData.original_url}
                    onChange={(e) =>
                      setFormData({ ...formData, original_url: e.target.value })
                    }
                    required
                    className="border border-gray-300 dark:border-gray-600"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="thumbnail_url" className="flex items-center gap-2">
                    <Image className="h-4 w-4 text-blue-500" />
                    Thumbnail URL
                  </Label>
                  <Input
                    id="thumbnail_url"
                    value={formData.thumbnail_url}
                    onChange={(e) =>
                      setFormData({ ...formData, thumbnail_url: e.target.value })
                    }
                    className="border border-gray-300 dark:border-gray-600"
                  />
                  {formData.thumbnail_url && (
                    <div className="relative aspect-video max-w-xs rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm mt-2">
                      <img
                        src={formData.thumbnail_url}
                        alt="Thumbnail preview"
                        className="object-cover w-full h-full"
                        onError={(e) => {
                          e.currentTarget.src = "https://via.placeholder.com/400x225?text=Invalid+Image+URL";
                        }}
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-4 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="show_password" className="flex items-center gap-2 cursor-pointer">
                      <Lock className="h-4 w-4 text-blue-500" />
                      <div>
                        <div className="text-sm font-medium">Password Protection</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Require a password to access this link
                        </div>
                      </div>
                    </Label>
                    <Switch
                      id="show_password"
                      checked={formData.show_password}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, show_password: checked })
                      }
                      className="data-[state=checked]:bg-blue-500"
                    />
                  </div>
                  
                  {formData.show_password && (
                    <div className="pt-2">
                      <Label htmlFor="password" className="sr-only">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                        placeholder="Enter password"
                        className="border border-gray-300 dark:border-gray-600"
                      />
                      {!formData.password && (
                        <div className="flex items-center mt-2 text-amber-600 dark:text-amber-500 text-sm">
                          <AlertTriangle className="h-4 w-4 mr-1" />
                          <span>Password protection is enabled but no password is set</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-opacity-50 rounded-full border-t-transparent mr-2"></div>
                      Saving Changes...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
              <div className="text-xs text-gray-500 dark:text-gray-400 w-full flex justify-between items-center">
                <div className="flex items-center">
                  <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                  <span>Last saved: {new Date(stats.updated_at).toLocaleString()}</span>
                </div>
                <button
                  onClick={handleDelete}
                  className="text-red-500 hover:text-red-600 transition-colors"
                >
                  Delete Link
                </button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EditLink;
