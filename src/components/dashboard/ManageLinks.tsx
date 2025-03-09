
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { motion } from "framer-motion";
import { 
  Edit2, 
  ExternalLink, 
  Link as LinkIcon, 
  Search, 
  SlidersHorizontal, 
  Eye, 
  Calendar, 
  CalendarDays,
  Trash2, 
  Lock, 
  Unlock,
  Copy,
  LayoutGrid,
  LayoutList,
} from "lucide-react";

const ITEMS_PER_PAGE = 10;

const ManageLinks = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [links, setLinks] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"views" | "created_at">("created_at");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");

  useEffect(() => {
    fetchLinks();
    if (isMobile) {
      setViewMode("grid");
    }
  }, [sortBy, isMobile]);

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

  const filteredLinks = links.filter((link) =>
    link.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredLinks.length / ITEMS_PER_PAGE);
  const paginatedLinks = filteredLinks.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const copyLinkToClipboard = (link: any) => {
    const url = `${window.location.origin}/view?token=${link.token}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Link Copied",
      description: "The shortened link has been copied to your clipboard.",
    });
  };

  const handleEditLink = (link: any) => {
    navigate(`/dashboard/edit/${link.id}`);
  };

  const handleDeleteLink = (link: any) => {
    // Placeholder for delete functionality
    toast({
      title: "Delete Feature",
      description: "Delete functionality would go here.",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-14 w-14 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 container mx-auto px-2 sm:px-4 py-6 mb-20">
      <Card className="bg-white dark:bg-gray-800 border-none shadow-lg overflow-hidden">
        <CardHeader className="pb-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl font-bold">
                Manage Links
              </CardTitle>
              <CardDescription className="text-white/80 dark:text-white/80">
                View and manage all your shortened links
              </CardDescription>
            </div>
            <div className="flex gap-3 bg-white/20 backdrop-blur-sm rounded-lg p-1">
              <Button 
                variant="ghost" 
                size="sm"
                className={`text-white ${viewMode === 'list' ? 'bg-white/20' : ''} hover:bg-white/30`}
                onClick={() => setViewMode('list')}
              >
                <LayoutList className="h-4 w-4 mr-1" />
                List
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                className={`text-white ${viewMode === 'grid' ? 'bg-white/20' : ''} hover:bg-white/30`}
                onClick={() => setViewMode('grid')}
              >
                <LayoutGrid className="h-4 w-4 mr-1" />
                Grid
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 px-2 sm:px-6 pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search links..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-white dark:bg-gray-800 border-indigo-100 dark:border-gray-700"
              />
            </div>
            <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-md border border-indigo-100 dark:border-gray-700 px-3">
              <SlidersHorizontal className="h-4 w-4 text-indigo-500" />
              <select
                className="bg-transparent border-none outline-none py-2 text-sm dark:text-white"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "views" | "created_at")}
              >
                <option value="created_at">Sort by Date</option>
                <option value="views">Sort by Views</option>
              </select>
            </div>
          </div>

          {paginatedLinks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="bg-indigo-100 dark:bg-indigo-900/30 p-4 rounded-full mb-4">
                <LinkIcon className="h-8 w-8 text-indigo-500" />
              </div>
              <h3 className="text-lg font-medium mb-1">No links found</h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-md mb-4">
                {searchTerm ? "No links match your search criteria." : "You haven't created any links yet."}
              </p>
              <Button onClick={() => navigate('/dashboard/create')} className="bg-indigo-600 hover:bg-indigo-700">
                Create your first link
              </Button>
            </div>
          ) : viewMode === 'list' ? (
            <div className="overflow-hidden rounded-lg border border-indigo-100 dark:border-gray-700">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead className="hidden sm:table-cell">Views</TableHead>
                      <TableHead className="hidden sm:table-cell">Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedLinks.map((link) => (
                      <TableRow
                        key={link.id}
                        className="hover:bg-indigo-50/50 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {link.password ? (
                              <Lock className="h-4 w-4 text-indigo-500" />
                            ) : (
                              <Unlock className="h-4 w-4 text-indigo-500" />
                            )}
                            <span className="truncate max-w-[150px] sm:max-w-[200px]">
                              {link.name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <div className="flex items-center gap-1">
                            <Eye className="h-4 w-4 text-gray-500" />
                            {link.views}
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            {new Date(link.created_at).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditLink(link)}
                              className="hover:bg-indigo-100 dark:hover:bg-indigo-900/30"
                              title="Edit"
                            >
                              <Edit2 className="h-4 w-4 text-indigo-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => window.open(`/view?token=${link.token}`, '_blank')}
                              className="hover:bg-indigo-100 dark:hover:bg-indigo-900/30"
                              title="Open"
                            >
                              <ExternalLink className="h-4 w-4 text-indigo-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => copyLinkToClipboard(link)}
                              className="hover:bg-indigo-100 dark:hover:bg-indigo-900/30"
                              title="Copy"
                            >
                              <Copy className="h-4 w-4 text-indigo-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-4">
              {paginatedLinks.map((link) => (
                <motion.div
                  key={link.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white dark:bg-gray-800/80 rounded-lg border border-indigo-100 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-md transition-all group"
                >
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="bg-indigo-100 dark:bg-gray-700 p-1.5 rounded-full">
                          {link.password ? (
                            <Lock className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                          ) : (
                            <Unlock className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                          )}
                        </div>
                        <h3 className="font-medium text-sm truncate max-w-[120px]">{link.name}</h3>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-3.5 w-3.5 text-gray-500" />
                        <span className="text-xs text-gray-500">{link.views || 0}</span>
                      </div>
                    </div>
                    
                    <div className="bg-indigo-50 dark:bg-gray-700/50 rounded p-2 mb-3">
                      <div className="flex items-center text-xs text-indigo-800 dark:text-indigo-300 font-mono truncate">
                        <span className="opacity-70 mr-1">/{link.token}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <CalendarDays className="h-3 w-3" />
                        {new Date(link.created_at).toLocaleDateString()}
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditLink(link)}
                          className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Edit"
                        >
                          <Edit2 className="h-3.5 w-3.5 text-indigo-600" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => window.open(`/view?token=${link.token}`, '_blank')}
                          className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Open"
                        >
                          <ExternalLink className="h-3.5 w-3.5 text-indigo-600" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => copyLinkToClipboard(link)}
                          className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Copy"
                        >
                          <Copy className="h-3.5 w-3.5 text-indigo-600" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <PaginationItem key={page} className="hidden sm:block">
                      <Button
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className={currentPage === page ? "bg-indigo-600" : ""}
                      >
                        {page}
                      </Button>
                    </PaginationItem>
                  ))}
                  <PaginationItem className="sm:hidden">
                    <span className="text-sm">{currentPage} / {totalPages}</span>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ManageLinks;
