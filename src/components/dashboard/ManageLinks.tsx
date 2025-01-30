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
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { motion, AnimatePresence } from "framer-motion";

const ManageLinks = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [links, setLinks] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"views" | "created_at">("created_at");
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
  }, [sortBy]);

  const fetchLinks = async () => {
    try {
      const { data, error } = await supabase
        .from("links")
        .select("*")
        .eq("user_id", user?.id)
        .order(sortBy, { ascending: false });

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
          title: "Link Deleted",
          description: "Your link has been deleted successfully",
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
        title: "Link Updated",
        description: "Your link has been updated successfully",
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Search links..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="sm:max-w-xs bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm"
        />
        <select
          className="border rounded-md p-2 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as "views" | "created_at")}
        >
          <option value="created_at">Sort by Date</option>
          <option value="views">Sort by Views</option>
        </select>
      </div>

      <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Views</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLinks.map((link) => (
              <TableRow key={link.id}>
                <TableCell>{link.name}</TableCell>
                <TableCell>{link.views}</TableCell>
                <TableCell>
                  {new Date(link.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
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
                      <DialogContent className="sm:max-w-[425px]">
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
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit-description">Description</Label>
                            <Textarea
                              id="edit-description"
                              value={editFormData.description}
                              onChange={(e) =>
                                setEditFormData({
                                  ...editFormData,
                                  description: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit-original-url">Original URL</Label>
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
                          onClick={() => setSelectedLink(link)}
                        >
                          <Info className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
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
                            <p className="mt-1">{link.description || "N/A"}</p>
                          </div>
                          <div>
                            <Label>Original URL</Label>
                            <p className="mt-1 break-all">{link.original_url}</p>
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
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Button
                      variant="ghost"
                      size="icon"
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
                      onClick={() => handleDelete(link.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ManageLinks;