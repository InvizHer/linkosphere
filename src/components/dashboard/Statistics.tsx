import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { format, subDays, differenceInDays } from "date-fns";
import {
  Link as LinkIcon,
  Eye,
  TrendingUp,
  Lock,
  Unlock,
  Calendar,
  BarChart2,
  PieChart as PieChartIcon,
  Filter,
  AlertCircle,
  Info,
  Clock,
  Activity,
  Zap,
  Search,
  PlusCircle
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { useIsMobile } from "@/hooks/use-mobile";

// Color palette for charts
const COLORS = ["#6366f1", "#8b5cf6", "#d946ef", "#ec4899", "#f43f5e"];

// Define the structure of our link view data to fix the excessive type instantiation
interface LinkView {
  id: string;
  user_id: string;
  viewed_at: string;
  user_agent?: string;
  links?: {
    id: string;
    name: string;
    token: string;
    views: number;
    created_at: string;
  };
}

// Define the structure of our link data
interface LinkData {
  id: string;
  user_id: string;
  name: string;
  token: string;
  views: number;
  created_at: string;
  password?: string;
}

const Statistics = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [loading, setLoading] = useState(true);
  const [linkStats, setLinkStats] = useState<LinkData[]>([]);
  const [viewsData, setViewsData] = useState<any[]>([]);
  const [linkTypeData, setLinkTypeData] = useState<any[]>([]);
  const [topLinks, setTopLinks] = useState<LinkData[]>([]);
  const [recentViews, setRecentViews] = useState<LinkView[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [totalViews, setTotalViews] = useState(0);
  const [todayViews, setTodayViews] = useState(0);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Fetch all links
      const { data: links, error: linksError } = await supabase
        .from("links")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (linksError) throw linksError;

      // Fetch all link views
      const { data: views, error: viewsError } = await supabase
        .from("link_views")
        .select("*, links(*)")
        .eq("user_id", user.id)
        .order("viewed_at", { ascending: false });

      if (viewsError) throw viewsError;

      // Process overall link stats
      const totalViewCount = links?.reduce((sum, link) => sum + (link.views || 0), 0) || 0;
      setTotalViews(totalViewCount);

      // Process today's views
      const today = new Date().setHours(0, 0, 0, 0);
      const todayViewCount = views?.filter(
        (view) => new Date(view.viewed_at).setHours(0, 0, 0, 0) === today
      ).length || 0;
      setTodayViews(todayViewCount);

      // Process links by type
      const privateLinks = links?.filter((link) => link.password)?.length || 0;
      const publicLinks = (links?.length || 0) - privateLinks;
      
      setLinkTypeData([
        { name: "Private Links", value: privateLinks },
        { name: "Public Links", value: publicLinks },
      ]);

      // Process views by date
      const last14Days = Array.from({ length: 14 }, (_, i) => {
        const date = subDays(new Date(), 13 - i);
        return {
          date: format(date, "MMM dd"),
          views: 0,
          dateObj: date,
        };
      });

      views?.forEach((view) => {
        const viewDate = new Date(view.viewed_at);
        const dayIndex = last14Days.findIndex(
          (day) => format(day.dateObj, "yyyy-MM-dd") === format(viewDate, "yyyy-MM-dd")
        );
        if (dayIndex !== -1) {
          last14Days[dayIndex].views++;
        }
      });

      setViewsData(last14Days);

      // Process top links by views
      const topLinksList = [...(links || [])]
        .sort((a, b) => (b.views || 0) - (a.views || 0))
        .slice(0, 5);
      
      setTopLinks(topLinksList);

      // Process recent view activities
      setRecentViews(views?.slice(0, 10) || []);

      // Set link stats for reference
      setLinkStats(links || []);
      
      setLoading(false);
    } catch (error: any) {
      console.error("Error fetching statistics:", error);
      toast({
        title: "Error fetching statistics",
        description: error.message,
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const getBreakdownItem = (title: string, value: number, icon: React.ReactNode, color: string) => (
    <div className="flex items-center p-3 bg-white dark:bg-indigo-900/20 rounded-lg border border-indigo-100 dark:border-indigo-800/30 hover:shadow-md transition-shadow">
      <div className={`p-2 rounded-lg ${color} text-white mr-3`}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-indigo-500 dark:text-indigo-400">{title}</p>
        <p className="text-xl font-bold text-indigo-700 dark:text-indigo-300">{value}</p>
      </div>
    </div>
  );

  const filteredTopLinks = topLinks.filter(link => 
    link.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin"></div>
          <p className="text-indigo-600 dark:text-indigo-300">Loading statistics...</p>
        </div>
      </div>
    );
  }

  // Check if no links exist
  if (linkStats.length === 0) {
    return (
      <div className="container mx-auto px-4 py-10">
        <Card className="bg-white/90 dark:bg-indigo-950/20 backdrop-blur-sm border border-indigo-100/50 dark:border-indigo-800/30 shadow-lg text-center p-10">
          <div className="flex flex-col items-center max-w-md mx-auto">
            <div className="p-6 rounded-full bg-indigo-100 dark:bg-indigo-800/30 mb-6">
              <BarChart2 className="h-10 w-10 text-indigo-500" />
            </div>
            <h2 className="text-2xl font-bold text-indigo-700 dark:text-indigo-300 mb-2">No statistics yet</h2>
            <p className="text-indigo-500 dark:text-indigo-400 mb-6">
              Create your first link to start generating statistics and insights.
            </p>
            <Button asChild>
              <a href="/dashboard/create">
                <PlusCircle className="h-4 w-4 mr-2" />
                Create your first link
              </a>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6 mb-20">
      {/* Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 text-white shadow-lg"
      >
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJwYXR0ZXJuIiB4PSIwIiB5PSIwIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHBhdHRlcm5UcmFuc2Zvcm09InJvdGF0ZSgzMCkiPjxyZWN0IHg9IjAiIHk9IjAiIHdpZHRoPSIyIiBoZWlnaHQ9IjIiIGZpbGw9IiNmZmZmZmYxMCIgLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjcGF0dGVybikiIC8+PC9zdmc+')]"></div>
        <div className="relative z-10 p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <Badge variant="outline" className="bg-white/20 text-white border-white/20 mb-2">
                <BarChart2 className="mr-1 h-3 w-3" /> Analytics
              </Badge>
              <h1 className="text-2xl font-bold mb-1">Link Performance</h1>
              <p className="text-white/70 max-w-lg">
                Track how your links are performing and get insights to improve engagement.
              </p>
            </div>
            
            <div className="flex flex-col md:items-end">
              <div className="flex items-center space-x-2 mb-1">
                <Badge className="bg-white/20 border-0">{linkStats.length} Links</Badge>
                <Badge className="bg-white/20 border-0">{totalViews} Total Views</Badge>
              </div>
              <p className="text-white/70 text-sm">
                <Clock className="inline-block mr-1 h-3 w-3" />
                Stats updated: {format(new Date(), "MMMM d, yyyy")}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Key Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {getBreakdownItem("Total Links", linkStats.length, <LinkIcon className="h-4 w-4" />, "bg-indigo-500")}
        {getBreakdownItem("Total Views", totalViews, <Eye className="h-4 w-4" />, "bg-purple-500")}
        {getBreakdownItem("Today's Views", todayViews, <Activity className="h-4 w-4" />, "bg-fuchsia-500")}
        {getBreakdownItem(
          "Avg. Views/Link", 
          Math.round((totalViews / (linkStats.length || 1)) * 10) / 10, 
          <TrendingUp className="h-4 w-4" />, 
          "bg-rose-500"
        )}
      </motion.div>

      {/* Charts Section */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Views Over Time Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Card className="border-none shadow-lg bg-white/80 dark:bg-indigo-950/20 backdrop-blur-md h-full">
            <CardHeader className="border-b border-indigo-100 dark:border-indigo-800/30">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold text-indigo-700 dark:text-indigo-300 flex items-center">
                  <BarChart2 className="mr-2 h-5 w-5 text-indigo-500" /> Views Over Time
                </CardTitle>
                <Badge variant="outline" className="bg-indigo-100/50 dark:bg-indigo-800/30 text-indigo-600 dark:text-indigo-300 border-indigo-200 dark:border-indigo-700/30">
                  Last 14 Days
                </Badge>
              </div>
              <CardDescription className="text-indigo-500 dark:text-indigo-400">
                Daily traffic trends for all your links
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              {viewsData.length > 0 ? (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={viewsData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 12 }} 
                        tickFormatter={(value) => isMobile ? value.split(' ')[1] : value}
                      />
                      <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                          border: '1px solid rgba(99, 102, 241, 0.2)'
                        }}
                        formatter={(value) => [`${value} views`]}
                        labelFormatter={(label) => `Date: ${label}`}
                      />
                      <Bar 
                        dataKey="views" 
                        name="Views" 
                        fill="#6366f1"
                        radius={[4, 4, 0, 0]} 
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[300px] bg-indigo-50/50 dark:bg-indigo-900/10 rounded-lg">
                  <AlertCircle className="h-10 w-10 text-indigo-400 mb-2" />
                  <p className="text-indigo-600 dark:text-indigo-400">No view data available for the time period</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Link Types Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <Card className="border-none shadow-lg bg-white/80 dark:bg-indigo-950/20 backdrop-blur-md h-full">
            <CardHeader className="border-b border-indigo-100 dark:border-indigo-800/30">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold text-indigo-700 dark:text-indigo-300 flex items-center">
                  <PieChartIcon className="mr-2 h-5 w-5 text-indigo-500" /> Link Breakdown
                </CardTitle>
                <Badge variant="outline" className="bg-indigo-100/50 dark:bg-indigo-800/30 text-indigo-600 dark:text-indigo-300 border-indigo-200 dark:border-indigo-700/30">
                  By Type
                </Badge>
              </div>
              <CardDescription className="text-indigo-500 dark:text-indigo-400">
                Distribution of private vs public links
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              {linkTypeData.length > 0 && linkTypeData.some(item => item.value > 0) ? (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={linkTypeData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={isMobile ? 80 : 100}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {linkTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => [`${value} links`]}
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                          border: '1px solid rgba(99, 102, 241, 0.2)'
                        }}
                      />
                      <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[300px] bg-indigo-50/50 dark:bg-indigo-900/10 rounded-lg">
                  <AlertCircle className="h-10 w-10 text-indigo-400 mb-2" />
                  <p className="text-indigo-600 dark:text-indigo-400">No link type data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Top Links & Recent Activity Section */}
      <div className="grid md:grid-cols-5 gap-6">
        {/* Top Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="md:col-span-3"
        >
          <Card className="border-none shadow-lg bg-white/80 dark:bg-indigo-950/20 backdrop-blur-md">
            <CardHeader className="border-b border-indigo-100 dark:border-indigo-800/30">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <CardTitle className="text-lg font-bold text-indigo-700 dark:text-indigo-300 flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5 text-indigo-500" /> Top Performing Links
                </CardTitle>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-400" />
                  <Input
                    placeholder="Search links..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 py-1 h-8 text-sm bg-white/50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800/30"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {filteredTopLinks.length > 0 ? (
                <div className="divide-y divide-indigo-100 dark:divide-indigo-800/30">
                  {filteredTopLinks.map((link, index) => (
                    <motion.div
                      key={link.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.3 }}
                      className="p-4 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-800/30 text-indigo-600 dark:text-indigo-300 relative">
                            <LinkIcon className="h-4 w-4" />
                            {link.password && (
                              <div className="absolute -top-1 -right-1 p-0.5 bg-amber-400 rounded-full text-white">
                                <Lock className="h-2.5 w-2.5" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-indigo-800 dark:text-indigo-200">
                              {link.name}
                            </div>
                            <div className="flex items-center text-xs text-indigo-500 dark:text-indigo-400">
                              <Calendar className="mr-1 h-3 w-3" />
                              {format(new Date(link.created_at), "MMM d, yyyy")}
                              <div className="mx-1 h-1 w-1 bg-indigo-300 dark:bg-indigo-700 rounded-full"></div>
                              /{link.token}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <div className="px-2.5 py-1 bg-indigo-100 dark:bg-indigo-800/30 text-indigo-600 dark:text-indigo-300 rounded-lg flex items-center gap-1">
                            <Eye className="h-3.5 w-3.5" />
                            <span className="font-medium">{link.views || 0}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-800/30 flex items-center justify-center mb-4">
                    <Search className="h-8 w-8 text-indigo-500" />
                  </div>
                  <p className="text-indigo-700 dark:text-indigo-300 mb-4">
                    {searchTerm ? "No links match your search criteria" : "No links available yet"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="md:col-span-2"
        >
          <Card className="border-none shadow-lg bg-white/80 dark:bg-indigo-950/20 backdrop-blur-md">
            <CardHeader className="border-b border-indigo-100 dark:border-indigo-800/30">
              <CardTitle className="text-lg font-bold text-indigo-700 dark:text-indigo-300 flex items-center">
                <Activity className="mr-2 h-5 w-5 text-indigo-500" /> Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 max-h-[400px] overflow-y-auto">
              {recentViews.length > 0 ? (
                <div className="divide-y divide-indigo-100 dark:divide-indigo-800/30">
                  {recentViews.map((view, index) => (
                    <motion.div
                      key={view.id}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.3 }}
                      className="p-3 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-indigo-100 dark:bg-indigo-800/30 text-indigo-600 dark:text-indigo-300">
                          <Eye className="h-3.5 w-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate text-indigo-800 dark:text-indigo-200">
                            {view.links?.name || "Unknown link"}
                          </div>
                          <div className="text-xs text-indigo-500 dark:text-indigo-400">
                            {format(new Date(view.viewed_at), "MMM d, yyyy h:mm a")}
                          </div>
                        </div>
                        <div className="text-xs text-indigo-400 dark:text-indigo-500">
                          {view.user_agent?.split(' ')[0] || "Unknown"}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-800/30 flex items-center justify-center mb-4">
                    <Eye className="h-8 w-8 text-indigo-500" />
                  </div>
                  <p className="text-indigo-700 dark:text-indigo-300">No recent activity</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Tips Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-none shadow-lg overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-indigo-100 dark:bg-indigo-800/30 text-indigo-600 dark:text-indigo-300">
                <Zap className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-indigo-800 dark:text-indigo-200 mb-1">Performance Insights</h3>
                <p className="text-indigo-600 dark:text-indigo-400">
                  {topLinks.length > 0 && topLinks[0].views > 10
                    ? `Your top performing link has ${topLinks[0].views} views! Create more links like "${topLinks[0].name}" to increase engagement.`
                    : recentViews.length > 0
                    ? "Your links are getting attention. Consider adding descriptive names and thumbnails to boost clicks."
                    : "Share your links on social media and track which platforms drive the most traffic."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Statistics;
