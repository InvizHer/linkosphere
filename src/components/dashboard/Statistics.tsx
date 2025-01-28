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
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const Statistics = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalLinks: 0,
    totalViews: 0,
    averageViews: 0,
    mostViewedLink: null as any,
  });
  const [viewsData, setViewsData] = useState<any[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;

      const { data: links } = await supabase
        .from("links")
        .select("*")
        .eq("user_id", user.id);

      if (!links) return;

      const totalLinks = links.length;
      const totalViews = links.reduce((sum, link) => sum + (link.views || 0), 0);
      const averageViews = totalLinks > 0 ? totalViews / totalLinks : 0;
      const mostViewedLink = links.reduce(
        (prev, current) =>
          (prev?.views || 0) > (current.views || 0) ? prev : current,
        null
      );

      setStats({
        totalLinks,
        totalViews,
        averageViews,
        mostViewedLink,
      });

      // Prepare data for the chart
      const chartData = links
        .sort((a, b) => (b.views || 0) - (a.views || 0))
        .slice(0, 5)
        .map((link) => ({
          name: link.name,
          views: link.views || 0,
        }));

      setViewsData(chartData);
    };

    fetchStats();
  }, [user]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Links</CardTitle>
            <CardDescription>Number of links created</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.totalLinks}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Views</CardTitle>
            <CardDescription>Combined views across all links</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.totalViews}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Average Views</CardTitle>
            <CardDescription>Views per link</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {stats.averageViews.toFixed(1)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Most Viewed</CardTitle>
            <CardDescription>Your most popular link</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.mostViewedLink ? (
              <div>
                <p className="font-medium">{stats.mostViewedLink.name}</p>
                <p className="text-sm text-gray-500">
                  {stats.mostViewedLink.views} views
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No links yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top 5 Most Viewed Links</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={viewsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="views" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Statistics;