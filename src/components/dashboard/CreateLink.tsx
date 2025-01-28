import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";

const CreateLink = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    original_url: "",
    thumbnail_url: "",
    password: "",
    show_password: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase.from("links").insert([
        {
          ...formData,
          user_id: user?.id,
        },
      ]).select().single();

      if (error) throw error;

      toast({
        title: "Link Created",
        description: "Your link has been created successfully",
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
      <div className="space-y-2">
        <Label htmlFor="name">Link Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="original_url">Original URL</Label>
        <Input
          id="original_url"
          type="url"
          value={formData.original_url}
          onChange={(e) => setFormData({ ...formData, original_url: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="thumbnail_url">Thumbnail URL</Label>
        <Input
          id="thumbnail_url"
          type="url"
          value={formData.thumbnail_url}
          onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password Protection</Label>
        <Input
          id="password"
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="show_password"
          checked={formData.show_password}
          onCheckedChange={(checked) =>
            setFormData({ ...formData, show_password: checked })
          }
        />
        <Label htmlFor="show_password">Show password to visitors</Label>
      </div>

      <Button type="submit" className="w-full">
        Create Link
      </Button>
    </form>
  );
};

export default CreateLink;