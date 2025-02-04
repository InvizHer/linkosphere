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
import { useToast } from "@/components/ui/use-toast";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";
import { Link, Eye, TrendingUp, Award, Calendar, Activity, Users, Clock, RefreshCcw } from "lucide-react";
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns";

const Statistics = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState({
    totalLinks: 0,
    totalViews: 0,
    averageViews: 0,
    mostViewedLink: null as any,
    weeklyViews: 0,
    monthlyViews: 0,
    yearlyViews: 0,
  });
  const [timeSeriesData, setTimeSeriesData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    if (!user) {
      setError("Please log in to view statistics");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const now = new Date();
      const weekStart = startOfWeek(now);
      const weekEnd = endOfWeek(now);
      const monthStart = startOfMonth(now);
      const monthEnd = endOfMonth(now);
      const yearStart = startOfYear(now);
      const yearEnd = endOfYear(now);

      const { data: links, error: linksError } = await supabase
        .from("links")
        .select("*")
        .eq("user_id", user.id);

      if (linksError) {
        throw new Error(linksError.message);
      }

      if (!links) {
        setStats({
          totalLinks: 0,
          totalViews: 0,
          averageViews: 0,
          mostViewedLink: null,
          weeklyViews: 0,
          monthlyViews: 0,
          yearlyViews: 0,
        });
        setTimeSeriesData([]);
        return;
      }

      // Calculate basic stats
      const totalLinks = links.length;
      const totalViews = links.reduce((sum, link) => sum + (link.views || 0), 0);
      const averageViews = totalLinks > 0 ? totalViews / totalLinks : 0;
      const mostViewedLink = links.reduce(
        (prev, current) =>
          (prev?.views || 0) > (current.views || 0) ? prev : current,
        null
      );

      // Calculate time-based views
      const weeklyViews = links.reduce(
        (sum, link) => {
          const createdAt = new Date(link.created_at);
          return createdAt >= weekStart && createdAt <= weekEnd
            ? sum + (link.views || 0)
            : sum;
        },
        0
      );

      const monthlyViews = links.reduce(
        (sum, link) => {
          const createdAt = new Date(link.created_at);
          return createdAt >= monthStart && createdAt <= monthEnd
            ? sum + (link.views || 0)
            : sum;
        },
        0
      );

      const yearlyViews = links.reduce(
        (sum, link) => {
          const createdAt = new Date(link.created_at);
          return createdAt >= yearStart && createdAt <= yearEnd
            ? sum + (link.views || 0)
            : sum;
        },
        0
      );

      setStats({
        totalLinks,
        totalViews,
        averageViews,
        mostViewedLink,
        weeklyViews,
        monthlyViews,
        yearlyViews,
      });

      // Prepare time series data for the last 7 days
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = subDays(now, i);
        const views = links.reduce((sum, link) => {
          const createdAt = new Date(link.created_at);
          return format(createdAt, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
            ? sum + (link.views || 0)
            : sum;
        }, 0);
        return {
          date: format(date, 'MMM dd'),
          views,
        };
      }).reverse();

      setTimeSeriesData(last7Days);
    } catch (err: any) {
      setError(err.message);
      toast({
        variant: "destructive",
        title: "Error fetching statistics",
        description: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [user]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="text-destructive text-center">
          <p className="text-lg font-semibold">{error}</p>
          <p className="text-sm text-muted-foreground">Please try again later</p>
        </div>
        <Button onClick={fetchStats} variant="outline" className="gap-2">
          <RefreshCcw className="h-4 w-4" />
          Retry
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Links</CardTitle>
              <Link className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalLinks}</div>
              <p className="text-xs text-muted-foreground">Links created</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalViews}</div>
              <p className="text-xs text-muted-foreground">All-time views</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Views</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.averageViews.toFixed(1)}
              </div>
              <p className="text-xs text-muted-foreground">Per link</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Most Viewed</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {stats.mostViewedLink ? (
                <div>
                  <div className="text-2xl font-bold truncate">
                    {stats.mostViewedLink.views}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {stats.mostViewedLink.name}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No links yet</p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Weekly Views</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.weeklyViews}</div>
              <p className="text-xs text-muted-foreground">This week</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Views</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.monthlyViews}</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Yearly Views</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.yearlyViews}</div>
              <p className="text-xs text-muted-foreground">This year</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Views Trend</CardTitle>
            <CardDescription>
              Link views over the last 7 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timeSeriesData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-gray-200 dark:stroke-gray-700"
                  />
                  <XAxis
                    dataKey="date"
                    className="text-xs"
                    tick={{ fill: "currentColor" }}
                  />
                  <YAxis
                    className="text-xs"
                    tick={{ fill: "currentColor" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.8)",
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="views"
                    stroke="url(#colorGradient)"
                    strokeWidth={2}
                    dot={{ fill: "var(--primary)" }}
                  />
                  <defs>
                    <linearGradient
                      id="colorGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="var(--primary)"
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="100%"
                        stopColor="var(--accent)"
                        stopOpacity={0.8}
                      />
                    </linearGradient>
                  </defs>
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Statistics;