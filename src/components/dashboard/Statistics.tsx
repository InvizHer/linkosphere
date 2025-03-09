
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
import { Link, Users, Eye, Info } from "lucide-react";
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

  const COLORS = ['#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6', '#0d9488'];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-12 w-12 rounded-full border-4 border-sky-500 border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 container mx-auto px-2 sm:px-4 py-4 sm:py-6 mb-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-sky-100 dark:border-gray-700 shadow-lg rounded-xl overflow-hidden">
          <CardHeader className="pb-2 sm:pb-3 p-4 sm:p-6 border-b border-sky-100 dark:border-gray-700 bg-gradient-to-r from-sky-500 to-blue-500 text-white">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle className="text-xl sm:text-2xl font-bold">
                  Analytics Dashboard
                </CardTitle>
                <CardDescription className="text-white/80">
                  Track your link performance and engagement metrics
                </CardDescription>
              </div>
              <Tabs 
                defaultValue="30days"
                value={timeframe}
                onValueChange={(value) => setTimeframe(value as "7days" | "30days" | "alltime")}
                className="w-full md:w-auto"
              >
                <TabsList className="grid w-full grid-cols-3 md:w-[300px] bg-white/20">
                  <TabsTrigger value="7days" className="text-xs sm:text-sm data-[state=active]:bg-white/30 text-white">
                    7 Days
                  </TabsTrigger>
                  <TabsTrigger value="30days" className="text-xs sm:text-sm data-[state=active]:bg-white/30 text-white">
                    30 Days
                  </TabsTrigger>
                  <TabsTrigger value="alltime" className="text-xs sm:text-sm data-[state=active]:bg-white/30 text-white">
                    All Time
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 px-4 sm:px-6 py-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard 
                title="Total Views" 
                value={stats.totalViews.toLocaleString()} 
                icon={Eye} 
                description="All your links" 
              />
              <StatCard 
                title="Total Links" 
                value={stats.totalLinks.toLocaleString()} 
                icon={Link} 
                description="Created by you" 
              />
              <StatCard 
                title="Active Links" 
                value={stats.activeLinks.toLocaleString()} 
                icon={Link} 
                description={`${Math.round((stats.activeLinks / stats.totalLinks) * 100) || 0}% of total`} 
              />
              <StatCard 
                title="Avg. Views" 
                value={stats.averageViewsPerLink.toLocaleString()} 
                icon={Users} 
                description="Per link" 
              />
            </div>

            <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-sky-100 dark:border-gray-700 rounded-xl">
              <CardHeader className="pb-2 p-4 sm:p-6 border-b border-sky-100 dark:border-gray-700">
                <CardTitle className="text-base sm:text-lg font-medium flex items-center gap-2">
                  <TrendingUpIcon className="h-4 w-4 text-sky-500" />
                  Top Performing Links
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-4">
                {topLinks.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="h-56 sm:h-64 md:h-72 bg-white dark:bg-gray-800 p-4 rounded-xl border border-sky-100 dark:border-gray-700">
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
                              borderRadius: '12px',
                              border: '1px solid #e2e8f0',
                              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                              fontSize: isMobile ? '12px' : '14px',
                            }}
                            formatter={(value: any) => [`${value} views`, 'Views']}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    
                    <div className="flex flex-col justify-center">
                      <div className="border-b border-sky-100 dark:border-gray-700 pb-2 mb-4">
                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Link Distribution</h3>
                      </div>
                      <div className="space-y-3">
                        {topLinks.map((link, index) => (
                          <LinkPerformanceCard 
                            key={link.id}
                            link={link}
                            index={index}
                            colors={COLORS}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <NoDataMessage />
                )}
              </CardContent>
            </Card>

            <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-sky-100 dark:border-gray-700 rounded-xl">
              <CardHeader className="pb-2 p-4 sm:p-6 border-b border-sky-100 dark:border-gray-700">
                <CardTitle className="text-base sm:text-lg font-medium flex items-center gap-2">
                  <BarChart2Icon className="h-4 w-4 text-sky-500" />
                  Link Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="px-1 sm:px-4 p-4">
                {topLinks.length > 0 ? (
                  <div className="overflow-x-auto bg-white dark:bg-gray-800 p-4 rounded-xl border border-sky-100 dark:border-gray-700">
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
                              borderRadius: '12px',
                              border: '1px solid #e2e8f0',
                              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                              fontSize: isMobile ? '12px' : '14px',
                            }}
                            formatter={(value: any) => [`${value} views`, 'Views']}
                          />
                          <Bar dataKey="views" name="Views" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                ) : (
                  <NoDataMessage />
                )}
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

// Extracted Components
const StatCard = ({ title, value, icon: Icon, description }) => (
  <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-sky-100 dark:border-gray-700 overflow-hidden rounded-xl hover:-translate-y-1 transition-all duration-300 hover:shadow-md">
    <CardContent className="p-4">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <h3 className="text-lg sm:text-2xl font-bold mt-1">{value}</h3>
          <div className="text-xs mt-1 sm:mt-2 text-gray-500">
            {description}
          </div>
        </div>
        <div className="bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 p-2 sm:p-3 rounded-full">
          <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
        </div>
      </div>
    </CardContent>
  </Card>
);

const TrendingUpIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
    <polyline points="17 6 23 6 23 12"></polyline>
  </svg>
);

const BarChart2Icon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect x="2" y="10" width="4" height="10"></rect>
    <rect x="10" y="4" width="4" height="16"></rect>
    <rect x="18" y="8" width="4" height="12"></rect>
  </svg>
);

const LinkPerformanceCard = ({ link, index, colors }) => (
  <div key={link.id} className="flex items-center gap-3 p-2 sm:p-3 bg-white dark:bg-gray-800 rounded-lg border border-sky-100 dark:border-gray-700 hover:-translate-y-1 transition-all duration-300 hover:shadow-md">
    <div className="h-8 w-8 rounded-full flex items-center justify-center" style={{ backgroundColor: colors[index % colors.length] + '20' }}>
      <Eye className="h-4 w-4" style={{ color: colors[index % colors.length] }} />
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
);

const NoDataMessage = () => (
  <div className="py-12 text-center bg-white dark:bg-gray-800 rounded-xl border border-sky-100 dark:border-gray-700">
    <div className="bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 p-3 rounded-full inline-flex mb-3">
      <Info className="h-6 w-6" />
    </div>
    <p className="text-gray-500 mb-1">No link data available yet</p>
    <p className="text-sm text-gray-400">Create and share links to see statistics here</p>
  </div>
);

export default Statistics;
