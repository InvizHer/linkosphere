
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Link as LinkIcon, Save, Trash2, ArrowLeft, Eye, Calendar, Clock, ExternalLink, Shield, ChevronRight, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const EditLink = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [link, setLink] = useState<any>(null);
  const [viewStats, setViewStats] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (user) {
      fetchLink();
      fetchLinkStats();
    }
  }, [user, id]);

  const fetchLink = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("links")
        .select("*")
        .eq("id", id)
        .eq("user_id", user?.id)
        .single();

      if (error) throw error;

      setLink(data);
      setName(data.name);
      setDescription(data.description || "");
      setPassword(data.password || "");
      setShowPassword(data.show_password || false);
      setLoading(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      navigate("/dashboard/manage");
    }
  };

  const fetchLinkStats = async () => {
    try {
      // Get view timestamps from link_views table
      const { data: viewsData, error: viewsError } = await supabase
        .from("link_views")
        .select("viewed_at")
        .eq("link_id", id)
        .order("viewed_at", { ascending: false });

      if (viewsError) throw viewsError;

      // Process the data to create a chart dataset - group by day
      const statsMap = new Map();
      
      // If no views data, create an empty dataset
      if (!viewsData || viewsData.length === 0) {
        // Create empty dataset for the last 7 days
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const formattedDate = date.toISOString().split('T')[0];
          last7Days.push({ date: formattedDate, views: 0 });
        }
        setViewStats(last7Days);
        return;
      }

      // Create a map of dates and count views
      viewsData.forEach((view) => {
        if (view.viewed_at) {
          const date = new Date(view.viewed_at).toISOString().split('T')[0];
          statsMap.set(date, (statsMap.get(date) || 0) + 1);
        }
      });

      // Convert map to array and sort by date
      const processedStats = Array.from(statsMap, ([date, views]) => ({ date, views }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(-7); // Get the last 7 days of data

      setViewStats(processedStats);
    } catch (error: any) {
      console.error("Error fetching link stats:", error);
      // Don't show toast for stats error, just continue with the form
    }
  };

  const handleUpdateLink = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name) {
      toast({
        title: "Error",
        description: "Link name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);
      
      const { error } = await supabase
        .from("links")
        .update({
          name,
          description,
          password,
          show_password: showPassword,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .eq("user_id", user?.id);

      if (error) throw error;

      setSaving(false);
      toast({
        title: "Success",
        description: "Link updated successfully",
      });
      
      // Refresh link data
      fetchLink();
    } catch (error: any) {
      setSaving(false);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteLink = async () => {
    if (!window.confirm("Are you sure you want to delete this link? This action cannot be undone.")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("links")
        .delete()
        .eq("id", id)
        .eq("user_id", user?.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Link deleted successfully",
      });
      navigate("/dashboard/manage");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = () => {
    if (!link) return;
    
    const linkUrl = `${window.location.origin}/l/${link.token}`;
    navigator.clipboard.writeText(linkUrl);
    setCopied(true);
    
    toast({
      title: "Link copied",
      description: "Link copied to clipboard",
    });
    
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex flex-col space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-36 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  // Format created date
  const formattedDate = link?.created_at 
    ? new Date(link.created_at).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : '';

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl mb-24">
      <Button
        variant="ghost"
        className="mb-6 hover:bg-slate-100"
        onClick={() => navigate("/dashboard/manage")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Link Management
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
        <div className="lg:col-span-4">
          <Card className="shadow-md border border-gray-100 dark:border-gray-800 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-800/80 pb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-primary/10">
                    <LinkIcon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-semibold">Edit Link</CardTitle>
                    <CardDescription>Update your link settings and details</CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleUpdateLink} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="name">Link Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="My Link Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Input
                    id="description"
                    type="text"
                    placeholder="What's this link for?"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="original_url">Original URL</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="original_url"
                      type="text"
                      value={link.original_url}
                      readOnly
                      className="bg-gray-50"
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="icon"
                      onClick={() => window.open(link.original_url, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="token">Short Link</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="token"
                      type="text"
                      value={`${window.location.origin}/l/${link.token}`}
                      readOnly
                      className="bg-gray-50"
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="icon"
                      onClick={copyToClipboard}
                    >
                      <Copy className={`h-4 w-4 ${copied ? 'text-green-500' : ''}`} />
                    </Button>
                  </div>
                </div>
                
                <div className="pt-2 border-t">
                  <div className="flex items-center mb-4">
                    <Shield className="h-5 w-5 text-orange-500 mr-2" />
                    <h3 className="text-sm font-medium">Password Protection</h3>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Password (Optional)</Label>
                    <Input
                      id="password"
                      type="text"
                      placeholder="Leave empty for no password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <p className="text-xs text-gray-500">
                      Add a password to restrict access to your link.
                    </p>
                  </div>
                  
                  <div className="mt-3 flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="showPassword"
                      checked={showPassword}
                      onChange={(e) => setShowPassword(e.target.checked)}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <Label htmlFor="showPassword" className="text-sm font-normal">
                      Show password field on link page
                    </Label>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-4 gap-4">
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={handleDeleteLink}
                    className="flex-1 max-w-[150px] sm:max-w-none"
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={saving}
                    className="flex-1"
                  >
                    {saving ? (
                      <>Saving...</>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" /> Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3 space-y-6">
          <Card className="shadow-md border border-gray-100 dark:border-gray-800 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700/80 pb-4">
              <CardTitle className="text-lg font-semibold">Link Statistics</CardTitle>
              <CardDescription>Real-time performance data</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-primary/5 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500">Total Views</p>
                      <h3 className="text-2xl font-bold">{link.views || 0}</h3>
                    </div>
                    <div className="p-2 rounded-full bg-primary/10">
                      <Eye className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                </div>
                <div className="bg-primary/5 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500">Created On</p>
                      <h3 className="text-sm font-medium">{formattedDate}</h3>
                    </div>
                    <div className="p-2 rounded-full bg-primary/10">
                      <Calendar className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 mb-4">
                <h3 className="text-sm font-medium mb-2">Views (Last 7 days)</h3>
                <div className="h-[200px]">
                  {viewStats.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={viewStats}
                        margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fontSize: 10 }}
                          tickFormatter={(date) => {
                            const d = new Date(date);
                            return `${d.getMonth() + 1}/${d.getDate()}`;
                          }}
                        />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip 
                          formatter={(value: any) => [`${value} views`, 'Views']}
                          labelFormatter={(label) => {
                            const date = new Date(label);
                            return date.toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            });
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="views"
                          stroke="#2563eb"
                          strokeWidth={2}
                          dot={{ r: 2 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-gray-500 text-sm">No view data available</p>
                    </div>
                  )}
                </div>
              </div>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => window.open(`/l/${link.token}`, '_blank')}
              >
                <ExternalLink className="mr-2 h-4 w-4" /> Visit Your Link
              </Button>
            </CardContent>
          </Card>
          
          <Card className="shadow-md border border-gray-100 dark:border-gray-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold">Need Help?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                Having trouble with your link settings? Check out our tips:
              </p>
              <div className="space-y-2">
                <div className="flex">
                  <ChevronRight className="h-4 w-4 text-primary mr-2 mt-0.5" />
                  <p className="text-sm">Use a descriptive link name for easy identification</p>
                </div>
                <div className="flex">
                  <ChevronRight className="h-4 w-4 text-primary mr-2 mt-0.5" />
                  <p className="text-sm">Add a password for sensitive content</p>
                </div>
                <div className="flex">
                  <ChevronRight className="h-4 w-4 text-primary mr-2 mt-0.5" />
                  <p className="text-sm">Track views to measure link performance</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EditLink;
