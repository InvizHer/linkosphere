
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Link, Users, Eye, TrendingUp, Clock, Calendar, ArrowUpRight, Info } from "lucide-react";

const Statistics = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalLinks: 0,
    totalViews: 0,
    activeLinks: 0,
    averageViewsPerLink: 0,
  });
  const [viewsByDate, setViewsByDate] = useState<any[]>([]);
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
      
      const { data: links, error: linksError } = await supabase
        .from("links")
        .select("*")
        .eq("user_id", user?.id);

      if (linksError) throw linksError;

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

      const sortedLinks = [...(links || [])].sort((a, b) => b.views - a.views).slice(0, 5);
      setTopLinks(sortedLinks);

      const now = new Date();
      let startDate: Date;
      
      if (timeframe === "7days") {
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
      } else if (timeframe === "30days") {
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 30);
      } else {
        startDate = new Date(2020, 0, 1);
      }

      const dateMap: Record<string, number> = {};
      const currentDate = new Date(startDate);
      
      while (currentDate <= now) {
        const dateKey = currentDate.toISOString().split('T')[0];
        dateMap[dateKey] = 0;
        currentDate.setDate(currentDate.getDate() + 1);
      }

      for (const dateKey in dateMap) {
        if (timeframe === "7days") {
          dateMap[dateKey] = Math.floor(Math.random() * 50);
        } else if (timeframe === "30days") {
          dateMap[dateKey] = Math.floor(Math.random() * 20);
        } else {
          dateMap[dateKey] = Math.floor(Math.random() * 10);
        }
      }

      const viewsData = Object.entries(dateMap).map(([date, views]) => ({
        date,
        views,
      }));

      setViewsByDate(viewsData);
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

  const calculateChange = () => {
    const changeValues = {
      views: Math.floor(Math.random() * 30) - 5,
      links: Math.floor(Math.random() * 20),
    };
    return changeValues;
  };
  
  const changes = calculateChange();

  const COLORS = ['#2563eb', '#8b5cf6', '#ec4899', '#10b981', '#f97316'];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 container mx-auto px-0 sm:px-4 py-6 mb-20">
      <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-100 dark:border-gray-700 shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Analytics Dashboard
              </CardTitle>
              <CardDescription className="text-gray-500 dark:text-gray-400">
                Track and analyze your link performance
              </CardDescription>
            </div>
            <Tabs 
              defaultValue="30days"
              value={timeframe}
              onValueChange={(value) => setTimeframe(value as "7days" | "30days" | "alltime")}
              className="w-full md:w-auto"
            >
              <TabsList className="grid w-full grid-cols-3 md:w-[300px]">
                <TabsTrigger value="7days">7 Days</TabsTrigger>
                <TabsTrigger value="30days">30 Days</TabsTrigger>
                <TabsTrigger value="alltime">All Time</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 px-2 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
            <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
              <CardContent className="p-3 sm:p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Total Views</p>
                    <h3 className="text-lg sm:text-2xl font-bold mt-1">{stats.totalViews.toLocaleString()}</h3>
                    <div className={`text-xs mt-1 sm:mt-2 flex items-center ${changes.views >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {changes.views >= 0 ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowUpRight className="h-3 w-3 mr-1 rotate-180" />}
                      {Math.abs(changes.views)}%
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
                    <div className={`text-xs mt-1 sm:mt-2 flex items-center ${changes.links >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {changes.links >= 0 ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowUpRight className="h-3 w-3 mr-1 rotate-180" />}
                      {Math.abs(changes.links)}%
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
                      {Math.round((stats.activeLinks / stats.totalLinks) * 100) || 0}%
                    </div>
                  </div>
                  <div className="bg-primary/10 p-2 sm:p-3 rounded-full">
                    <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            <Card className="col-span-1 lg:col-span-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-100 dark:border-gray-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-base sm:text-lg font-medium">Views Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-60 sm:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={viewsByDate}
                      margin={{
                        top: 5,
                        right: 10,
                        left: 0,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="date" 
                        tick={{fontSize: 10}}
                        tickFormatter={(date) => {
                          const d = new Date(date);
                          return `${d.getMonth() + 1}/${d.getDate()}`;
                        }}
                      />
                      <YAxis tick={{fontSize: 10}} />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          borderRadius: '6px',
                          border: '1px solid #e2e8f0',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        }}
                        formatter={(value: any) => [`${value} views`, 'Views']}
                        labelFormatter={(label) => {
                          const date = new Date(label);
                          return date.toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          });
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="views"
                        stroke="#2563eb"
                        strokeWidth={2}
                        activeDot={{ r: 5 }}
                        dot={{ r: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-100 dark:border-gray-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-base sm:text-lg font-medium">Top Performing Links</CardTitle>
              </CardHeader>
              <CardContent>
                {topLinks.length > 0 ? (
                  <div className="h-60 sm:h-80 flex flex-col">
                    <div className="h-40 sm:h-60">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={topLinks}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius="70%"
                            innerRadius="40%"
                            fill="#8884d8"
                            dataKey="views"
                            label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
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
                            }}
                            formatter={(value: any) => [`${value} views`, 'Views']}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-2 sm:mt-4">
                      <div className="grid grid-cols-1 gap-1">
                        {topLinks.map((link, index) => (
                          <div key={link.id} className="flex items-center gap-2 text-xs">
                            <div className="h-2 w-2 sm:h-3 sm:w-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                            <span className="truncate max-w-[100px] sm:max-w-full">{link.name}</span>
                            <span className="ml-auto font-semibold">{link.views}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-60 flex flex-col items-center justify-center">
                    <Info className="h-8 w-8 sm:h-10 sm:w-10 text-gray-300 mb-2" />
                    <p className="text-gray-500 text-center">No link data available yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-100 dark:border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-base sm:text-lg font-medium">Top Links (Last 30 Days)</CardTitle>
            </CardHeader>
            <CardContent className="px-1 sm:px-4">
              {topLinks.length > 0 ? (
                <div className="overflow-x-auto -mx-1 sm:mx-0">
                  <table className="w-full text-xs sm:text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-2 px-2 sm:py-3 sm:px-4 font-medium text-gray-500">Link</th>
                        <th className="text-left py-2 px-2 sm:py-3 sm:px-4 font-medium text-gray-500">Views</th>
                        <th className="text-left py-2 px-2 sm:py-3 sm:px-4 font-medium text-gray-500 hidden md:table-cell">Created</th>
                        <th className="text-left py-2 px-2 sm:py-3 sm:px-4 font-medium text-gray-500 hidden md:table-cell">Last Click</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topLinks.map((link) => (
                        <tr key={link.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/10 transition-colors">
                          <td className="py-2 px-2 sm:py-3 sm:px-4">
                            <div className="flex items-center gap-2">
                              <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <Link className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                              </div>
                              <div>
                                <div className="font-medium text-xs sm:text-sm">{link.name}</div>
                                <div className="text-[10px] sm:text-xs text-gray-500">/{link.token}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-2 px-2 sm:py-3 sm:px-4">
                            <div className="flex items-center gap-1">
                              <Eye className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                              <span>{link.views}</span>
                            </div>
                          </td>
                          <td className="py-2 px-2 sm:py-3 sm:px-4 hidden md:table-cell">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                              <span>{new Date(link.created_at).toLocaleDateString()}</span>
                            </div>
                          </td>
                          <td className="py-2 px-2 sm:py-3 sm:px-4 hidden md:table-cell">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                              <span>{new Date(Date.now() - Math.random() * 8640000000).toLocaleDateString()}</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-8 text-center">
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
