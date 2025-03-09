
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Link, Users, Eye, Info, ArrowUpRight } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const Statistics = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalLinks: 0,
    totalViews: 0,
    activeLinks: 0,
    averageViewsPerLink: 0,
  });
  const [topLinks, setTopLinks] = useState<any[]>([]);
  const [timeframe, setTimeframe] = useState<"7days" | "30days" | "alltime">("30days");

  useEffect(() => {
    if (user) {
      fetchStatistics();
    }
  }, [user, timeframe]);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      
      // Fetch all links for the user
      const { data: links, error: linksError } = await supabase
        .from("links")
        .select("*")
        .eq("user_id", user?.id);

      if (linksError) throw linksError;

      // Calculate basic statistics
      const totalLinks = links?.length || 0;
      const totalViews = links?.reduce((sum, link) => sum + (link.views || 0), 0) || 0;
      const activeLinks = links?.filter(link => link.views > 0)?.length || 0;
      const averageViewsPerLink = totalLinks > 0 ? Math.round(totalViews / totalLinks) : 0;

      setStats({
        totalLinks,
        totalViews,
        activeLinks,
        averageViewsPerLink,
      });

      // Get top performing links
      const sortedLinks = [...(links || [])].sort((a, b) => b.views - a.views).slice(0, 5);
      setTopLinks(sortedLinks);

      setLoading(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const COLORS = ['#0ea5e9', '#38bdf8', '#7dd3fc', '#bae6fd', '#e0f2fe'];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 container mx-auto px-2 sm:px-4 py-4 sm:py-6 mb-20">
      <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-100 dark:border-gray-700 shadow-lg rounded-xl overflow-hidden">
        <CardHeader className="pb-2 sm:pb-3 p-4 sm:p-6 bg-gradient-to-r from-sky-600 to-blue-500">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-xl sm:text-2xl font-bold text-white">
                Analytics Dashboard
              </CardTitle>
              <CardDescription className="text-sky-100">
                Track your link performance
              </CardDescription>
            </div>
            <Tabs 
              defaultValue="30days"
              value={timeframe}
              onValueChange={(value) => setTimeframe(value as "7days" | "30days" | "alltime")}
              className="w-full md:w-auto"
            >
              <TabsList className="grid w-full grid-cols-3 md:w-[300px] bg-sky-700/50">
                <TabsTrigger value="7days" className="text-xs sm:text-sm data-[state=active]:bg-white/20">7 Days</TabsTrigger>
                <TabsTrigger value="30days" className="text-xs sm:text-sm data-[state=active]:bg-white/20">30 Days</TabsTrigger>
                <TabsTrigger value="alltime" className="text-xs sm:text-sm data-[state=active]:bg-white/20">All Time</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6 px-2 sm:px-6 pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
            <Card className="stats-card border-none">
              <CardContent className="p-3 sm:p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Total Views</p>
                    <h3 className="text-lg sm:text-2xl font-bold mt-1">{stats.totalViews.toLocaleString()}</h3>
                    <div className="text-xs mt-1 sm:mt-2 text-gray-500">
                      All your links
                    </div>
                  </div>
                  <div className="bg-sky-500/10 p-2 sm:p-3 rounded-full">
                    <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-sky-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="stats-card border-none">
              <CardContent className="p-3 sm:p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Total Links</p>
                    <h3 className="text-lg sm:text-2xl font-bold mt-1">{stats.totalLinks.toLocaleString()}</h3>
                    <div className="text-xs mt-1 sm:mt-2 text-gray-500">
                      Created by you
                    </div>
                  </div>
                  <div className="bg-sky-500/10 p-2 sm:p-3 rounded-full">
                    <Link className="h-4 w-4 sm:h-5 sm:w-5 text-sky-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="stats-card border-none">
              <CardContent className="p-3 sm:p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Active Links</p>
                    <h3 className="text-lg sm:text-2xl font-bold mt-1">{stats.activeLinks.toLocaleString()}</h3>
                    <div className="text-xs mt-1 sm:mt-2 text-gray-500">
                      {Math.round((stats.activeLinks / stats.totalLinks) * 100) || 0}% of total
                    </div>
                  </div>
                  <div className="bg-sky-500/10 p-2 sm:p-3 rounded-full">
                    <Link className="h-4 w-4 sm:h-5 sm:w-5 text-sky-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="stats-card border-none">
              <CardContent className="p-3 sm:p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Avg. Views</p>
                    <h3 className="text-lg sm:text-2xl font-bold mt-1">{stats.averageViewsPerLink.toLocaleString()}</h3>
                    <div className="text-xs mt-1 sm:mt-2 text-gray-500">
                      Per link
                    </div>
                  </div>
                  <div className="bg-sky-500/10 p-2 sm:p-3 rounded-full">
                    <Users className="h-4 w-4 sm:h-5 sm:w-5 text-sky-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-gray-100 dark:border-gray-700 rounded-xl">
            <CardHeader className="pb-2 p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg font-medium flex items-center">
                Top Performing Links
                <ArrowUpRight className="ml-2 h-4 w-4 text-sky-600" />
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              {topLinks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div className="h-56 sm:h-64 md:h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={topLinks}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={isMobile ? "70%" : "65%"}
                          innerRadius={isMobile ? "40%" : "45%"}
                          fill="#8884d8"
                          dataKey="views"
                          label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                        >
                          {topLinks.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                            fontSize: isMobile ? '12px' : '14px',
                          }}
                          formatter={(value: any) => [`${value} views`, 'Views']}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div>
                    <div className="border-b border-gray-100 dark:border-gray-700 pb-2 mb-3">
                      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Link Distribution</h3>
                    </div>
                    <div className="space-y-3 sm:space-y-4">
                      {topLinks.map((link, index) => (
                        <div key={link.id} className="flex items-center gap-3 p-2 sm:p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors">
                          <div className="h-8 w-8 rounded-full flex items-center justify-center" style={{ backgroundColor: COLORS[index % COLORS.length] + '30' }}>
                            <Eye className="h-4 w-4" style={{ color: COLORS[index % COLORS.length] }} />
                          </div>
                          <div className="flex-grow min-w-0">
                            <div className="font-medium text-sm truncate">{link.name}</div>
                            <div className="text-xs text-gray-500 truncate">/{link.token}</div>
                          </div>
                          <div className="flex items-center text-sm font-semibold">
                            {link.views}
                            <span className="text-xs text-gray-500 ml-1">views</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center">
                  <Info className="h-10 w-10 mx-auto mb-3 text-gray-300" />
                  <p className="text-gray-500 mb-1">No link data available yet</p>
                  <p className="text-sm text-gray-400">Create and share links to see statistics here</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-gray-100 dark:border-gray-700 rounded-xl">
            <CardHeader className="pb-2 p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg font-medium">Link Performance</CardTitle>
            </CardHeader>
            <CardContent className="px-1 sm:px-4 p-0 pb-4">
              {topLinks.length > 0 ? (
                <div className="overflow-x-auto">
                  <div className="h-56 sm:h-64 py-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={topLinks}
                        margin={{
                          top: 5,
                          right: 20,
                          left: isMobile ? 0 : 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis 
                          dataKey="name" 
                          tick={{fontSize: isMobile ? 10 : 12}}
                          tickFormatter={(value) => value.length > 10 ? value.substr(0, 10) + '...' : value}
                          height={60}
                          interval={0}
                          angle={-45}
                          textAnchor="end"
                        />
                        <YAxis 
                          tick={{fontSize: isMobile ? 10 : 12}}
                          tickFormatter={(value) => value === 0 ? '0' : value}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                            fontSize: isMobile ? '12px' : '14px',
                          }}
                          formatter={(value: any) => [`${value} views`, 'Views']}
                        />
                        <Bar dataKey="views" name="Views" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center">
                  <p className="text-gray-500">No link data available yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};

export default Statistics;
