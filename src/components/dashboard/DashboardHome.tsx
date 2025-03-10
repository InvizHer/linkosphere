
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
  Lightbulb,
  Zap,
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
    { title: "Total Links", icon: LinkIcon, value: stats.totalLinks, color: "from-indigo-500 to-indigo-600" },
    { title: "Total Views", icon: Eye, value: stats.totalViews, color: "from-purple-500 to-purple-600" },
    { title: "Private Links", icon: Lock, value: stats.privateLinks, color: "from-violet-500 to-violet-600" },
    { title: "Public Links", icon: Unlock, value: stats.publicLinks, color: "from-fuchsia-500 to-fuchsia-600" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin"></div>
          <p className="text-indigo-600 dark:text-indigo-300">Loading dashboard...</p>
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
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 text-white shadow-xl"
      >
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJwYXR0ZXJuIiB4PSIwIiB5PSIwIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHBhdHRlcm5UcmFuc2Zvcm09InJvdGF0ZSgzMCkiPjxyZWN0IHg9IjAiIHk9IjAiIHdpZHRoPSIyIiBoZWlnaHQ9IjIiIGZpbGw9IiNmZmZmZmYxMCIgLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjcGF0dGVybikiIC8+PC9zdmc+')]"></div>
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
                className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border border-white/10"
              >
                <Link to="/dashboard/create">
                  <PlusCircle className="mr-1.5 h-4 w-4" />
                  Create Link
                </Link>
              </Button>
              <Button 
                asChild 
                size="sm" 
                className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border border-white/10"
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
          <Card key={stat.title} className="overflow-hidden border-none shadow-lg bg-white/80 dark:bg-indigo-950/30 backdrop-blur-md">
            <div className={`h-1.5 bg-gradient-to-r ${stat.color}`}></div>
            <CardHeader className="pb-2 pt-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-indigo-950 dark:text-indigo-100">{stat.title}</CardTitle>
                <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.color}`}>
                  <stat.icon className="h-4 w-4 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">{stat.value}</div>
              <p className="text-xs text-indigo-500/70 dark:text-indigo-400/70">
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
            <TabsList className="grid w-full max-w-xs grid-cols-2 bg-indigo-100/50 dark:bg-indigo-800/20">
              <TabsTrigger value="recent" className="data-[state=active]:bg-indigo-500 data-[state=active]:text-white">Recent Links</TabsTrigger>
              <TabsTrigger value="top" className="data-[state=active]:bg-indigo-500 data-[state=active]:text-white">Top Links</TabsTrigger>
            </TabsList>
            <Button asChild variant="outline" size="sm" className="hidden sm:flex bg-white/80 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/40">
              <Link to="/dashboard/manage">
                <Eye className="mr-1.5 h-4 w-4" />
                View All Links
              </Link>
            </Button>
          </div>

          <Card className="border-none shadow-lg overflow-hidden bg-white/80 dark:bg-indigo-950/30 backdrop-blur-md">
            <TabsContent value="recent" className="mt-0">
              <CardHeader className="border-b pb-3 pt-4">
                <CardTitle className="text-base text-indigo-700 dark:text-indigo-300 flex items-center">
                  <Clock className="mr-2 h-4 w-4 text-indigo-500" />
                  Recently Created Links
                </CardTitle>
                <CardDescription className="text-indigo-500/70 dark:text-indigo-400/70">
                  Your 5 most recently created links
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <LinksTable links={recentLinks} emptyMessage="No links created yet" />
              </CardContent>
            </TabsContent>

            <TabsContent value="top" className="mt-0">
              <CardHeader className="border-b pb-3 pt-4">
                <CardTitle className="text-base text-indigo-700 dark:text-indigo-300 flex items-center">
                  <TrendingUp className="mr-2 h-4 w-4 text-indigo-500" />
                  Top Performing Links
                </CardTitle>
                <CardDescription className="text-indigo-500/70 dark:text-indigo-400/70">
                  Your most viewed links
                </CardDescription>
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
        <Card className="overflow-hidden border-none shadow-lg bg-white/80 dark:bg-indigo-950/30 backdrop-blur-md">
          <CardHeader className="border-b pb-3 bg-indigo-50/50 dark:bg-indigo-900/10">
            <CardTitle className="flex items-center text-base text-indigo-700 dark:text-indigo-300">
              <Activity className="mr-2 h-4 w-4 text-indigo-500" />
              Activity Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid gap-6 md:grid-cols-3">
              <div className="flex flex-col items-center justify-center rounded-xl border border-indigo-100 dark:border-indigo-800/30 bg-gradient-to-b from-white to-indigo-50/50 dark:from-indigo-900/20 dark:to-indigo-800/10 p-4 text-center shadow-sm">
                <Calendar className="mb-2 h-5 w-5 text-indigo-500" />
                <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300">Last 7 Days</p>
                <h4 className="text-2xl font-bold text-indigo-800 dark:text-indigo-200">{stats.totalViews}</h4>
                <p className="text-xs text-indigo-500/70 dark:text-indigo-400/70">Total views</p>
              </div>
              
              <div className="flex flex-col items-center justify-center rounded-xl border border-indigo-100 dark:border-indigo-800/30 bg-gradient-to-b from-white to-indigo-50/50 dark:from-indigo-900/20 dark:to-indigo-800/10 p-4 text-center shadow-sm">
                <TrendingUp className="mb-2 h-5 w-5 text-indigo-500" />
                <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300">Conversion</p>
                <h4 className="text-2xl font-bold text-indigo-800 dark:text-indigo-200">
                  {stats.totalLinks > 0 
                    ? `${Math.round((stats.totalViews / stats.totalLinks) * 10) / 10}` 
                    : "0"}
                </h4>
                <p className="text-xs text-indigo-500/70 dark:text-indigo-400/70">Avg views per link</p>
              </div>
              
              <div className="flex flex-col items-center justify-center rounded-xl border border-indigo-100 dark:border-indigo-800/30 bg-gradient-to-b from-white to-indigo-50/50 dark:from-indigo-900/20 dark:to-indigo-800/10 p-4 text-center shadow-sm">
                <Zap className="mb-2 h-5 w-5 text-indigo-500" />
                <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300">Insights</p>
                <h4 className="text-2xl font-bold text-indigo-800 dark:text-indigo-200">
                  {stats.publicLinks > stats.privateLinks ? "Public" : "Private"}
                </h4>
                <p className="text-xs text-indigo-500/70 dark:text-indigo-400/70">Preferred link type</p>
              </div>
            </div>
            
            {stats.totalLinks > 0 && (
              <div className="mt-6 flex items-center justify-center p-4 rounded-xl border border-indigo-100 dark:border-indigo-800/30 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
                <Lightbulb className="h-5 w-5 mr-3 text-amber-500" />
                <p className="text-sm text-indigo-700 dark:text-indigo-300">
                  <span className="font-medium">Pro tip:</span> {" "}
                  {stats.totalViews < 10 
                    ? "Share your links on social media to increase visibility." 
                    : stats.privateLinks === 0 
                      ? "Try creating password-protected links for sensitive content." 
                      : "Your link portfolio is growing nicely. Keep up the good work!"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Mobile View All Button */}
      <div className="mt-4 text-center sm:hidden">
        <Button asChild variant="outline" className="w-full bg-white/80 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/40">
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
            <TableRow className="hover:bg-transparent border-b border-indigo-100 dark:border-indigo-800/30">
              <TableHead className="text-indigo-600 dark:text-indigo-300">Name</TableHead>
              <TableHead className="hidden md:table-cell text-indigo-600 dark:text-indigo-300">Views</TableHead>
              <TableHead className="hidden md:table-cell text-indigo-600 dark:text-indigo-300">Created</TableHead>
              <TableHead className="text-right text-indigo-600 dark:text-indigo-300">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {links.map((link) => (
              <TableRow key={link.id} className="hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 border-b border-indigo-100 dark:border-indigo-800/30">
                <TableCell className="font-medium text-indigo-700 dark:text-indigo-300">
                  <div className="flex items-center gap-2">
                    {link.password ? (
                      <div className="p-1 rounded-full bg-indigo-100 dark:bg-indigo-800/30">
                        <Lock className="h-3 w-3 text-indigo-500" />
                      </div>
                    ) : (
                      <div className="p-1 rounded-full bg-indigo-100 dark:bg-indigo-800/30">
                        <Unlock className="h-3 w-3 text-indigo-500" />
                      </div>
                    )}
                    <span className="truncate max-w-[150px] md:max-w-[200px]">
                      {link.name}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell text-indigo-600/80 dark:text-indigo-400/80">
                  <div className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {link.views || 0}
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell text-indigo-600/80 dark:text-indigo-400/80">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(link.created_at).toLocaleDateString()}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    asChild
                    className="h-8 w-8 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-100 dark:text-indigo-400 dark:hover:text-indigo-300 dark:hover:bg-indigo-800/30"
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
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-800/30 flex items-center justify-center mb-4">
            <LinkIcon className="h-8 w-8 text-indigo-500" />
          </div>
          <p className="text-indigo-600 dark:text-indigo-400 mb-2">{emptyMessage}</p>
          <Link to="/dashboard/create">
            <Button variant="outline" className="mt-4 bg-white/80 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 border border-indigo-200 dark:border-indigo-800/30">
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
