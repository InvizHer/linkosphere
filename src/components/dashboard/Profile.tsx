
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { UserCircle, Mail, Key, LogOut, Save, User, Shield, Clock, Bell, Lock, ExternalLink, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const Profile = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [username, setUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user?.id)
        .single();

      if (error) throw error;

      setProfile(data);
      setUsername(data.username || "");
      setAvatarUrl(data.avatar_url || "");
      setLoading(false);
    } catch (error: any) {
      console.error("Error fetching profile:", error.message);
      setLoading(false);
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

    // Password validation
    if (newPassword && newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
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
      
      // Update password if provided
      if (newPassword) {
        const { error: passwordError } = await supabase.auth.updateUser({
          password: newPassword,
        });

        if (passwordError) throw passwordError;
      }
      
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      
      setNewPassword("");
      setConfirmPassword("");
      setAvatarFile(null);
      
      // Refresh profile data
      fetchProfile();
      
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

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Account Settings</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage your profile and account preferences</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-20">
        <div className="lg:col-span-2">
          <Card className="shadow-md border border-gray-100 dark:border-gray-800 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700/80 pb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-primary/10">
                  <UserCircle className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Update your account settings and change your password</CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-6">
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex flex-col items-center space-y-3">
                    <div className="relative w-24 h-24 rounded-full bg-gray-100 overflow-hidden border-2 border-gray-200">
                      {avatarUrl ? (
                        <img 
                          src={avatarUrl} 
                          alt="Avatar" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary/10">
                          <User className="h-12 w-12 text-primary/40" />
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="avatar" className="cursor-pointer text-sm text-primary font-medium hover:underline">
                        Change Avatar
                      </Label>
                      <Input 
                        id="avatar" 
                        type="file" 
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden" 
                      />
                    </div>
                  </div>
                  
                  <div className="flex-1 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={user?.email || ""}
                        disabled
                        className="bg-gray-50"
                      />
                      <div className="flex items-center gap-1 text-xs text-green-600">
                        <CheckCircle className="h-3 w-3" />
                        <span>Verified email</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        type="text"
                        placeholder="Enter your username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <div className="flex items-center mb-4">
                    <Lock className="h-5 w-5 text-primary mr-2" />
                    <h3 className="font-medium">Change Password</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <Input
                        id="new-password"
                        type="password"
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm Password</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-500 mt-2">
                    Password must be at least 6 characters long. Leave empty to keep your current password.
                  </p>
                </div>
                
                <div className="flex justify-end gap-4 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setUsername(profile?.username || "");
                      setNewPassword("");
                      setConfirmPassword("");
                      setAvatarUrl(profile?.avatar_url || "");
                      setAvatarFile(null);
                    }}
                  >
                    Reset
                  </Button>
                  
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      "Saving..."
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
        
        <div className="space-y-6">
          <Card className="shadow-md border border-gray-100 dark:border-gray-800 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Account Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-primary/5 rounded-lg">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Email</span>
                </div>
                <span className="text-sm truncate max-w-[150px]">{user?.email}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-primary/5 rounded-lg">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Username</span>
                </div>
                <span className="text-sm">{profile?.username || "Not set"}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-primary/5 rounded-lg">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Account Age</span>
                </div>
                <span className="text-sm">{calculateAccountAge()}</span>
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <Button 
                variant="destructive" 
                onClick={handleSignOut} 
                className="w-full"
              >
                <LogOut className="mr-2 h-4 w-4" /> Sign Out
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="shadow-md border border-gray-100 dark:border-gray-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Account Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/20">
                  <Shield className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="text-sm font-medium">Enhanced Security</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Your account is protected with secure password hashing and encryption.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/20">
                  <Bell className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-sm font-medium">Password Tips</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Use a strong, unique password with a mix of letters, numbers, and symbols.
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <Button 
                variant="outline" 
                className="w-full text-xs"
                onClick={() => window.open('https://support.google.com/accounts/answer/32040', '_blank')}
              >
                <ExternalLink className="mr-2 h-3 w-3" /> Learn about password safety
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
