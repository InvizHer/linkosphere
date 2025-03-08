
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
import { Link, Users, Eye, Info, Globe, MousePointer, Clock } from "lucide-react";
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
  const [browserData, setBrowserData] = useState<any[]>([]);
  const [geoData, setGeoData] = useState<any[]>([]);

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

      // Sample browser data (in a real app, this would come from the database)
      const sampleBrowsers = [
        { name: "Chrome", value: Math.floor(Math.random() * 65) + 30 },
        { name: "Firefox", value: Math.floor(Math.random() * 20) + 10 },
        { name: "Safari", value: Math.floor(Math.random() * 20) + 5 },
        { name: "Edge", value: Math.floor(Math.random() * 10) + 2 },
        { name: "Other", value: Math.floor(Math.random() * 5) + 1 },
      ];
      setBrowserData(sampleBrowsers);

      // Sample geo data (in a real app, this would come from the database)
      const sampleGeo = [
        { name: "United States", value: Math.floor(Math.random() * 40) + 20 },
        { name: "Europe", value: Math.floor(Math.random() * 30) + 15 },
        { name: "Asia", value: Math.floor(Math.random() * 20) + 10 },
        { name: "South America", value: Math.floor(Math.random() * 10) + 5 },
        { name: "Other", value: Math.floor(Math.random() * 10) + 3 },
      ];
      setGeoData(sampleGeo);

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

  const COLORS = ['#2563eb', '#8b5cf6', '#ec4899', '#10b981', '#f97316'];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 container mx-auto px-2 sm:px-4 py-4 sm:py-6 mb-20">
      <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-100 dark:border-gray-700 shadow-lg">
        <CardHeader className="pb-2 sm:pb-3 p-4 sm:p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Analytics Dashboard
              </CardTitle>
              <CardDescription className="text-gray-500 dark:text-gray-400">
                Track your link performance
              </CardDescription>
            </div>
            <Tabs 
              defaultValue="30days"
              value={timeframe}
              onValueChange={(value) => setTimeframe(value as "7days" | "30days" | "alltime")}
              className="w-full md:w-auto"
            >
              <TabsList className="grid w-full grid-cols-3 md:w-[300px]">
                <TabsTrigger value="7days" className="text-xs sm:text-sm">7 Days</TabsTrigger>
                <TabsTrigger value="30days" className="text-xs sm:text-sm">30 Days</TabsTrigger>
                <TabsTrigger value="alltime" className="text-xs sm:text-sm">All Time</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6 px-2 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
            <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
              <CardContent className="p-3 sm:p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Total Views</p>
                    <h3 className="text-lg sm:text-2xl font-bold mt-1">{stats.totalViews.toLocaleString()}</h3>
                    <div className="text-xs mt-1 sm:mt-2 text-gray-500">
                      All your links
                    </div>
                  </div>
                  <div className="bg-primary/10 p-2 sm:p-3 rounded-full">
                    <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
              <CardContent className="p-3 sm:p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Total Links</p>
                    <h3 className="text-lg sm:text-2xl font-bold mt-1">{stats.totalLinks.toLocaleString()}</h3>
                    <div className="text-xs mt-1 sm:mt-2 text-gray-500">
                      Created by you
                    </div>
                  </div>
                  <div className="bg-primary/10 p-2 sm:p-3 rounded-full">
                    <Link className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
              <CardContent className="p-3 sm:p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Active Links</p>
                    <h3 className="text-lg sm:text-2xl font-bold mt-1">{stats.activeLinks.toLocaleString()}</h3>
                    <div className="text-xs mt-1 sm:mt-2 text-gray-500">
                      {Math.round((stats.activeLinks / stats.totalLinks) * 100) || 0}% of total
                    </div>
                  </div>
                  <div className="bg-primary/10 p-2 sm:p-3 rounded-full">
                    <Link className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
              <CardContent className="p-3 sm:p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Avg. Views</p>
                    <h3 className="text-lg sm:text-2xl font-bold mt-1">{stats.averageViewsPerLink.toLocaleString()}</h3>
                    <div className="text-xs mt-1 sm:mt-2 text-gray-500">
                      Per link
                    </div>
                  </div>
                  <div className="bg-primary/10 p-2 sm:p-3 rounded-full">
                    <Users className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-100 dark:border-gray-700">
            <CardHeader className="pb-2 p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg font-medium">Top Performing Links</CardTitle>
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
                            borderRadius: '6px',
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
                        <div key={link.id} className="flex items-center gap-3 p-2 sm:p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
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

          {/* Browser Data Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-100 dark:border-gray-700">
              <CardHeader className="pb-2 p-4 sm:p-6">
                <CardTitle className="text-base sm:text-lg font-medium flex items-center gap-2">
                  <MousePointer className="h-4 w-4" />
                  Browser Usage
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="h-56 sm:h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={browserData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={isMobile ? "70%" : "65%"}
                        innerRadius={isMobile ? "40%" : "45%"}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {browserData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          borderRadius: '6px',
                          border: '1px solid #e2e8f0',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                          fontSize: isMobile ? '12px' : '14px',
                        }}
                        formatter={(value: any) => [`${value} visits`, 'Visits']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Geographical Data Section */}
            <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-100 dark:border-gray-700">
              <CardHeader className="pb-2 p-4 sm:p-6">
                <CardTitle className="text-base sm:text-lg font-medium flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Geographical Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="h-56 sm:h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={geoData}
                      layout="vertical"
                      margin={{
                        top: 5,
                        right: isMobile ? 10 : 30,
                        left: isMobile ? 80 : 100,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                      <XAxis type="number" tick={{fontSize: isMobile ? 10 : 12}} />
                      <YAxis 
                        dataKey="name" 
                        type="category" 
                        tick={{fontSize: isMobile ? 10 : 12}}
                        width={isMobile ? 70 : 90}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          borderRadius: '6px',
                          border: '1px solid #e2e8f0',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                          fontSize: isMobile ? '12px' : '14px',
                        }}
                        formatter={(value: any) => [`${value} visits`, 'Visits']}
                      />
                      <Bar dataKey="value" fill="#2563eb" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity Timeline */}
          <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-100 dark:border-gray-700">
            <CardHeader className="pb-2 p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Recent Link Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              {topLinks.length > 0 ? (
                <div className="space-y-4">
                  {topLinks.slice(0, 3).map((link, index) => (
                    <div key={link.id} className="relative pl-6 pb-4">
                      <div className="absolute left-0 top-0 h-full w-px bg-gray-200 dark:bg-gray-700"></div>
                      <div className="absolute left-[-4px] top-1 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <div className="h-2 w-2 rounded-full bg-primary"></div>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                        <div className="font-medium">{link.name}</div>
                        <div className="text-sm text-gray-500">
                          {`${Math.floor(Math.random() * 10) + 1} visits in the past ${Math.floor(Math.random() * 3) + 1} hours`}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <p className="text-gray-500">No recent activity</p>
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
