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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  User,
  Mail,
  Key,
  LogOut,
  Camera,
  Shield,
  Settings,
  UserCircle,
  Edit,
} from "lucide-react";

const Profile = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
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
      className="max-w-4xl mx-auto px-4 py-8"
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="relative h-48 bg-gradient-to-r from-primary/20 to-accent/20">
          <div className="absolute -bottom-16 left-8">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="relative group"
            >
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-accent p-1">
                <div className="w-full h-full rounded-full bg-white dark:bg-gray-900 flex items-center justify-center overflow-hidden">
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UserCircle className="w-20 h-20 text-primary" />
                  )}
                </div>
              </div>
              <button className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                <Camera className="w-6 h-6 text-white" />
              </button>
            </motion.div>
          </div>
        </div>

        <div className="pt-20 px-8 pb-8">
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {profile.username}
                </h1>
                <p className="text-gray-500">{user?.email}</p>
              </div>
              <Button
                variant="outline"
                onClick={() => signOut()}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    Profile Information
                  </h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditMode(!editMode)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-gray-500">Username</Label>
                    <Input
                      value={formData.username}
                      onChange={(e) =>
                        setFormData({ ...formData, username: e.target.value })
                      }
                      disabled={!editMode}
                      className="bg-gray-50 dark:bg-gray-900"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-500">Email</Label>
                    <Input
                      type="email"
                      value={user?.email}
                      disabled
                      className="bg-gray-50 dark:bg-gray-900"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Security
                </h2>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <Key className="h-4 w-4 mr-2" />
                      Change Password
                    </Button>
                  </DialogTrigger>
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Profile;
