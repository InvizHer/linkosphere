
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Link as LinkIcon,
  Eye,
  PlusCircle,
  Clock,
  TrendingUp,
  Activity,
  Lock,
  Unlock,
  Users,
  Share2,
  Sparkles,
  BarChart2,
  Calendar,
} from "lucide-react";

const DashboardHome = () => {
  const { user } = useAuth();
  const [username, setUsername] = useState("");
  const [stats, setStats] = useState({
    totalLinks: 0,
    totalViews: 0,
    privateLinks: 0,
    publicLinks: 0,
  });
  const [recentLinks, setRecentLinks] = useState<any[]>([]);
  const [topLinks, setTopLinks] = useState<any[]>([]);
  const [greeting, setGreeting] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) return "Good morning";
      if (hour < 18) return "Good afternoon";
      return "Good evening";
    };
    setGreeting(getGreeting());
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;

      setLoading(true);
      try {
        // Fetch username
        const { data: profileData } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", user.id)
          .single();

        if (profileData) {
          setUsername(profileData.username);
        }

        // Fetch links statistics
        const { data: links } = await supabase
          .from("links")
          .select("*")
          .eq("user_id", user.id);

        if (links) {
          setStats({
            totalLinks: links.length,
            totalViews: links.reduce((sum, link) => sum + (link.views || 0), 0),
            privateLinks: links.filter((link) => link.password).length,
            publicLinks: links.filter((link) => !link.password).length,
          });

          // Get 5 most recent links
          const recent = links
            .sort(
              (a, b) =>
                new Date(b.created_at).getTime() -
                new Date(a.created_at).getTime()
            )
            .slice(0, 5);
          setRecentLinks(recent);

          // Get top 5 links by views
          const top = [...links]
            .sort((a, b) => (b.views || 0) - (a.views || 0))
            .slice(0, 5);
          setTopLinks(top);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  const getActivityMessage = () => {
    if (stats.totalLinks === 0) return "Create your first link to get started!";
    if (stats.totalViews === 0) return "Your links are waiting to be discovered!";
    if (stats.totalViews > 100) return "Your links are generating great traffic!";
    return "Keep creating and sharing your links!";
  };

  const statCards = [
    { title: "Total Links", icon: LinkIcon, value: stats.totalLinks, color: "bg-sky-500" },
    { title: "Total Views", icon: Eye, value: stats.totalViews, color: "bg-blue-500" },
    { title: "Private Links", icon: Lock, value: stats.privateLinks, color: "bg-sky-600" },
    { title: "Public Links", icon: Unlock, value: stats.publicLinks, color: "bg-blue-600" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full border-4 border-sky-600 border-t-transparent animate-spin"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-xl bg-gradient-to-r from-sky-600 to-blue-500 text-white shadow-lg"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/10 to-transparent"></div>
        <div className="absolute -right-10 -top-10 h-56 w-56 rounded-full bg-white/10 blur-3xl"></div>
        <div className="absolute -bottom-5 -left-5 h-32 w-32 rounded-full bg-white/10 blur-xl"></div>
        
        <div className="relative z-10 p-8 md:p-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <Badge className="inline-flex bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm">
                <Sparkles className="mr-1 h-3 w-3" />
                Dashboard
              </Badge>
              <h1 className="text-2xl font-bold md:text-3xl lg:text-4xl">
                {greeting}, {username}!
              </h1>
              <p className="max-w-md text-white/80">
                {getActivityMessage()}
              </p>
            </div>

            <div className="mt-4 flex flex-wrap gap-2 md:mt-0">
              <Button 
                asChild 
                size="sm" 
                variant="secondary" 
                className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm"
              >
                <Link to="/dashboard/create">
                  <PlusCircle className="mr-1.5 h-4 w-4" />
                  Create Link
                </Link>
              </Button>
              <Button 
                asChild 
                size="sm" 
                variant="secondary" 
                className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm"
              >
                <Link to="/dashboard/stats">
                  <BarChart2 className="mr-1.5 h-4 w-4" />
                  View Stats
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="grid grid-cols-2 gap-4 md:grid-cols-4"
      >
        {statCards.map((stat, index) => (
          <Card key={stat.title} className="overflow-hidden border-none shadow-md rounded-xl hover-card">
            <div className={`h-1 ${stat.color}`}></div>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <div className="bg-sky-100 dark:bg-sky-900/50 p-1.5 rounded-full">
                  <stat.icon className={`h-3.5 w-3.5 text-sky-600 dark:text-sky-400`} />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.title === "Total Links" && "Links created"}
                {stat.title === "Total Views" && "Combined views"}
                {stat.title === "Private Links" && "Password protected"}
                {stat.title === "Public Links" && "Publicly accessible"}
              </p>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Links Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <Tabs defaultValue="recent" className="w-full">
          <div className="flex items-center justify-between mb-4">
            <TabsList className="grid w-full max-w-xs grid-cols-2">
              <TabsTrigger value="recent">Recent Links</TabsTrigger>
              <TabsTrigger value="top">Top Links</TabsTrigger>
            </TabsList>
            <Button asChild variant="outline" size="sm" className="hidden sm:flex">
              <Link to="/dashboard/manage">
                <Eye className="mr-1.5 h-4 w-4" />
                View All Links
              </Link>
            </Button>
          </div>

          <Card className="border shadow-sm rounded-xl overflow-hidden">
            <TabsContent value="recent" className="mt-0">
              <CardHeader className="border-b pb-3 pt-4 bg-sky-50 dark:bg-sky-950/20">
                <CardTitle className="text-base">Recently Created Links</CardTitle>
                <CardDescription>Your 5 most recently created links</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <LinksTable links={recentLinks} emptyMessage="No links created yet" />
              </CardContent>
            </TabsContent>

            <TabsContent value="top" className="mt-0">
              <CardHeader className="border-b pb-3 pt-4 bg-sky-50 dark:bg-sky-950/20">
                <CardTitle className="text-base">Top Performing Links</CardTitle>
                <CardDescription>Your most viewed links</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <LinksTable links={topLinks} emptyMessage="No link views yet" />
              </CardContent>
            </TabsContent>
          </Card>
        </Tabs>
      </motion.div>

      {/* Activity Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <Card className="overflow-hidden border shadow-sm rounded-xl bg-white/90 dark:bg-gray-800/90">
          <CardHeader className="border-b bg-sky-50 dark:bg-sky-950/20 pb-3">
            <CardTitle className="flex items-center text-base">
              <Activity className="mr-2 h-4 w-4 text-sky-600" />
              Activity Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid gap-6 md:grid-cols-3">
              <div className="flex flex-col items-center justify-center rounded-lg border bg-card p-4 text-center shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1">
                <Calendar className="mb-2 h-5 w-5 text-sky-600" />
                <p className="text-sm font-medium">Last 7 Days</p>
                <h4 className="text-2xl font-bold">{stats.totalViews}</h4>
                <p className="text-xs text-muted-foreground">Total views</p>
              </div>
              
              <div className="flex flex-col items-center justify-center rounded-lg border bg-card p-4 text-center shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1">
                <TrendingUp className="mb-2 h-5 w-5 text-sky-600" />
                <p className="text-sm font-medium">Conversion</p>
                <h4 className="text-2xl font-bold">
                  {stats.totalLinks > 0 
                    ? `${Math.round((stats.totalViews / stats.totalLinks) * 10) / 10}` 
                    : "0"}
                </h4>
                <p className="text-xs text-muted-foreground">Avg views per link</p>
              </div>
              
              <div className="flex flex-col items-center justify-center rounded-lg border bg-card p-4 text-center shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1">
                <Users className="mb-2 h-5 w-5 text-sky-600" />
                <p className="text-sm font-medium">User Growth</p>
                <h4 className="text-2xl font-bold">+1</h4>
                <p className="text-xs text-muted-foreground">New account</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Mobile View All Button */}
      <div className="mt-4 text-center sm:hidden">
        <Button asChild variant="outline" className="w-full">
          <Link to="/dashboard/manage">
            <Eye className="mr-1.5 h-4 w-4" />
            View All Links
          </Link>
        </Button>
      </div>
    </div>
  );
};

// Links table component
const LinksTable = ({ links, emptyMessage }: { links: any[], emptyMessage: string }) => {
  return (
    <div className="overflow-hidden rounded-b-lg">
      {links.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Name</TableHead>
              <TableHead className="hidden md:table-cell">Views</TableHead>
              <TableHead className="hidden md:table-cell">Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {links.map((link) => (
              <TableRow key={link.id} className="hover:bg-sky-50 dark:hover:bg-sky-900/10">
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {link.password ? (
                      <div className="bg-sky-100 dark:bg-sky-900/50 p-1.5 rounded-full">
                        <Lock className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
                      </div>
                    ) : (
                      <div className="bg-sky-100 dark:bg-sky-900/50 p-1.5 rounded-full">
                        <Unlock className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
                      </div>
                    )}
                    <span className="truncate max-w-[150px] md:max-w-[200px]">
                      {link.name}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4 text-gray-500" />
                    {link.views || 0}
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-gray-500" />
                    {new Date(link.created_at).toLocaleDateString()}
                  </div>
                </TableCell>
                <TableCell className="text-right space-x-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    asChild
                    className="h-8 w-8 hover:bg-sky-100 dark:hover:bg-sky-900/30"
                  >
                    <Link
                      to={`/view?token=${link.token}`}
                      target="_blank"
                    >
                      <Share2 className="h-4 w-4" />
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
          <div className="bg-sky-100 dark:bg-sky-900/50 p-4 rounded-full mb-3">
            <LinkIcon className="h-6 w-6 text-sky-600 dark:text-sky-400" />
          </div>
          <p>{emptyMessage}</p>
          <Link to="/dashboard/create">
            <Button variant="outline" className="mt-4">
              <PlusCircle className="mr-1.5 h-4 w-4" />
              Create your first link
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default DashboardHome;
