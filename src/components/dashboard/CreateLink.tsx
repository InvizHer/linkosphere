
import { useState, useRef } from "react";
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
  ChevronUp,
  Share2,
  Sparkles,
  Lightbulb,
  Shield,
  Zap,
  BookIcon,
  BarChart,
  Clock,
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

const DEFAULT_THUMBNAIL = "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=800&q=80";

const CreateLink = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [createdLink, setCreatedLink] = useState<string | null>(null);
  const createdLinkRef = useRef<HTMLDivElement>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [customThumbnail, setCustomThumbnail] = useState(false);
  const [showPasswordProtection, setShowPasswordProtection] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    original_url: "",
    thumbnail_url: DEFAULT_THUMBNAIL,
    password: "",
    show_password: false,
  });

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

  const copyToClipboard = async () => {
    if (createdLink) {
      await navigator.clipboard.writeText(createdLink);
      toast({
        title: "Copied!",
        description: "Link copied to clipboard",
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-3xl mx-auto space-y-8 mb-20 md:mb-0 px-4 sm:px-6"
    >
      <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-100/50 dark:border-gray-700/50 shadow-xl overflow-hidden rounded-xl">
        <CardHeader className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 pb-6">
          <CardTitle className="flex items-center gap-2 text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            <Sparkles className="h-6 w-6" />
            Create Professional Link
          </CardTitle>
          <CardDescription className="text-gray-500 dark:text-gray-400">
            Create a branded, trackable link with custom options
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2 text-base font-medium text-gray-700 dark:text-gray-300">
                <FileText className="h-4 w-4 text-indigo-500" />
                Link Name
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500/20 text-gray-900 dark:text-gray-100 shadow-sm"
                placeholder="Enter a name for your link"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="flex items-center gap-2 text-base font-medium text-gray-700 dark:text-gray-300">
                <FileText className="h-4 w-4 text-indigo-500" />
                Description (Max 2 lines)
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500/20 text-gray-900 dark:text-gray-100 shadow-sm min-h-[80px]"
                rows={2}
                placeholder="Briefly describe your link (optional)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="original_url" className="flex items-center gap-2 text-base font-medium text-gray-700 dark:text-gray-300">
                <Link className="h-4 w-4 text-indigo-500" />
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
                className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500/20 text-gray-900 dark:text-gray-100 shadow-sm"
                placeholder="https://example.com"
              />
            </div>

            <Accordion type="single" collapsible className="border rounded-lg shadow-sm bg-white dark:bg-gray-900/50">
              <AccordionItem value="advanced" className="border-none">
                <AccordionTrigger className="px-4 py-3 text-base font-medium hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors rounded-lg">
                  <div className="flex items-center gap-2">
                    <ChevronDown className="h-4 w-4 text-indigo-500 shrink-0 transition-transform duration-200" />
                    <span>Advanced Options</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 pt-1 space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/60 rounded-lg shadow-sm">
                        <Label htmlFor="custom_thumbnail" className="flex items-center gap-2 cursor-pointer">
                          <Image className="h-4 w-4 text-indigo-500" />
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
                          className="data-[state=checked]:bg-indigo-500"
                        />
                      </div>

                      {customThumbnail && (
                        <div className="space-y-3 p-4 border border-dashed border-indigo-200 dark:border-indigo-700/50 rounded-lg bg-indigo-50/50 dark:bg-indigo-900/20">
                          <Input
                            id="thumbnail_url"
                            type="url"
                            value={formData.thumbnail_url}
                            onChange={(e) =>
                              setFormData({ ...formData, thumbnail_url: e.target.value })
                            }
                            placeholder="Enter thumbnail URL (e.g., https://example.com/image.jpg)"
                            className="bg-white/80 dark:bg-gray-900/80 border-gray-200 dark:border-gray-700 focus:border-indigo-500"
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

                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/60 rounded-lg shadow-sm">
                        <Label htmlFor="password_protection" className="flex items-center gap-2 cursor-pointer">
                          <Lock className="h-4 w-4 text-indigo-500" />
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
                          className="data-[state=checked]:bg-indigo-500"
                        />
                      </div>

                      {showPasswordProtection && (
                        <div className="space-y-4 p-4 border border-dashed border-indigo-200 dark:border-indigo-700/50 rounded-lg bg-indigo-50/50 dark:bg-indigo-900/20">
                          <Input
                            id="password"
                            type="password"
                            value={formData.password}
                            onChange={(e) =>
                              setFormData({ ...formData, password: e.target.value })
                            }
                            placeholder="Enter a secure password"
                            className="bg-white/80 dark:bg-gray-900/80 border-gray-200 dark:border-gray-700 focus:border-indigo-500"
                          />
                          <div className="flex items-center space-x-2 p-3 bg-gray-50 dark:bg-gray-800/80 rounded-lg">
                            <Switch
                              id="show_password"
                              checked={formData.show_password}
                              onCheckedChange={(checked) =>
                                setFormData({ ...formData, show_password: checked })
                              }
                              className="data-[state=checked]:bg-indigo-500"
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
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:opacity-90 transition-opacity text-white font-medium py-2 h-12 shadow-lg shadow-indigo-500/20 border-0"
            >
              <Zap className="mr-2 h-5 w-5" />
              Create Link
            </Button>
          </form>
        </CardContent>
        <CardFooter className="bg-gray-50 dark:bg-gray-800/30 border-t border-gray-100 dark:border-gray-700/50 px-6 py-4 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1 justify-center sm:justify-start">
              <Shield className="h-4 w-4 text-green-500" /> Secure
            </span>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1 justify-center sm:justify-start">
              <Share2 className="h-4 w-4 text-blue-500" /> Shareable
            </span>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1 justify-center sm:justify-start">
              <BarChart className="h-4 w-4 text-purple-500" /> Trackable
            </span>
          </div>
        </CardFooter>
      </Card>

      {createdLink ? (
        <motion.div
          ref={createdLinkRef}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl border border-gray-100/50 dark:border-gray-700/50 shadow-xl"
        >
          <div className="flex items-center gap-2 mb-4 text-indigo-600 dark:text-indigo-400">
            <PartyPopper className="h-6 w-6" />
            <h3 className="text-xl font-semibold">Congratulations!</h3>
          </div>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Your link has been created successfully. You can now share it with others!
          </p>
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Your Link:</span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyToClipboard}
                  className="flex items-center gap-1 border-indigo-200 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
                >
                  <Copy className="h-4 w-4" />
                  Copy
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(createdLink, "_blank")}
                  className="flex items-center gap-1 border-indigo-200 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
                >
                  <ExternalLink className="h-4 w-4" />
                  Visit
                </Button>
              </div>
            </div>
            <Input
              value={createdLink}
              readOnly
              className="bg-white dark:bg-gray-900 font-mono text-sm border-indigo-200 dark:border-indigo-700 shadow-inner"
            />
          </div>
        </motion.div>
      ) : null}

      {/* Feature Cards Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12"
      >
        <Card className="bg-white/80 dark:bg-gray-800/80 shadow-md hover:shadow-lg transition-shadow border border-gray-100/50 dark:border-gray-700/50 rounded-xl overflow-hidden">
          <CardHeader className="pb-2">
            <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center mb-2">
              <Lightbulb className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <CardTitle className="text-lg font-semibold">Smart Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Track views, engagement, and more with our comprehensive analytics dashboard.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 dark:bg-gray-800/80 shadow-md hover:shadow-lg transition-shadow border border-gray-100/50 dark:border-gray-700/50 rounded-xl overflow-hidden">
          <CardHeader className="pb-2">
            <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center mb-2">
              <Shield className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <CardTitle className="text-lg font-semibold">Enhanced Security</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Password protection and controlled access ensure your links remain secure.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 dark:bg-gray-800/80 shadow-md hover:shadow-lg transition-shadow border border-gray-100/50 dark:border-gray-700/50 rounded-xl overflow-hidden">
          <CardHeader className="pb-2">
            <div className="h-10 w-10 rounded-full bg-pink-100 dark:bg-pink-900/50 flex items-center justify-center mb-2">
              <BookIcon className="h-5 w-5 text-pink-600 dark:text-pink-400" />
            </div>
            <CardTitle className="text-lg font-semibold">Custom Branding</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Add thumbnails and custom descriptions to enhance your links' appearance.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default CreateLink;
