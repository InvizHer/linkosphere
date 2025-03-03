
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { UserCircle, Mail, Key, LogOut, Save, User, Shield, Clock, Bell, Lock, ExternalLink, CheckCircle, UserCheck, Building, Calendar, Activity, AtSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { Link as LinkIcon, Eye } from "lucide-react";

const Profile = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [linksCount, setLinksCount] = useState<number>(0);
  const [totalViews, setTotalViews] = useState<number>(0);
  const [username, setUsername] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [verifyingPassword, setVerifyingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [memberSince, setMemberSince] = useState("");

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchUserStats();
      
      // Calculate member since date
      if (user.created_at) {
        const createdDate = new Date(user.created_at);
        setMemberSince(createdDate.toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }));
      }
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      
      if (!user?.id) {
        console.log("No user ID available");
        setLoading(false);
        return;
      }
      
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user?.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error.message);
        // If profile doesn't exist, create it
        if (error.code === "PGRST116") {
          await createDefaultProfile();
          return;
        }
        throw error;
      }

      setProfile(data);
      setUsername(data?.username || "");
      setAvatarUrl(data?.avatar_url || "");
      setLoading(false);
    } catch (error: any) {
      console.error("Error fetching profile:", error.message);
      setLoading(false);
    }
  };
  
  const createDefaultProfile = async () => {
    try {
      if (!user?.id) return;
      
      const defaultUsername = user.email?.split('@')[0] || "user";
      
      const { data, error } = await supabase
        .from("profiles")
        .insert({
          id: user.id,
          username: defaultUsername,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
        
      if (error) throw error;
      
      setProfile(data);
      setUsername(data.username || "");
      setLoading(false);
    } catch (error: any) {
      console.error("Error creating default profile:", error.message);
      setLoading(false);
    }
  };
  
  const fetchUserStats = async () => {
    try {
      if (!user?.id) return;
      
      // Get links count
      const { data: linksData, error: linksError } = await supabase
        .from("links")
        .select("id", { count: 'exact' })
        .eq("user_id", user?.id);
        
      if (linksError) throw linksError;
      setLinksCount(linksData?.length || 0);
      
      // Get total views
      const { data: viewsData, error: viewsError } = await supabase
        .from("links")
        .select("views")
        .eq("user_id", user?.id);
        
      if (viewsError) throw viewsError;
      
      const total = viewsData?.reduce((sum, link) => sum + (link.views || 0), 0) || 0;
      setTotalViews(total);
      
    } catch (error: any) {
      console.error("Error fetching user stats:", error.message);
    }
  };

  const verifyCurrentPassword = async (password: string): Promise<boolean> => {
    try {
      setVerifyingPassword(true);
      setPasswordError("");
      
      // Attempt to sign in with current credentials to verify password
      const { error } = await supabase.auth.signInWithPassword({
        email: user?.email || "",
        password: password
      });
      
      if (error) {
        setPasswordError("Current password is incorrect");
        return false;
      }
      
      return true;
    } catch (error: any) {
      setPasswordError("Failed to verify password");
      return false;
    } finally {
      setVerifyingPassword(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      toast({
        title: "Error",
        description: "Username is required",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      // Upload avatar if selected
      let newAvatarUrl = avatarUrl;
      
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${user?.id}-${Math.random()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(fileName, avatarFile);

        if (uploadError) throw uploadError;
        
        newAvatarUrl = `https://wscxbxofzpoxmlcnaidw.supabase.co/storage/v1/object/public/avatars/${fileName}`;
      }
      
      // Update profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          username,
          avatar_url: newAvatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user?.id);

      if (profileError) throw profileError;
      
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      
      setAvatarFile(null);
      
      // Refresh profile data
      fetchProfile();
      
    } catch (error: any) {
      setLoading(false);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset errors
    setPasswordError("");
    
    // Validate passwords
    if (!oldPassword) {
      setPasswordError("Current password is required");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }
    
    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters");
      return;
    }
    
    try {
      setLoading(true);
      
      // Verify current password first
      const isPasswordValid = await verifyCurrentPassword(oldPassword);
      
      if (!isPasswordValid) {
        setLoading(false);
        return;
      }
      
      // Update password
      const { error: passwordError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (passwordError) throw passwordError;
      
      toast({
        title: "Success",
        description: "Password updated successfully",
      });
      
      // Clear password fields
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      
      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "Image size should be less than 2MB",
          variant: "destructive",
        });
        return;
      }
      
      setAvatarFile(file);
      
      // Create preview URL
      const objectUrl = URL.createObjectURL(file);
      setAvatarUrl(objectUrl);
    }
  };
  
  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Calculate account age
  const calculateAccountAge = () => {
    if (!user?.created_at) return "N/A";
    
    const createdDate = new Date(user.created_at);
    const currentDate = new Date();
    
    const diffTime = Math.abs(currentDate.getTime() - createdDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) {
      return `${diffDays} days`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} month${months > 1 ? 's' : ''}`;
    } else {
      const years = Math.floor(diffDays / 365);
      const remainingMonths = Math.floor((diffDays % 365) / 30);
      return `${years} year${years > 1 ? 's' : ''} ${remainingMonths > 0 ? `and ${remainingMonths} month${remainingMonths > 1 ? 's' : ''}` : ''}`;
    }
  };

  if (loading && !profile) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="grid gap-6">
          <div className="flex flex-col space-y-3">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <Skeleton className="h-64 col-span-2" />
            <Skeleton className="h-64" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl mb-20">
      <div className="mb-8">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-violet-600 bg-clip-text text-transparent">Account Settings</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage your profile and account preferences</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="shadow-md border border-gray-100 dark:border-gray-800 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-gray-800 dark:to-gray-800/80 pb-2">
              <Tabs defaultValue="profile" className="w-full" onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2 bg-transparent">
                  <TabsTrigger value="profile" className="data-[state=active]:bg-white/80 dark:data-[state=active]:bg-gray-700/50">
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </TabsTrigger>
                  <TabsTrigger value="security" className="data-[state=active]:bg-white/80 dark:data-[state=active]:bg-gray-700/50">
                    <Shield className="h-4 w-4 mr-2" />
                    Security
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            
            <CardContent className="pt-5">
              <TabsContent value="profile" className="mt-0">
                <form onSubmit={handleUpdateProfile} className="space-y-5">
                  <div className="flex items-center justify-center p-2 mb-4">
                    <div className="flex flex-col items-center space-y-3">
                      <div className="relative group">
                        <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-700 shadow-md bg-gray-50 dark:bg-gray-800">
                          {avatarUrl ? (
                            <img 
                              src={avatarUrl} 
                              alt="Avatar" 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-primary/5">
                              <User className="h-12 w-12 text-primary/40" />
                            </div>
                          )}
                        </div>
                        <Label 
                          htmlFor="avatar"
                          className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full cursor-pointer shadow-md hover:bg-primary/90 transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                        </Label>
                        <Input 
                          id="avatar" 
                          type="file" 
                          accept="image/*"
                          onChange={handleAvatarChange}
                          className="hidden" 
                        />
                      </div>
                      
                      <div className="text-center">
                        <h3 className="font-medium text-lg">{profile?.username || user?.email?.split('@')[0]}</h3>
                        <p className="text-sm text-gray-500">{user?.email}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4 pt-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                          <Input
                            id="email"
                            type="email"
                            value={user?.email || ""}
                            disabled
                            className="pl-10 bg-gray-50 dark:bg-gray-800"
                          />
                        </div>
                        <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
                          <CheckCircle className="h-3 w-3" />
                          <span>Verified email</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="username" className="text-sm font-medium">Username</Label>
                        <div className="relative">
                          <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                          <Input
                            id="username"
                            type="text"
                            placeholder="Enter your username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-3">
                      <Button type="submit" disabled={loading} className="w-full md:w-auto">
                        {loading ? (
                          "Saving..."
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" /> Save Profile
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </form>
              </TabsContent>
              
              <TabsContent value="security" className="mt-0">
                <form onSubmit={handleUpdatePassword} className="space-y-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/20">
                      <Lock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="font-medium">Change Password</h3>
                  </div>
                  
                  {passwordError && (
                    <Alert variant="destructive" className="mb-4">
                      <AlertDescription>{passwordError}</AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="current-password" className="text-sm font-medium">Current Password</Label>
                      <div className="relative">
                        <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <Input
                          id="current-password"
                          type="password"
                          placeholder="Enter your current password"
                          value={oldPassword}
                          onChange={(e) => setOldPassword(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    
                    <Separator className="my-2" />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="new-password" className="text-sm font-medium">New Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                          <Input
                            id="new-password"
                            type="password"
                            placeholder="Enter new password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="confirm-password" className="text-sm font-medium">Confirm Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                          <Input
                            id="confirm-password"
                            type="password"
                            placeholder="Confirm new password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-xs text-gray-500 mt-1">
                      Password must be at least 6 characters long.
                    </p>
                    
                    <div className="pt-2">
                      <Button type="submit" disabled={loading || verifyingPassword} className="w-full md:w-auto">
                        {loading || verifyingPassword ? (
                          "Updating..."
                        ) : (
                          <>
                            <Shield className="mr-2 h-4 w-4" /> Update Password
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </form>
              </TabsContent>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card className="shadow-md border border-gray-100 dark:border-gray-800 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm overflow-hidden">
            <CardHeader className="pb-3 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-gray-800 dark:to-gray-800/80">
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                <span>Account Statistics</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 p-4"
                >
                  <div className="flex flex-col items-center">
                    <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-2">
                      <LinkIcon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold">{linksCount}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Links Created</p>
                  </div>
                </motion.div>
                
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 p-4"
                >
                  <div className="flex flex-col items-center">
                    <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-2">
                      <Eye className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold">{totalViews}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Total Views</p>
                  </div>
                </motion.div>
              </div>
            
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/60 rounded-lg">
                  <div className="flex items-center gap-3">
                    <UserCheck className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Status</span>
                  </div>
                  <span className="text-sm font-medium text-green-500">Active</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/60 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span className="text-sm">Joined</span>
                  </div>
                  <span className="text-sm">{memberSince}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/60 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-primary" />
                    <span className="text-sm">Account Age</span>
                  </div>
                  <span className="text-sm">{calculateAccountAge()}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <Button 
                variant="outline" 
                onClick={handleSignOut} 
                className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-900/20"
              >
                <LogOut className="mr-2 h-4 w-4" /> Sign Out
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="shadow-md border border-gray-100 dark:border-gray-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Security Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-900/20 shrink-0">
                  <Shield className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h3 className="text-sm font-medium">Use a Strong Password</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Mix letters, numbers, and symbols to create a secure password.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/20 shrink-0">
                  <Bell className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-sm font-medium">Regular Updates</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Change your password periodically for enhanced security.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
