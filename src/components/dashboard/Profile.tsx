import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mail, Key, Camera, UserCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const Profile = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      setProfile(data);
      setFormData((prev) => ({ ...prev, username: data.username }));
      setLoading(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ username: formData.username })
        .eq("id", user!.id);

      if (error) throw error;

      await fetchProfile();
      setEditMode(false);
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: formData.newPassword,
      });

      if (error) throw error;

      setFormData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
      setShowPasswordDialog(false);

      toast({
        title: "Success",
        description: "Password updated successfully",
      });
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container max-w-4xl mx-auto px-4 py-8"
    >
      <Card className="bg-card">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-4">
            <div className="relative group">
              <Avatar className="h-20 w-20">
                {profile.avatar_url ? (
                  <AvatarImage src={profile.avatar_url} alt={profile.username} />
                ) : (
                  <AvatarFallback className="bg-primary/10">
                    <UserCircle className="w-12 h-12 text-primary" />
                  </AvatarFallback>
                )}
                <button className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                  <Camera className="w-6 h-6 text-white" />
                </button>
              </Avatar>
            </div>
            <div className="space-y-1">
              <CardTitle className="text-2xl">{profile.username}</CardTitle>
              <CardDescription>{user?.email}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <Separator className="my-4" />
          
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  Email Address
                </Label>
                <Input
                  type="email"
                  value={user?.email}
                  disabled
                  className="bg-muted"
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-muted-foreground">
                  <UserCircle className="h-4 w-4" />
                  Username
                </Label>
                <div className="flex gap-2">
                  <Input
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    disabled={!editMode}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditMode(!editMode)}
                    className="shrink-0"
                  >
                    {editMode ? "Cancel" : "Edit"}
                  </Button>
                </div>
              </div>
            </div>

            {editMode && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Button type="submit">Save Changes</Button>
              </motion.div>
            )}
          </form>

          <Separator className="my-4" />

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Security Settings</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowPasswordDialog(true)}
              >
                <Key className="h-4 w-4 mr-2" />
                Change Password
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div className="space-y-2">
              <Label>New Password</Label>
              <Input
                type="password"
                value={formData.newPassword}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    newPassword: e.target.value,
                  })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Confirm Password</Label>
              <Input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    confirmPassword: e.target.value,
                  })
                }
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Update Password
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default Profile;