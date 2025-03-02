
import { useState, useRef, useEffect } from "react";
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
import {
  Link,
  Lock,
  Image,
  FileText,
  Copy,
  ExternalLink,
  PartyPopper,
  ChevronDown,
  Clock,
  Zap,
  History,
  Edit,
  ArrowUpRight,
  Plus,
  LinkIcon,
  Check,
  ExternalLink as ExternalLinkIcon,
  Calendar,
  BarChart,
  ArrowRight,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
  CardDescription,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const DEFAULT_THUMBNAIL = "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=800&q=80";

const CreateLink = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [createdLink, setCreatedLink] = useState<string | null>(null);
  const createdLinkRef = useRef<HTMLDivElement>(null);
  const [customThumbnail, setCustomThumbnail] = useState(false);
  const [showPasswordProtection, setShowPasswordProtection] = useState(false);
  const [recentLinks, setRecentLinks] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    original_url: "",
    thumbnail_url: DEFAULT_THUMBNAIL,
    password: "",
    show_password: false,
  });

  useEffect(() => {
    fetchRecentLinks();
  }, [user]);

  const fetchRecentLinks = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("links")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(3);
        
      if (error) throw error;
      setRecentLinks(data || []);
    } catch (error) {
      console.error("Error fetching recent links:", error);
    }
  };

  const validateDescription = (text: string) => {
    const lines = text.split('\n').filter(line => line.trim() !== '');
    return lines.length <= 2;
  };

  const clearForm = () => {
    setFormData({
      name: "",
      description: "",
      original_url: "",
      thumbnail_url: DEFAULT_THUMBNAIL,
      password: "",
      show_password: false,
    });
    setCustomThumbnail(false);
    setShowPasswordProtection(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.description && !validateDescription(formData.description)) {
      toast({
        title: "Validation Error",
        description: "Description cannot be longer than 2 lines",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from("links")
        .insert({
          name: formData.name,
          description: formData.description || null,
          original_url: formData.original_url,
          thumbnail_url: customThumbnail ? formData.thumbnail_url : DEFAULT_THUMBNAIL,
          password: showPasswordProtection ? formData.password : null,
          show_password: showPasswordProtection ? formData.show_password : false,
          user_id: user?.id,
        } as any)
        .select()
        .single();

      if (error) throw error;

      const linkUrl = `${window.location.origin}/view?token=${data.token}`;
      setCreatedLink(linkUrl);
      clearForm();
      fetchRecentLinks(); // Refresh recent links

      toast({
        title: "Link Created",
        description: "Your link has been created successfully",
      });

      setTimeout(() => {
        createdLinkRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = async (linkToCopy: string) => {
    await navigator.clipboard.writeText(linkToCopy);
    toast({
      title: "Copied!",
      description: "Link copied to clipboard",
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <div className="w-full max-w-5xl mx-auto pb-20 md:px-6">
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <Card className="overflow-hidden border border-gray-200 dark:border-gray-800 shadow-lg rounded-xl bg-white dark:bg-gray-900">
              <CardHeader className="pb-4 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600">
                <div className="text-white">
                  <CardTitle className="flex items-center gap-2 text-2xl font-bold">
                    <Plus className="h-6 w-6" />
                    Create New Link
                  </CardTitle>
                  <CardDescription className="text-blue-100">
                    Create a branded, trackable link with custom options
                  </CardDescription>
                </div>
              </CardHeader>
              
              <CardContent className="p-6 space-y-6">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-3">
                    <Label htmlFor="name" className="flex items-center gap-2 text-base font-medium">
                      <FileText className="h-4 w-4 text-blue-500" />
                      Link Name
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                      className="shadow-sm"
                      placeholder="Enter a name for your link"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="description" className="flex items-center gap-2 text-base font-medium">
                      <FileText className="h-4 w-4 text-blue-500" />
                      Description (Optional)
                    </Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      className="min-h-[80px] shadow-sm"
                      rows={2}
                      placeholder="Briefly describe your link"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Max 2 lines
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="original_url" className="flex items-center gap-2 text-base font-medium">
                      <Link className="h-4 w-4 text-blue-500" />
                      Original URL
                    </Label>
                    <Input
                      id="original_url"
                      type="url"
                      value={formData.original_url}
                      onChange={(e) =>
                        setFormData({ ...formData, original_url: e.target.value })
                      }
                      required
                      className="shadow-sm"
                      placeholder="https://example.com"
                    />
                  </div>

                  <Accordion type="single" collapsible className="border rounded-lg shadow-sm">
                    <AccordionItem value="advanced" className="border-none">
                      <AccordionTrigger className="px-4 py-3 text-base font-medium hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors rounded-lg">
                        <div className="flex items-center gap-2">
                          <ChevronDown className="h-4 w-4 text-blue-500 shrink-0 transition-transform duration-200" />
                          <span>Advanced Options</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-4 pt-1 space-y-5">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/60 rounded-lg border border-gray-200 dark:border-gray-700">
                            <Label htmlFor="custom_thumbnail" className="flex items-center gap-2 cursor-pointer">
                              <Image className="h-4 w-4 text-blue-500" />
                              <div>
                                <span className="font-medium">Custom Thumbnail</span>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                  Make your link more visually appealing
                                </p>
                              </div>
                            </Label>
                            <Switch
                              id="custom_thumbnail"
                              checked={customThumbnail}
                              onCheckedChange={setCustomThumbnail}
                              className="data-[state=checked]:bg-blue-500"
                            />
                          </div>

                          {customThumbnail && (
                            <div className="space-y-3 p-4 border border-dashed border-blue-200 dark:border-blue-700/50 rounded-lg bg-blue-50/50 dark:bg-blue-900/20">
                              <Input
                                id="thumbnail_url"
                                type="url"
                                value={formData.thumbnail_url}
                                onChange={(e) =>
                                  setFormData({ ...formData, thumbnail_url: e.target.value })
                                }
                                placeholder="Enter thumbnail URL (e.g., https://example.com/image.jpg)"
                                className="bg-white/80 dark:bg-gray-900/80 border-gray-200 dark:border-gray-700"
                              />
                              {formData.thumbnail_url && (
                                <div className="mt-2 relative aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm">
                                  <img
                                    src={formData.thumbnail_url}
                                    alt="Thumbnail preview"
                                    className="object-cover w-full h-full"
                                    onError={(e) => {
                                      e.currentTarget.src = "https://via.placeholder.com/400x225?text=Invalid+Image+URL";
                                    }}
                                  />
                                </div>
                              )}
                            </div>
                          )}

                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/60 rounded-lg border border-gray-200 dark:border-gray-700">
                            <Label htmlFor="password_protection" className="flex items-center gap-2 cursor-pointer">
                              <Lock className="h-4 w-4 text-blue-500" />
                              <div>
                                <span className="font-medium">Password Protection</span>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                  Restrict access to your link
                                </p>
                              </div>
                            </Label>
                            <Switch
                              id="password_protection"
                              checked={showPasswordProtection}
                              onCheckedChange={setShowPasswordProtection}
                              className="data-[state=checked]:bg-blue-500"
                            />
                          </div>

                          {showPasswordProtection && (
                            <div className="space-y-4 p-4 border border-dashed border-blue-200 dark:border-blue-700/50 rounded-lg bg-blue-50/50 dark:bg-blue-900/20">
                              <Input
                                id="password"
                                type="password"
                                value={formData.password}
                                onChange={(e) =>
                                  setFormData({ ...formData, password: e.target.value })
                                }
                                placeholder="Enter a secure password"
                                className="bg-white/80 dark:bg-gray-900/80 border-gray-200 dark:border-gray-700"
                              />
                              <div className="flex items-center space-x-2 p-3 bg-gray-50 dark:bg-gray-800/80 rounded-lg">
                                <Switch
                                  id="show_password"
                                  checked={formData.show_password}
                                  onCheckedChange={(checked) =>
                                    setFormData({ ...formData, show_password: checked })
                                  }
                                  className="data-[state=checked]:bg-blue-500"
                                />
                                <div>
                                  <Label htmlFor="show_password" className="cursor-pointer">Show password to visitors</Label>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Display the password on the link page
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium py-2 h-12 shadow-lg shadow-blue-500/20 border-0"
                  >
                    <Zap className="mr-2 h-5 w-5" />
                    Create Link
                  </Button>
                </form>
              </CardContent>
            </Card>

            {createdLink ? (
              <motion.div
                ref={createdLinkRef}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 backdrop-blur-sm rounded-xl border border-emerald-200 dark:border-emerald-800/30 shadow-xl"
              >
                <div className="flex items-center gap-2 mb-4 text-emerald-600 dark:text-emerald-400">
                  <PartyPopper className="h-6 w-6" />
                  <h3 className="text-xl font-semibold">Link Created!</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Your link has been created successfully. Share it with anyone!
                </p>
                <div className="flex flex-col space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Your Link:</span>
                    <div className="flex gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(createdLink)}
                              className="flex items-center gap-1 border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30"
                            >
                              <Copy className="h-4 w-4" />
                              Copy
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Copy to clipboard</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(createdLink, "_blank")}
                              className="flex items-center gap-1 border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30"
                            >
                              <ExternalLink className="h-4 w-4" />
                              Visit
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Open in new tab</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                  <div className="relative">
                    <Input
                      value={createdLink}
                      readOnly
                      className="bg-white dark:bg-gray-900 font-mono text-sm border-emerald-200 dark:border-emerald-700 shadow-inner pr-14"
                    />
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-emerald-700 dark:text-emerald-300 h-8"
                      onClick={() => copyToClipboard(createdLink)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ) : null}
          </motion.div>
        </div>

        {/* Recent Links Sidebar */}
        <div className="hidden md:block">
          <div className="sticky top-24 space-y-8">
            <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-md rounded-xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-b border-gray-200 dark:border-gray-700">
                <CardTitle className="flex items-center text-lg font-semibold">
                  <History className="mr-2 h-5 w-5 text-blue-500" />
                  Recent Links
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {recentLinks.length > 0 ? (
                  <div className="divide-y divide-gray-200 dark:divide-gray-800">
                    {recentLinks.map((link) => (
                      <div key={link.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium text-left line-clamp-1">{link.name}</h3>
                          <div className="flex space-x-1">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    className="h-7 w-7 p-0"
                                    onClick={() => copyToClipboard(`${window.location.origin}/view?token=${link.token}`)}
                                  >
                                    <Copy className="h-3.5 w-3.5" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Copy link</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    className="h-7 w-7 p-0"
                                    onClick={() => navigate(`/dashboard/edit?token=${link.token}`)}
                                  >
                                    <Edit className="h-3.5 w-3.5" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Edit link</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    className="h-7 w-7 p-0"
                                    onClick={() => window.open(`/view?token=${link.token}`, "_blank")}
                                  >
                                    <ExternalLinkIcon className="h-3.5 w-3.5" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Open link</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 text-left">
                          {link.description ? (
                            <p className="line-clamp-1">{link.description}</p>
                          ) : (
                            <p className="italic">No description</p>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                            <Calendar className="h-3.5 w-3.5 mr-1" />
                            {formatDate(link.created_at)}
                          </div>
                          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                            <BarChart className="h-3.5 w-3.5 mr-1" />
                            {link.views || 0} views
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center">
                    <div className="flex justify-center mb-2">
                      <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-3">
                        <History className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">No links yet</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Your recently created links will appear here
                    </p>
                  </div>
                )}
              </CardContent>
              {recentLinks.length > 0 && (
                <CardFooter className="border-t border-gray-200 dark:border-gray-700 p-4">
                  <Button 
                    variant="ghost" 
                    className="w-full text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    onClick={() => navigate("/dashboard/manage")}
                  >
                    View All Links
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </CardFooter>
              )}
            </Card>

            <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-md rounded-xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-b border-gray-200 dark:border-gray-700">
                <CardTitle className="flex items-center text-lg font-semibold">
                  <LinkIcon className="mr-2 h-5 w-5 text-blue-500" />
                  Pro Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <ul className="space-y-3 text-sm text-left">
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span>Use descriptive names for better organization</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span>Add thumbnails to increase click-through rates</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span>Use password protection for sensitive content</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Recent Links for Mobile */}
      <div className="block md:hidden mt-8">
        <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-md rounded-xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-b border-gray-200 dark:border-gray-700">
            <CardTitle className="flex items-center text-lg font-semibold">
              <History className="mr-2 h-5 w-5 text-blue-500" />
              Recent Links
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {recentLinks.length > 0 ? (
              <div className="divide-y divide-gray-200 dark:divide-gray-800">
                {recentLinks.map((link) => (
                  <div key={link.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-left line-clamp-1">{link.name}</h3>
                      <div className="flex space-x-1">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-7 w-7 p-0"
                          onClick={() => copyToClipboard(`${window.location.origin}/view?token=${link.token}`)}
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-7 w-7 p-0"
                          onClick={() => navigate(`/dashboard/edit?token=${link.token}`)}
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-7 w-7 p-0"
                          onClick={() => window.open(`/view?token=${link.token}`, "_blank")}
                        >
                          <ExternalLinkIcon className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 text-left">
                      {link.description ? (
                        <p className="line-clamp-1">{link.description}</p>
                      ) : (
                        <p className="italic">No description</p>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                        <Calendar className="h-3.5 w-3.5 mr-1" />
                        {formatDate(link.created_at)}
                      </div>
                      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                        <BarChart className="h-3.5 w-3.5 mr-1" />
                        {link.views || 0} views
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center">
                <div className="flex justify-center mb-2">
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-3">
                    <History className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">No links yet</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Your recently created links will appear here
                </p>
              </div>
            )}
          </CardContent>
          {recentLinks.length > 0 && (
            <CardFooter className="border-t border-gray-200 dark:border-gray-700 p-4">
              <Button 
                variant="ghost" 
                className="w-full text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                onClick={() => navigate("/dashboard/manage")}
              >
                View All Links
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
};

export default CreateLink;
