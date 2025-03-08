
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Pencil,
  ExternalLink,
  Globe,
  Zap,
  Bookmark,
  ChevronRight
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
    { title: "Total Links", icon: LinkIcon, value: stats.totalLinks, color: "bg-blue-500" },
    { title: "Total Views", icon: Eye, value: stats.totalViews, color: "bg-green-500" },
    { title: "Private Links", icon: Lock, value: stats.privateLinks, color: "bg-purple-500" },
    { title: "Public Links", icon: Unlock, value: stats.publicLinks, color: "bg-amber-500" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
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
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/80 via-primary/70 to-primary/80 text-white shadow-xl"
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
          <Card key={stat.title} className="overflow-hidden border-none shadow-md">
            <div className={`h-1 ${stat.color}`}></div>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className={`h-4 w-4 text-gray-400`} />
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

      {/* Links Tabs with New Design */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <Tabs defaultValue="recent" className="w-full">
          <div className="flex items-center justify-between mb-6">
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

          <TabsContent value="recent">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentLinks.length > 0 ? (
                recentLinks.map((link) => (
                  <LinkCard key={link.id} link={link} />
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                  <LinkIcon className="mb-4 h-12 w-12 text-muted-foreground/50" />
                  <h3 className="text-lg font-medium mb-2">No links created yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">Create your first link to get started</p>
                  <Button asChild>
                    <Link to="/dashboard/create">
                      <PlusCircle className="mr-1.5 h-4 w-4" />
                      Create Link
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="top">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {topLinks.length > 0 ? (
                topLinks.map((link) => (
                  <LinkCard key={link.id} link={link} />
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                  <BarChart2 className="mb-4 h-12 w-12 text-muted-foreground/50" />
                  <h3 className="text-lg font-medium mb-2">No link views yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">Share your links to start collecting views</p>
                  <Button asChild>
                    <Link to="/dashboard/manage">
                      <LinkIcon className="mr-1.5 h-4 w-4" />
                      Manage Links
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Quick Tips Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <Card className="overflow-hidden border shadow-sm">
          <CardHeader className="border-b bg-muted/50 pb-3">
            <CardTitle className="flex items-center text-base">
              <Zap className="mr-2 h-4 w-4 text-primary" />
              Quick Tips & Resources
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid gap-6 md:grid-cols-3">
              <div className="flex flex-col items-center justify-center rounded-lg border bg-card p-4 text-center shadow-sm hover:bg-muted/50 transition-colors">
                <Globe className="mb-2 h-5 w-5 text-primary" />
                <p className="text-sm font-medium">Link Optimization</p>
                <p className="text-xs text-muted-foreground mt-2">Add descriptive names to your links for better recognition</p>
              </div>
              
              <div className="flex flex-col items-center justify-center rounded-lg border bg-card p-4 text-center shadow-sm hover:bg-muted/50 transition-colors">
                <Bookmark className="mb-2 h-5 w-5 text-primary" />
                <p className="text-sm font-medium">Protect Sensitive Content</p>
                <p className="text-xs text-muted-foreground mt-2">Use password protection for links with sensitive information</p>
              </div>
              
              <div className="flex flex-col items-center justify-center rounded-lg border bg-card p-4 text-center shadow-sm hover:bg-muted/50 transition-colors">
                <TrendingUp className="mb-2 h-5 w-5 text-primary" />
                <p className="text-sm font-medium">Track Performance</p>
                <p className="text-xs text-muted-foreground mt-2">Check your statistics page regularly to monitor link engagement</p>
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

// Link Card Component
const LinkCard = ({ link }: { link: any }) => {
  const formattedDate = new Date(link.created_at).toLocaleDateString();
  
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardHeader className="pb-3 pt-4">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <CardTitle className="text-base line-clamp-1">{link.name}</CardTitle>
            <CardDescription className="line-clamp-1 text-xs">
              /{link.token}
            </CardDescription>
          </div>
          <Badge variant={link.password ? "destructive" : "secondary"} className="h-5 flex items-center gap-1">
            {link.password ? (
              <>
                <Lock className="h-3 w-3" /> Private
              </>
            ) : (
              <>
                <Unlock className="h-3 w-3" /> Public
              </>
            )}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-3 pt-0">
        <div className="flex items-center gap-2 text-sm">
          <div className="flex items-center text-muted-foreground">
            <Eye className="mr-1 h-3.5 w-3.5" />
            <span>{link.views || 0} views</span>
          </div>
          <span className="text-muted-foreground">•</span>
          <div className="flex items-center text-muted-foreground">
            <Calendar className="mr-1 h-3.5 w-3.5" />
            <span>{formattedDate}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-0 pb-4 flex justify-between">
        <Button 
          variant="ghost" 
          size="sm" 
          asChild 
          className="h-8 px-2 text-xs"
        >
          <Link to={`/view?token=${link.token}`} target="_blank">
            <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
            Open
          </Link>
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          asChild 
          className="h-8 px-2 text-xs"
        >
          <Link to={`/dashboard/edit/${link.id}`}>
            <Pencil className="mr-1.5 h-3.5 w-3.5" />
            Edit
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DashboardHome;
