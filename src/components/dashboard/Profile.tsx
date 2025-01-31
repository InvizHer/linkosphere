import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
  Trash2,
  Camera,
  Shield,
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

  const handleDeleteAccount = async () => {
    try {
      const { error } = await supabase.auth.admin.deleteUser(user!.id);
      if (error) throw error;

      await signOut();
      toast({
        title: "Account Deleted",
        description: "Your account has been deleted successfully",
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
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5 backdrop-blur-xl border border-white/10 shadow-2xl">
        {/* Profile Header with Avatar */}
        <div className="relative h-48 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20">
          <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 md:left-12 md:translate-x-0">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="relative group"
            >
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-accent p-1">
                <div className="w-full h-full rounded-full bg-white dark:bg-gray-900 flex items-center justify-center text-4xl font-bold overflow-hidden">
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent">
                      {profile.username.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
              <button className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                <Camera className="w-6 h-6 text-white" />
              </button>
            </motion.div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="pt-20 md:pt-8 md:pl-48 p-8">
          <div className="space-y-8">
            {/* Basic Info */}
            <div className="space-y-4">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {profile.username}
              </h1>
              <p className="text-gray-500">{user?.email}</p>
            </div>

            {/* Profile Form */}
            <motion.form
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              onSubmit={handleUpdateProfile}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-gray-500">
                    <Mail className="h-4 w-4" />
                    Email Address
                  </Label>
                  <Input
                    type="email"
                    value={user?.email}
                    disabled
                    className="bg-white/5 border-white/10"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-gray-500">
                    <User className="h-4 w-4" />
                    Username
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      value={formData.username}
                      onChange={(e) =>
                        setFormData({ ...formData, username: e.target.value })
                      }
                      disabled={!editMode}
                      className="bg-white/5 border-white/10"
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
                  <Button type="submit" className="w-full md:w-auto">
                    Save Changes
                  </Button>
                </motion.div>
              )}
            </motion.form>

            {/* Security Section */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Security
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full bg-white/5 border-white/10"
                    >
                      <Key className="h-4 w-4 mr-2" />
                      Change Password
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl">
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

                <Button
                  onClick={() => signOut()}
                  variant="outline"
                  className="w-full bg-white/5 border-white/10"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="pt-6 border-t border-white/10">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    className="w-full md:w-auto bg-red-500/10 hover:bg-red-500/20"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-white/10">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete
                      your account and remove your data from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="bg-white/50 hover:bg-white/80">
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAccount}
                      className="bg-red-500 hover:bg-red-600 text-white"
                    >
                      Delete Account
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Profile;