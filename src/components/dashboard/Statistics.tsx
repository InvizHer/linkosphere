
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
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Link, Users, Eye, Info, PieChart as PieChartIcon, BarChart2, Clock, Calendar, ArrowUpRight, ArrowDownRight, Zap, Command } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion } from "framer-motion";

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

  const COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899'];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          <p className="mt-4 text-indigo-600 dark:text-indigo-300">Loading statistics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 container mx-auto px-2 sm:px-4 py-4 sm:py-6 mb-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="overflow-hidden border-none shadow-lg bg-white/80 dark:bg-indigo-950/30 backdrop-blur-md">
          <CardHeader className="pb-2 sm:pb-3 p-4 sm:p-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle className="text-xl sm:text-2xl font-bold flex items-center">
                  <BarChart2 className="mr-2 h-5 w-5" />
                  Analytics Dashboard
                </CardTitle>
                <CardDescription className="text-white/80 mt-1">
                  Track your link performance and engagement metrics
                </CardDescription>
              </div>
              <Tabs 
                defaultValue="30days"
                value={timeframe}
                onValueChange={(value) => setTimeframe(value as "7days" | "30days" | "alltime")}
                className="w-full md:w-auto"
              >
                <TabsList className="grid w-full grid-cols-3 md:w-[300px] bg-white/20 border border-white/10">
                  <TabsTrigger value="7days" className="text-xs sm:text-sm text-white data-[state=active]:bg-white/20">7 Days</TabsTrigger>
                  <TabsTrigger value="30days" className="text-xs sm:text-sm text-white data-[state=active]:bg-white/20">30 Days</TabsTrigger>
                  <TabsTrigger value="alltime" className="text-xs sm:text-sm text-white data-[state=active]:bg-white/20">All Time</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 sm:space-y-8 px-4 sm:px-6 py-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatsCard 
                title="Total Views" 
                value={stats.totalViews} 
                icon={<Eye className="h-5 w-5 text-white" />}
                description="All your links"
                trend={stats.totalViews > 10 ? "up" : "neutral"}
                color="from-indigo-500 to-indigo-600"
              />
              
              <StatsCard 
                title="Total Links" 
                value={stats.totalLinks} 
                icon={<Link className="h-5 w-5 text-white" />}
                description="Created by you"
                trend="neutral"
                color="from-purple-500 to-purple-600"
              />
              
              <StatsCard 
                title="Active Links" 
                value={stats.activeLinks} 
                icon={<Zap className="h-5 w-5 text-white" />}
                description={`${Math.round((stats.activeLinks / stats.totalLinks) * 100) || 0}% of total`}
                trend={stats.activeLinks > 0 ? "up" : "neutral"}
                color="from-violet-500 to-violet-600"
              />
              
              <StatsCard 
                title="Avg. Views" 
                value={stats.averageViewsPerLink} 
                icon={<Users className="h-5 w-5 text-white" />}
                description="Per link"
                trend={stats.averageViewsPerLink > 5 ? "up" : "neutral"}
                color="from-fuchsia-500 to-fuchsia-600"
              />
            </div>

            {/* Charts Section */}
            <Card className="overflow-hidden border border-indigo-100 dark:border-indigo-800/30 bg-white/90 dark:bg-indigo-950/20 backdrop-blur-md">
              <CardHeader className="pb-2 p-4 sm:p-6 border-b border-indigo-100 dark:border-indigo-800/30">
                <CardTitle className="text-base sm:text-lg font-medium text-indigo-700 dark:text-indigo-300 flex items-center">
                  <PieChartIcon className="mr-2 h-4 w-4 text-indigo-500" />
                  Top Performing Links
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-4">
                {topLinks.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="h-60 sm:h-64 md:h-72 flex items-center justify-center">
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
                            paddingAngle={2}
                          >
                            {topLinks.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'rgba(255, 255, 255, 0.95)',
                              borderRadius: '8px',
                              border: '1px solid #e0e7ff',
                              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.15)',
                              fontSize: isMobile ? '12px' : '14px',
                            }}
                            formatter={(value: any) => [`${value} views`, 'Views']}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    
                    <div>
                      <div className="border-b border-indigo-100 dark:border-indigo-800/30 pb-2 mb-3">
                        <h3 className="text-sm font-medium text-indigo-700 dark:text-indigo-300 flex items-center">
                          <Command className="mr-2 h-3.5 w-3.5 text-indigo-500" />
                          Link Distribution
                        </h3>
                      </div>
                      <div className="space-y-3 sm:space-y-4">
                        {topLinks.map((link, index) => (
                          <div key={link.id} className="flex items-center gap-3 p-2 sm:p-3 bg-indigo-50/70 dark:bg-indigo-900/20 rounded-lg border border-indigo-100/70 dark:border-indigo-800/20">
                            <div className="h-8 w-8 rounded-full flex items-center justify-center" style={{ backgroundColor: COLORS[index % COLORS.length] + '20' }}>
                              <Eye className="h-4 w-4" style={{ color: COLORS[index % COLORS.length] }} />
                            </div>
                            <div className="flex-grow min-w-0">
                              <div className="font-medium text-sm truncate text-indigo-700 dark:text-indigo-300">{link.name}</div>
                              <div className="text-xs text-indigo-500 dark:text-indigo-400 truncate">/{link.token}</div>
                            </div>
                            <div className="flex items-center text-sm font-semibold text-indigo-700 dark:text-indigo-300">
                              {link.views}
                              <span className="text-xs text-indigo-500 dark:text-indigo-400 ml-1">views</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-800/30 flex items-center justify-center mx-auto mb-4">
                      <Info className="h-8 w-8 text-indigo-500" />
                    </div>
                    <p className="text-indigo-700 dark:text-indigo-300 mb-1">No link data available yet</p>
                    <p className="text-sm text-indigo-500 dark:text-indigo-400">Create and share links to see statistics here</p>
                    <Button className="mt-6 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 border-none text-white">
                      <Link className="mr-1.5 h-4 w-4" />
                      Create a New Link
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Bar Chart Section */}
            {topLinks.length > 0 && (
              <Card className="overflow-hidden border border-indigo-100 dark:border-indigo-800/30 bg-white/90 dark:bg-indigo-950/20 backdrop-blur-md">
                <CardHeader className="pb-2 p-4 sm:p-6 border-b border-indigo-100 dark:border-indigo-800/30">
                  <CardTitle className="text-base sm:text-lg font-medium text-indigo-700 dark:text-indigo-300 flex items-center">
                    <BarChart2 className="mr-2 h-4 w-4 text-indigo-500" />
                    Link Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-1 sm:px-4 py-4">
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
                          <CartesianGrid strokeDasharray="3 3" stroke={isMobile ? "#e0e7ff50" : "#e0e7ff"} />
                          <XAxis 
                            dataKey="name" 
                            tick={{fontSize: isMobile ? 10 : 12, fill: "#6366F1"}}
                            tickFormatter={(value) => value.length > 10 ? value.substr(0, 10) + '...' : value}
                            height={60}
                            interval={0}
                            angle={-45}
                            textAnchor="end"
                            stroke="#c7d2fe"
                          />
                          <YAxis 
                            tick={{fontSize: isMobile ? 10 : 12, fill: "#6366F1"}}
                            tickFormatter={(value) => value === 0 ? '0' : value}
                            stroke="#c7d2fe"
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'rgba(255, 255, 255, 0.95)',
                              borderRadius: '8px',
                              border: '1px solid #e0e7ff',
                              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.15)',
                              fontSize: isMobile ? '12px' : '14px',
                            }}
                            formatter={(value: any) => [`${value} views`, 'Views']}
                          />
                          <Bar 
                            dataKey="views" 
                            name="Views" 
                            radius={[4, 4, 0, 0]}
                            barSize={isMobile ? 20 : 40}
                          >
                            {topLinks.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

interface StatsCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  description: string;
  trend: "up" | "down" | "neutral";
  color: string;
}

const StatsCard = ({ title, value, icon, description, trend, color }: StatsCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-xl overflow-hidden border-none shadow-md bg-white/90 dark:bg-indigo-950/20 backdrop-blur-md"
    >
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="text-sm font-medium text-indigo-700 dark:text-indigo-300">{title}</h3>
          <div className={`p-2 rounded-lg bg-gradient-to-br ${color}`}>
            {icon}
          </div>
        </div>
        <div className="mt-3 flex items-baseline">
          <p className="text-2xl font-bold text-indigo-800 dark:text-indigo-200">{value.toLocaleString()}</p>
          {trend !== "neutral" && (
            <span className={`ml-2 flex items-center text-xs font-medium ${
              trend === "up" ? "text-emerald-600" : "text-rose-600"
            }`}>
              {trend === "up" ? (
                <ArrowUpRight className="h-3 w-3 mr-0.5" />
              ) : (
                <ArrowDownRight className="h-3 w-3 mr-0.5" />
              )}
              {trend === "up" ? "+" : "-"}5%
            </span>
          )}
        </div>
        <p className="mt-1 text-xs text-indigo-500 dark:text-indigo-400">{description}</p>
      </div>
    </motion.div>
  );
};

export default Statistics;
