import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Edit,
  Eye,
  Trash2,
  ExternalLink,
  Info,
  Link,
  Lock,
  Image,
  Search,
  SortAsc,
  SortDesc,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { motion, AnimatePresence } from "framer-motion";

const ManageLinks = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [links, setLinks] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"views" | "created_at">("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [loading, setLoading] = useState(true);
  const [selectedLink, setSelectedLink] = useState<any>(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    description: "",
    original_url: "",
    thumbnail_url: "",
    password: "",
    show_password: false,
  });

  useEffect(() => {
    fetchLinks();
  }, [sortBy, sortOrder]);

  const fetchLinks = async () => {
    try {
      const { data, error } = await supabase
        .from("links")
        .select("*")
        .eq("user_id", user?.id)
        .order(sortBy, { ascending: sortOrder === "asc" });

      if (error) throw error;

      setLinks(data || []);
      setLoading(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this link?")) {
      try {
        const { error } = await supabase.from("links").delete().eq("id", id);

        if (error) throw error;

        setLinks(links.filter((link) => link.id !== id));
        toast({
          title: "Success",
          description: "Link deleted successfully",
        });
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLink) return;

    try {
      const { error } = await supabase
        .from("links")
        .update({
          name: editFormData.name,
          description: editFormData.description,
          original_url: editFormData.original_url,
          thumbnail_url: editFormData.thumbnail_url,
          password: editFormData.password,
          show_password: editFormData.show_password,
        })
        .eq("id", selectedLink.id);

      if (error) throw error;

      await fetchLinks();
      setSelectedLink(null);
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

  const filteredLinks = links.filter((link) =>
    link.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="bg-white/10 dark:bg-gray-800/10 backdrop-blur-lg rounded-3xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row gap-4 items-center mb-6">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search links..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/5 border-0 focus-visible:ring-primary"
            />
          </div>
          <Button
            variant="outline"
            onClick={toggleSortOrder}
            className="flex items-center gap-2 bg-white/5 border-0"
          >
            {sortOrder === "asc" ? (
              <SortAsc className="h-4 w-4" />
            ) : (
              <SortDesc className="h-4 w-4" />
            )}
            <select
              className="bg-transparent border-none focus:outline-none"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "views" | "created_at")}
            >
              <option value="created_at">Date</option>
              <option value="views">Views</option>
            </select>
          </Button>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="text-center">Views</TableHead>
                <TableHead className="hidden md:table-cell">Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence>
                {filteredLinks.map((link) => (
                  <motion.tr
                    key={link.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="group hover:bg-white/5 transition-colors"
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {link.thumbnail_url ? (
                          <img
                            src={link.thumbnail_url}
                            alt={link.name}
                            className="w-8 h-8 rounded object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                            <Link className="w-4 h-4 text-primary" />
                          </div>
                        )}
                        <div>
                          <div className="font-semibold">{link.name}</div>
                          <div className="text-xs text-gray-500 truncate max-w-[200px]">
                            {link.original_url}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="inline-flex items-center gap-1">
                        <Eye className="w-4 h-4 text-gray-400" />
                        {link.views}
                      </span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-gray-500">
                      {new Date(link.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => {
                                setSelectedLink(link);
                                setEditFormData({
                                  name: link.name,
                                  description: link.description || "",
                                  original_url: link.original_url,
                                  thumbnail_url: link.thumbnail_url || "",
                                  password: link.password || "",
                                  show_password: link.show_password,
                                });
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[425px] bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg">
                            <DialogHeader>
                              <DialogTitle>Edit Link</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleEdit} className="space-y-4">
                              <div className="space-y-2">
                                <Label htmlFor="edit-name">Name</Label>
                                <Input
                                  id="edit-name"
                                  value={editFormData.name}
                                  onChange={(e) =>
                                    setEditFormData({
                                      ...editFormData,
                                      name: e.target.value,
                                    })
                                  }
                                  className="bg-white/5 border-0"
                                  required
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="edit-description">
                                  Description
                                </Label>
                                <Textarea
                                  id="edit-description"
                                  value={editFormData.description}
                                  onChange={(e) =>
                                    setEditFormData({
                                      ...editFormData,
                                      description: e.target.value,
                                    })
                                  }
                                  className="bg-white/5 border-0"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="edit-original-url">URL</Label>
                                <Input
                                  id="edit-original-url"
                                  type="url"
                                  value={editFormData.original_url}
                                  onChange={(e) =>
                                    setEditFormData({
                                      ...editFormData,
                                      original_url: e.target.value,
                                    })
                                  }
                                  className="bg-white/5 border-0"
                                  required
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="edit-thumbnail-url">
                                  Thumbnail URL
                                </Label>
                                <Input
                                  id="edit-thumbnail-url"
                                  type="url"
                                  value={editFormData.thumbnail_url}
                                  onChange={(e) =>
                                    setEditFormData({
                                      ...editFormData,
                                      thumbnail_url: e.target.value,
                                    })
                                  }
                                  className="bg-white/5 border-0"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="edit-password">Password</Label>
                                <Input
                                  id="edit-password"
                                  type="password"
                                  value={editFormData.password}
                                  onChange={(e) =>
                                    setEditFormData({
                                      ...editFormData,
                                      password: e.target.value,
                                    })
                                  }
                                  className="bg-white/5 border-0"
                                />
                              </div>
                              <div className="flex items-center space-x-2">
                                <Switch
                                  id="edit-show-password"
                                  checked={editFormData.show_password}
                                  onCheckedChange={(checked) =>
                                    setEditFormData({
                                      ...editFormData,
                                      show_password: checked,
                                    })
                                  }
                                />
                                <Label htmlFor="edit-show-password">
                                  Show password to visitors
                                </Label>
                              </div>
                              <Button type="submit" className="w-full">
                                Save Changes
                              </Button>
                            </form>
                          </DialogContent>
                        </Dialog>

                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => setSelectedLink(link)}
                            >
                              <Info className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg">
                            <DialogHeader>
                              <DialogTitle>Link Information</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label>Name</Label>
                                <p className="mt-1">{link.name}</p>
                              </div>
                              <div>
                                <Label>Description</Label>
                                <p className="mt-1">
                                  {link.description || "N/A"}
                                </p>
                              </div>
                              <div>
                                <Label>Original URL</Label>
                                <p className="mt-1 break-all">
                                  {link.original_url}
                                </p>
                              </div>
                              <div>
                                <Label>Views</Label>
                                <p className="mt-1">{link.views}</p>
                              </div>
                              <div>
                                <Label>Created At</Label>
                                <p className="mt-1">
                                  {new Date(link.created_at).toLocaleString()}
                                </p>
                              </div>
                              {link.password && (
                                <div className="flex items-center gap-2 text-yellow-500">
                                  <Lock className="h-4 w-4" />
                                  <span>Password Protected</span>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => {
                            const url = `${window.location.origin}/view?token=${link.token}`;
                            window.open(url, "_blank");
                          }}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-600"
                          onClick={() => handleDelete(link.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </TableBody>
          </Table>
        </div>
      </div>
    </motion.div>
  );
};

export default ManageLinks;