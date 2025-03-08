
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
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Link, Users, Eye, Info, Calendar, Activity, Clock, BarChart2 } from "lucide-react";
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
    <div className="space-y-6 container mx-auto px-4 py-6 mb-20">
      {/* Header Card */}
      <Card className="bg-gradient-to-br from-primary to-primary/80 text-white shadow-lg border-none overflow-hidden">
        <CardHeader className="pb-2 p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-xl sm:text-3xl font-bold">
                Analytics Dashboard
              </CardTitle>
              <CardDescription className="text-white/80 text-sm sm:text-base mt-1">
                View your link performance metrics
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 p-2 bg-white/10 backdrop-blur-sm rounded-lg">
              <Activity className="h-5 w-5" />
              <span className="text-sm font-medium">Last updated: {new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard 
          title="Total Views" 
          value={stats.totalViews} 
          description="All time" 
          icon={<Eye className="h-5 w-5 text-blue-500" />}
          color="bg-blue-50 dark:bg-blue-950/30"
          textColor="text-blue-600 dark:text-blue-400"
        />
        <StatsCard 
          title="Total Links" 
          value={stats.totalLinks} 
          description="Created by you" 
          icon={<Link className="h-5 w-5 text-purple-500" />}
          color="bg-purple-50 dark:bg-purple-950/30"
          textColor="text-purple-600 dark:text-purple-400"
        />
        <StatsCard 
          title="Active Links" 
          value={stats.activeLinks} 
          description={`${Math.round((stats.activeLinks / stats.totalLinks) * 100) || 0}% of total`} 
          icon={<Activity className="h-5 w-5 text-green-500" />}
          color="bg-green-50 dark:bg-green-950/30"
          textColor="text-green-600 dark:text-green-400"
        />
        <StatsCard 
          title="Avg. Views" 
          value={stats.averageViewsPerLink} 
          description="Per link" 
          icon={<Users className="h-5 w-5 text-amber-500" />}
          color="bg-amber-50 dark:bg-amber-950/30"
          textColor="text-amber-600 dark:text-amber-400"
        />
      </div>

      {/* Top Performing Links */}
      <Card className="shadow-md">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <BarChart2 className="h-5 w-5 text-primary" />
              Top Performing Links
            </CardTitle>
            <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
              By views
            </span>
          </div>
        </CardHeader>
        <CardContent>
          {topLinks.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-64 md:h-80">
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
                        fontSize: isMobile ? '12px' : '14px',
                      }}
                      formatter={(value: any, name: any, props: any) => {
                        const link = topLinks[props.payload.index];
                        return [`${value} views`, link?.name || 'Unknown'];
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div>
                <div className="flex items-center justify-between border-b pb-2 mb-4">
                  <h3 className="text-sm font-medium">Link Performance</h3>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="space-y-4">
                  {topLinks.map((link, index) => (
                    <div key={link.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800/80">
                      <div className="h-10 w-10 rounded-full flex items-center justify-center" style={{ backgroundColor: COLORS[index % COLORS.length] + '20' }}>
                        <Eye className="h-5 w-5" style={{ color: COLORS[index % COLORS.length] }} />
                      </div>
                      <div className="flex-grow min-w-0">
                        <div className="font-medium text-sm truncate">{link.name}</div>
                        <div className="text-xs text-gray-500 truncate">/{link.token}</div>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="text-lg font-semibold">{link.views}</div>
                        <div className="text-xs text-gray-500">views</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-16 text-center">
              <Info className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 text-lg font-medium mb-2">No link data available yet</p>
              <p className="text-sm text-gray-400">Create and share links to see statistics here</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Views Distribution Chart */}
      <Card className="shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Link Views Distribution
          </CardTitle>
          <CardDescription>
            Visualizing your link performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          {topLinks.length > 0 ? (
            <div className="h-72 md:h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topLinks}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 60,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12 }} 
                    angle={-45}
                    textAnchor="end"
                    height={70} 
                  />
                  <YAxis />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      borderRadius: '6px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }}
                    formatter={(value: any) => [`${value} views`, 'Views']}
                  />
                  <Bar dataKey="views" fill="#2563eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="py-12 text-center">
              <BarChart2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 text-lg font-medium mb-2">No chart data available</p>
              <p className="text-sm text-gray-400">Your link view data will appear here</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Stats Card Component
interface StatsCardProps {
  title: string;
  value: number;
  description: string;
  icon: React.ReactNode;
  color: string;
  textColor: string;
}

const StatsCard = ({ title, value, description, icon, color, textColor }: StatsCardProps) => (
  <Card className="overflow-hidden border shadow-sm">
    <CardContent className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-full ${color}`}>
          {icon}
        </div>
        <div className="text-xs font-medium uppercase text-muted-foreground">
          {title}
        </div>
      </div>
      <div className={`text-3xl font-bold mb-1 ${textColor}`}>
        {value.toLocaleString()}
      </div>
      <div className="text-xs text-muted-foreground">
        {description}
      </div>
    </CardContent>
  </Card>
);

export default Statistics;
