
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Link as LinkIcon,
  Eye,
  PlusCircle,
  Clock,
  TrendingUp,
  Activity,
  Lock,
  Unlock,
  Share2,
  Sparkles,
  Edit2,
  ExternalLink,
  CalendarDays,
  Lightbulb,
  ChevronRight,
  Copy,
} from "lucide-react";

const DashboardHome = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
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
    { title: "Total Links", icon: LinkIcon, value: stats.totalLinks, color: "bg-indigo-500", description: "Links created" },
    { title: "Total Views", icon: Eye, value: stats.totalViews, color: "bg-purple-500", description: "Combined views" },
    { title: "Private Links", icon: Lock, value: stats.privateLinks, color: "bg-pink-500", description: "Password protected" },
    { title: "Public Links", icon: Unlock, value: stats.publicLinks, color: "bg-blue-500", description: "Publicly accessible" },
  ];

  const quickTips = [
    { title: "Password Protection", description: "Secure important links with a password", icon: Lock },
    { title: "Track Metrics", description: "Monitor views to optimize your links", icon: TrendingUp },
    { title: "Regular Updates", description: "Keep your links fresh and relevant", icon: Activity },
  ];

  const copyLinkToClipboard = (link: any) => {
    const url = `${window.location.origin}/view?token=${link.token}`;
    navigator.clipboard.writeText(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin"></div>
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
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-600 text-white shadow-xl"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/10 to-transparent"></div>
        <div className="absolute -right-10 -top-10 h-56 w-56 rounded-full bg-purple-400/20 blur-3xl"></div>
        <div className="absolute -bottom-5 -left-5 h-32 w-32 rounded-full bg-indigo-300/20 blur-xl"></div>
        
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
                  <Activity className="mr-1.5 h-4 w-4" />
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
          <Card key={stat.title} className="overflow-hidden border-none shadow-md bg-white dark:bg-gray-800 hover:shadow-lg transition-shadow">
            <div className={`h-1 ${stat.color}`}></div>
            <CardHeader className="pb-2 pt-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <div className={`p-2 rounded-full ${stat.color.replace('bg-', 'bg-')}/10`}>
                  <stat.icon className={`h-4 w-4 ${stat.color.replace('bg-', 'text-')}`} />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
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
            <TabsList className="grid w-full max-w-xs grid-cols-2 bg-indigo-50 dark:bg-gray-800/50 p-1">
              <TabsTrigger value="recent" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800">Recent Links</TabsTrigger>
              <TabsTrigger value="top" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800">Top Links</TabsTrigger>
            </TabsList>
            <Button asChild variant="outline" size="sm" className="hidden sm:flex">
              <Link to="/dashboard/manage">
                <Eye className="mr-1.5 h-4 w-4" />
                View All Links
              </Link>
            </Button>
          </div>

          <Card className="border-none shadow-lg overflow-hidden bg-white dark:bg-gray-800">
            <TabsContent value="recent" className="mt-0">
              <CardHeader className="border-b pb-3 pt-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="h-4 w-4 text-indigo-500" />
                  Recently Created Links
                </CardTitle>
                <CardDescription>Your 5 most recently created links</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {recentLinks.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
                    {recentLinks.map((link) => (
                      <LinkCard 
                        key={link.id} 
                        link={link} 
                        onCopy={() => copyLinkToClipboard(link)}
                        onEdit={() => navigate(`/dashboard/edit/${link.id}`)}
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyLinkState message="No links created yet" />
                )}
              </CardContent>
            </TabsContent>

            <TabsContent value="top" className="mt-0">
              <CardHeader className="border-b pb-3 pt-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-purple-500" />
                  Top Performing Links
                </CardTitle>
                <CardDescription>Your most viewed links</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {topLinks.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
                    {topLinks.map((link) => (
                      <LinkCard 
                        key={link.id} 
                        link={link} 
                        onCopy={() => copyLinkToClipboard(link)}
                        onEdit={() => navigate(`/dashboard/edit/${link.id}`)}
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyLinkState message="No link views yet" />
                )}
              </CardContent>
            </TabsContent>
          </Card>
        </Tabs>
      </motion.div>

      {/* Quick Tips Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <Card className="overflow-hidden border-none shadow-lg bg-white dark:bg-gray-800">
          <CardHeader className="border-b bg-indigo-50/50 dark:bg-gray-800/80 pb-3">
            <CardTitle className="flex items-center text-base">
              <Lightbulb className="mr-2 h-4 w-4 text-amber-500" />
              Quick Tips
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid gap-6 md:grid-cols-3">
              {quickTips.map((tip, index) => (
                <div 
                  key={index} 
                  className="flex flex-col items-start rounded-lg border border-indigo-100 dark:border-gray-700 bg-card p-4 hover:bg-indigo-50/50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="mb-3 rounded-full bg-indigo-100 dark:bg-gray-700 p-2">
                    <tip.icon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h4 className="text-sm font-medium">{tip.title}</h4>
                  <p className="mt-1 text-xs text-muted-foreground">{tip.description}</p>
                </div>
              ))}
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

// Link card component
const LinkCard = ({ link, onCopy, onEdit }: { link: any, onCopy: () => void, onEdit: () => void }) => {
  return (
    <div className="bg-white dark:bg-gray-800/80 rounded-lg border border-indigo-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition-all group">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-100 dark:bg-gray-700 p-1.5 rounded-full">
              {link.password ? (
                <Lock className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
              ) : (
                <Unlock className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
              )}
            </div>
            <h3 className="font-medium text-sm truncate max-w-[150px]">{link.name}</h3>
          </div>
          <div className="flex items-center gap-1">
            <Eye className="h-3.5 w-3.5 text-gray-500" />
            <span className="text-xs text-gray-500">{link.views || 0}</span>
          </div>
        </div>
        
        <div className="bg-indigo-50 dark:bg-gray-700/50 rounded p-2 mb-3">
          <div className="flex items-center text-xs text-indigo-800 dark:text-indigo-300 font-mono truncate">
            <span className="opacity-70 mr-1">/{link.token}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <CalendarDays className="h-3 w-3" />
            {new Date(link.created_at).toLocaleDateString()}
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={onEdit}
              className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
              title="Edit"
            >
              <Edit2 className="h-3.5 w-3.5 text-indigo-600" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => window.open(`/view?token=${link.token}`, '_blank')}
              className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
              title="Open"
            >
              <ExternalLink className="h-3.5 w-3.5 text-indigo-600" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={onCopy}
              className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
              title="Copy"
            >
              <Copy className="h-3.5 w-3.5 text-indigo-600" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Empty state component
const EmptyLinkState = ({ message }: { message: string }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
      <LinkIcon className="mb-2 h-8 w-8 text-indigo-300" />
      <p>{message}</p>
      <Link to="/dashboard/create">
        <Button variant="outline" className="mt-4">
          <PlusCircle className="mr-1.5 h-4 w-4" />
          Create your first link
        </Button>
      </Link>
    </div>
  );
};

export default DashboardHome;
