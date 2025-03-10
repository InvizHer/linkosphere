
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
  Link as LinkIcon,
  Eye,
  PlusCircle,
  Clock,
  TrendingUp,
  Lock,
  Unlock,
  Calendar,
  Zap,
  Share2,
  Sparkles,
  Lightbulb,
  BarChart2,
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
                {stats.totalLinks === 0 
                  ? "Create your first link to get started!" 
                  : stats.totalViews === 0 
                    ? "Your links are waiting to be discovered!" 
                    : "Manage and track your links in one place."}
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
        {[
          { title: "Total Links", icon: LinkIcon, value: stats.totalLinks, color: "from-indigo-500 to-indigo-600" },
          { title: "Total Views", icon: Eye, value: stats.totalViews, color: "from-purple-500 to-purple-600" },
          { title: "Private Links", icon: Lock, value: stats.privateLinks, color: "from-violet-500 to-violet-600" },
          { title: "Public Links", icon: Unlock, value: stats.publicLinks, color: "from-fuchsia-500 to-fuchsia-600" },
        ].map((stat, index) => (
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

      {/* Redesigned Links Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="rounded-xl overflow-hidden shadow-lg border border-indigo-100/50 dark:border-indigo-800/30 bg-white/90 dark:bg-indigo-950/20 backdrop-blur-md"
      >
        <Tabs defaultValue="recent" className="w-full">
          <div className="flex items-center justify-between p-4 border-b border-indigo-100 dark:border-indigo-800/30">
            <h2 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Your Links
            </h2>
            <TabsList className="grid w-full max-w-[200px] grid-cols-2 bg-indigo-100/80 dark:bg-indigo-800/30">
              <TabsTrigger value="recent" className="data-[state=active]:bg-indigo-500 data-[state=active]:text-white">
                <Clock className="mr-2 h-4 w-4" /> Recent
              </TabsTrigger>
              <TabsTrigger value="top" className="data-[state=active]:bg-indigo-500 data-[state=active]:text-white">
                <TrendingUp className="mr-2 h-4 w-4" /> Top
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="recent" className="p-0 m-0">
            <div className="p-4">
              {recentLinks.length > 0 ? (
                <ul className="space-y-3">
                  {recentLinks.map((link) => (
                    <LinkCard key={link.id} link={link} />
                  ))}
                </ul>
              ) : (
                <EmptyState
                  message="No links created yet"
                  buttonText="Create your first link"
                  buttonLink="/dashboard/create"
                />
              )}
            </div>
          </TabsContent>

          <TabsContent value="top" className="p-0 m-0">
            <div className="p-4">
              {topLinks.length > 0 ? (
                <ul className="space-y-3">
                  {topLinks.map((link) => (
                    <LinkCard key={link.id} link={link} showViews />
                  ))}
                </ul>
              ) : (
                <EmptyState
                  message="No link views yet"
                  buttonText="Create your first link"
                  buttonLink="/dashboard/create"
                />
              )}
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* New Insights Section (replacing Activity Summary) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="rounded-xl overflow-hidden shadow-lg border border-indigo-100/50 dark:border-indigo-800/30 bg-white/90 dark:bg-indigo-950/20 backdrop-blur-md"
      >
        <div className="p-4 border-b border-indigo-100 dark:border-indigo-800/30">
          <h2 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center">
            <Zap className="mr-2 h-5 w-5 text-indigo-500" /> Insights & Tips
          </h2>
        </div>
        
        <div className="p-4 grid gap-4 md:grid-cols-3">
          <InsightCard 
            icon={<Eye className="h-10 w-10 text-indigo-400" />}
            title="Visibility"
            content={
              stats.totalLinks === 0 
                ? "Create links to start tracking views" 
                : `On average, each link gets ${Math.round((stats.totalViews / stats.totalLinks) * 10) / 10} views`
            }
          />
          
          <InsightCard 
            icon={<Lightbulb className="h-10 w-10 text-amber-400" />}
            title="Pro Tip"
            content={
              stats.totalLinks === 0 
                ? "Password-protect links for sensitive content" 
                : stats.privateLinks === 0 
                  ? "Try creating password-protected links for security" 
                  : "Add descriptions to links for better context"
            }
            highlight
          />
          
          <InsightCard 
            icon={<TrendingUp className="h-10 w-10 text-emerald-400" />}
            title="Growth"
            content={
              stats.totalLinks === 0 
                ? "Share links on social media for more views" 
                : stats.totalViews < 10 
                  ? "Share your links to increase visibility" 
                  : "Your link portfolio is growing well!"
            }
          />
        </div>
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

// New Link Card component
const LinkCard = ({ link, showViews = false }: { link: any; showViews?: boolean }) => {
  return (
    <motion.li
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="relative group p-3 bg-white dark:bg-indigo-900/20 rounded-lg border border-indigo-100 dark:border-indigo-800/20 shadow-sm hover:shadow-md transition-all"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/10 dark:to-purple-900/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg pointer-events-none"></div>
      
      <div className="relative flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-800/30 text-indigo-600 dark:text-indigo-300">
            {link.password ? (
              <Lock className="h-4 w-4" />
            ) : (
              <LinkIcon className="h-4 w-4" />
            )}
          </div>
          
          <div className="flex flex-col">
            <span className="font-medium text-indigo-800 dark:text-indigo-200 truncate max-w-[200px]">
              {link.name}
            </span>
            <div className="flex items-center gap-2 text-xs text-indigo-500 dark:text-indigo-400">
              <Calendar className="h-3 w-3" />
              <span>{new Date(link.created_at).toLocaleDateString()}</span>
              
              {showViews && (
                <>
                  <span className="h-1 w-1 rounded-full bg-indigo-300 dark:bg-indigo-700"></span>
                  <Eye className="h-3 w-3" />
                  <span>{link.views || 0} views</span>
                </>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon"
            asChild
            className="h-8 w-8 text-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-800/30"
          >
            <Link to={`/dashboard/edit/${link.id}`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
            </Link>
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon"
            asChild
            className="h-8 w-8 text-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-800/30"
          >
            <Link to={`/view?token=${link.token}`} target="_blank">
              <Share2 className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </motion.li>
  );
};

// Empty state component
const EmptyState = ({ message, buttonText, buttonLink }: { message: string; buttonText: string; buttonLink: string }) => {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-800/30 flex items-center justify-center mb-4">
        <LinkIcon className="h-8 w-8 text-indigo-500" />
      </div>
      <p className="text-indigo-700 dark:text-indigo-300 mb-4">{message}</p>
      <Link to={buttonLink}>
        <Button>
          <PlusCircle className="mr-1.5 h-4 w-4" />
          {buttonText}
        </Button>
      </Link>
    </div>
  );
};

// Insight card component
const InsightCard = ({ icon, title, content, highlight = false }: { 
  icon: React.ReactNode; 
  title: string; 
  content: string;
  highlight?: boolean;
}) => {
  return (
    <div className={`p-4 rounded-xl border ${
      highlight 
        ? 'border-amber-200 dark:border-amber-900/30 bg-amber-50/50 dark:bg-amber-900/10' 
        : 'border-indigo-100 dark:border-indigo-800/30 bg-white dark:bg-indigo-900/10'
    }`}>
      <div className="flex flex-col items-center text-center">
        <div className="mb-3">{icon}</div>
        <h3 className="font-semibold text-indigo-800 dark:text-indigo-200 mb-1">{title}</h3>
        <p className="text-sm text-indigo-600 dark:text-indigo-300">{content}</p>
      </div>
    </div>
  );
};

export default DashboardHome;
