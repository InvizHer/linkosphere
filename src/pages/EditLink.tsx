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
import { ArrowLeft, Trash2 } from "lucide-react";

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
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
          Delete Link
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) =>
              setFormData({
                ...formData,
                name: e.target.value,
              })
            }
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) =>
              setFormData({
                ...formData,
                description: e.target.value,
              })
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="original_url">Original URL</Label>
          <Input
            id="original_url"
            type="url"
            value={formData.original_url}
            onChange={(e) =>
              setFormData({
                ...formData,
                original_url: e.target.value,
              })
            }
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="thumbnail_url">Thumbnail URL</Label>
          {formData.thumbnail_url && (
            <div className="mb-2">
              <img
                src={formData.thumbnail_url}
                alt="Thumbnail preview"
                className="max-w-xs rounded-lg border"
              />
            </div>
          )}
          <Input
            id="thumbnail_url"
            type="url"
            value={formData.thumbnail_url}
            onChange={(e) =>
              setFormData({
                ...formData,
                thumbnail_url: e.target.value,
              })
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) =>
              setFormData({
                ...formData,
                password: e.target.value,
              })
            }
          />
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="show_password"
            checked={formData.show_password}
            onCheckedChange={(checked) =>
              setFormData({
                ...formData,
                show_password: checked,
              })
            }
          />
          <Label htmlFor="show_password">Show password to visitors</Label>
        </div>

        <Button type="submit" className="w-full">
          Save Changes
        </Button>
      </form>
    </div>
  );
};

export default EditLink;