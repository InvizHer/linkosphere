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
import { motion } from "framer-motion";
import { Link, Lock, Image, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
      const { data, error } = await supabase
        .from("links")
        .insert({
          name: formData.name,
          description: formData.description,
          original_url: formData.original_url,
          thumbnail_url: formData.thumbnail_url || null,
          password: formData.password || null,
          show_password: formData.show_password,
          user_id: user?.id,
        } as any)
        .select()
        .single();

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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto"
    >
      <Card className="bg-white/80 backdrop-blur-sm border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            <Link className="h-6 w-6" />
            Create New Link
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Link Name
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="bg-white/50 backdrop-blur-sm border-gray-200 focus:border-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Description
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-white/50 backdrop-blur-sm border-gray-200 focus:border-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="original_url" className="flex items-center gap-2">
                <Link className="h-4 w-4" />
                Original URL
              </Label>
              <Input
                id="original_url"
                type="url"
                value={formData.original_url}
                onChange={(e) => setFormData({ ...formData, original_url: e.target.value })}
                required
                className="bg-white/50 backdrop-blur-sm border-gray-200 focus:border-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="thumbnail_url" className="flex items-center gap-2">
                <Image className="h-4 w-4" />
                Thumbnail URL
              </Label>
              <Input
                id="thumbnail_url"
                type="url"
                value={formData.thumbnail_url}
                onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                className="bg-white/50 backdrop-blur-sm border-gray-200 focus:border-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Password Protection
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="bg-white/50 backdrop-blur-sm border-gray-200 focus:border-primary"
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

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
            >
              Create Link
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default CreateLink;