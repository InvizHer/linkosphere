
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Trash2,
  Eye,
  Calendar,
  Link as LinkIcon,
  Clock,
  Lock,
  ExternalLink,
  Info,
  BarChart2,
  Image,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const EditLink = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    original_url: "",
    thumbnail_url: "",
    password: "",
    show_password: false,
  });
  const [stats, setStats] = useState({
    views: 0,
    created_at: "",
    updated_at: "",
  });

  useEffect(() => {
    fetchLink();
  }, [token]);

  const fetchLink = async () => {
    try {
      if (!token) {
        toast({
          title: "Error",
          description: "No token provided",
          variant: "destructive",
        });
        navigate("/dashboard/manage");
        return;
      }

      const { data, error } = await supabase
        .from("links")
        .select("*")
        .eq("token", token)
        .eq("user_id", user?.id)
        .single();

      if (error) throw error;

      if (!data) {
        toast({
          title: "Error",
          description: "Link not found",
          variant: "destructive",
        });
        navigate("/dashboard/manage");
        return;
      }

      setFormData({
        name: data.name,
        description: data.description || "",
        original_url: data.original_url,
        thumbnail_url: data.thumbnail_url || "",
        password: data.password || "",
        show_password: data.show_password || false,
      });

      setStats({
        views: data.views || 0,
        created_at: data.created_at,
        updated_at: data.updated_at,
      });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from("links")
        .update({
          name: formData.name,
          description: formData.description,
          original_url: formData.original_url,
          thumbnail_url: formData.thumbnail_url,
          password: formData.password,
          show_password: formData.show_password,
        })
        .eq("token", token)
        .eq("user_id", user?.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Link updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this link?")) return;

    try {
      const { error } = await supabase
        .from("links")
        .delete()
        .eq("token", token)
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6 mb-20">
      <div className="flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-sm z-10 py-2">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard/manage")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Links
        </Button>
        <Button
          variant="destructive"
          onClick={handleDelete}
          className="flex items-center gap-2"
        >
          <Trash2 className="h-4 w-4" />
          <span className="hidden sm:inline">Delete Link</span>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Stats Cards */}
        <Card className="md:col-span-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <BarChart2 className="h-5 w-5" />
              Link Statistics
            </CardTitle>
            <CardDescription>Overview of your link's performance</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
            <div className="flex items-center gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-900/50">
              <Eye className="h-8 w-8 text-primary shrink-0" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Views</p>
                <p className="text-2xl font-bold">{stats.views}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-900/50">
              <Calendar className="h-8 w-8 text-primary shrink-0" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Created</p>
                <p className="text-sm font-medium">
                  {new Date(stats.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-900/50">
              <Clock className="h-8 w-8 text-primary shrink-0" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Updated</p>
                <p className="text-sm font-medium">
                  {new Date(stats.updated_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-900/50">
              <LinkIcon className="h-8 w-8 text-primary shrink-0" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Token</p>
                <p className="text-sm font-medium">{token}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:col-span-2 space-y-6"
        >
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Edit Link Details</CardTitle>
              <CardDescription>
                Update your link's information below
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="bg-white/50 dark:bg-gray-900/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="bg-white/50 dark:bg-gray-900/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="original_url">Original URL</Label>
                  <Input
                    id="original_url"
                    value={formData.original_url}
                    onChange={(e) =>
                      setFormData({ ...formData, original_url: e.target.value })
                    }
                    className="bg-white/50 dark:bg-gray-900/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="thumbnail_url">Thumbnail URL</Label>
                  <Input
                    id="thumbnail_url"
                    value={formData.thumbnail_url}
                    onChange={(e) =>
                      setFormData({ ...formData, thumbnail_url: e.target.value })
                    }
                    className="bg-white/50 dark:bg-gray-900/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password Protection</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      className="bg-white/50 dark:bg-gray-900/50"
                    />
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Lock className="h-4 w-4 text-gray-500" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Optional password protection for your link</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    id="show_password"
                    checked={formData.show_password}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, show_password: checked })
                    }
                  />
                  <Label htmlFor="show_password">Show password field</Label>
                </div>

                <Button type="submit" className="w-full">
                  Update Link
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default EditLink;
