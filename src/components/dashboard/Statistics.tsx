
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
import { useToast } from "@/components/ui/use-toast";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Link, Users, Eye, Info, Calendar, Globe, Chrome, Monitor, Laptop, AlertCircle } from "lucide-react";
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
  const [browserData, setBrowserData] = useState<any[]>([]);
  const [geoData, setGeoData] = useState<any[]>([]);
  
  // Sample browser and geo data that would normally come from your database
  const sampleBrowserData = [
    { name: "Chrome", value: 65 },
    { name: "Firefox", value: 15 },
    { name: "Safari", value: 12 },
    { name: "Edge", value: 8 }
  ];

  const sampleGeoData = [
    { name: "United States", value: 45 },
    { name: "United Kingdom", value: 20 },
    { name: "Germany", value: 15 },
    { name: "Canada", value: 10 },
    { name: "Other", value: 10 }
  ];

  useEffect(() => {
    if (user) {
      fetchStatistics();
    }
  }, [user]);

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

      // For demonstration, use sample data - in a real implementation, you would fetch this from your database
      setBrowserData(sampleBrowserData);
      setGeoData(sampleGeoData);

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

  const getBrowserIcon = (browserName: string) => {
    switch (browserName.toLowerCase()) {
      case 'chrome':
        return <Chrome className="h-4 w-4" style={{ color: COLORS[0] }} />;
      case 'firefox':
        return <Monitor className="h-4 w-4" style={{ color: COLORS[1] }} />;
      case 'safari':
        return <Laptop className="h-4 w-4" style={{ color: COLORS[2] }} />;
      default:
        return <Globe className="h-4 w-4" style={{ color: COLORS[3] }} />;
    }
  };

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

          <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-100 dark:border-gray-700">
            <CardHeader className="pb-2 p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg font-medium">Browser Analytics</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              {topLinks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div className="h-56 sm:h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={browserData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={isMobile ? "70%" : "65%"}
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
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div>
                    <div className="border-b border-gray-100 dark:border-gray-700 pb-2 mb-3">
                      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Browser Distribution</h3>
                    </div>
                    <div className="space-y-3 sm:space-y-4">
                      {browserData.map((browser, index) => (
                        <div key={index} className="flex items-center gap-3 p-2 sm:p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                          <div className="h-8 w-8 rounded-full flex items-center justify-center" style={{ backgroundColor: COLORS[index % COLORS.length] + '30' }}>
                            {getBrowserIcon(browser.name)}
                          </div>
                          <div className="flex-grow">
                            <div className="font-medium text-sm">{browser.name}</div>
                          </div>
                          <div className="text-sm font-semibold">
                            {browser.value}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center">
                  <AlertCircle className="h-10 w-10 mx-auto mb-3 text-gray-300" />
                  <p className="text-gray-500 mb-1">Browser analytics not available</p>
                  <p className="text-sm text-gray-400">We need more data to show browser statistics</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-100 dark:border-gray-700">
            <CardHeader className="pb-2 p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg font-medium">Geographic Distribution</CardTitle>
            </CardHeader>
            <CardContent className="px-1 sm:px-4 p-0 pb-4">
              {topLinks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 p-4">
                  <div className="h-56 sm:h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        layout="vertical"
                        data={geoData}
                        margin={{
                          top: 5,
                          right: 30,
                          left: isMobile ? 70 : 100,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" />
                        <YAxis 
                          dataKey="name" 
                          type="category" 
                          tick={{ fontSize: isMobile ? 10 : 12 }} 
                          width={isMobile ? 70 : 100}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            borderRadius: '6px',
                            border: '1px solid #e2e8f0',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                            fontSize: isMobile ? '12px' : '14px',
                          }}
                        />
                        <Bar dataKey="value" fill="#2563eb" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div>
                    <div className="border-b border-gray-100 dark:border-gray-700 pb-2 mb-3">
                      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Country Breakdown</h3>
                    </div>
                    <div className="space-y-3 sm:space-y-4">
                      {geoData.map((geo, index) => (
                        <div key={index} className="flex items-center gap-3 p-2 sm:p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                          <div className="h-8 w-8 rounded-full flex items-center justify-center" style={{ backgroundColor: COLORS[index % COLORS.length] + '30' }}>
                            <Globe className="h-4 w-4" style={{ color: COLORS[index % COLORS.length] }} />
                          </div>
                          <div className="flex-grow">
                            <div className="font-medium text-sm">{geo.name}</div>
                          </div>
                          <div className="text-sm font-semibold">
                            {geo.value}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center">
                  <Globe className="h-10 w-10 mx-auto mb-3 text-gray-300" />
                  <p className="text-gray-500 mb-1">Geographic data not available</p>
                  <p className="text-sm text-gray-400">We need more data to show location statistics</p>
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
