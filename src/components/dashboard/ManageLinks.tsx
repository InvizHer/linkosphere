
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { Edit2, ExternalLink, Link as LinkIcon, Search, SlidersHorizontal, Eye, Calendar, Trash2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ITEMS_PER_PAGE = 10;

const ManageLinks = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [links, setLinks] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"views" | "created_at">("created_at");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 container mx-auto px-2 sm:px-4 py-4 sm:py-6 mb-20">
      <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-100 dark:border-gray-700 shadow-lg">
        <CardHeader className="pb-2 sm:pb-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 sm:gap-4">
            <div>
              <CardTitle className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Manage Links
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                View and manage all your shortened links
              </CardDescription>
            </div>
            <div className="flex gap-2 sm:gap-3">
              <Button 
                variant="outline" 
                size="sm"
                className={`px-2 py-1 text-xs sm:text-sm ${viewMode === 'list' ? 'bg-primary text-white' : ''}`}
                onClick={() => setViewMode('list')}
              >
                <LinkIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                List
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className={`px-2 py-1 text-xs sm:text-sm ${viewMode === 'grid' ? 'bg-primary text-white' : ''}`}
                onClick={() => setViewMode('grid')}
              >
                <div className="grid grid-cols-2 gap-0.5 h-3 w-3 sm:h-4 sm:w-4 mr-1">
                  <div className="bg-current rounded-sm"></div>
                  <div className="bg-current rounded-sm"></div>
                  <div className="bg-current rounded-sm"></div>
                  <div className="bg-current rounded-sm"></div>
                </div>
                Grid
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
              <Input
                placeholder="Search links..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-7 sm:pl-9 text-xs sm:text-sm h-8 sm:h-10 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm"
              />
            </div>
            <div className="flex items-center gap-2 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-md border border-gray-200 dark:border-gray-700 px-2 sm:px-3 h-8 sm:h-10">
              <SlidersHorizontal className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
              <select
                className="bg-transparent border-none outline-none py-1 sm:py-2 text-xs sm:text-sm w-full"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "views" | "created_at")}
              >
                <option value="created_at">Sort by Date</option>
                <option value="views">Sort by Views</option>
              </select>
            </div>
          </div>

          {paginatedLinks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 sm:py-12 px-4 text-center">
              <div className="bg-gray-100 dark:bg-gray-800 p-3 sm:p-4 rounded-full mb-3 sm:mb-4">
                <LinkIcon className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
              </div>
              <h3 className="text-base sm:text-lg font-medium mb-1">No links found</h3>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 max-w-md mb-4">
                {searchTerm ? "No links match your search criteria." : "You haven't created any links yet."}
              </p>
              <Button onClick={() => navigate('/dashboard/create')} size="sm" className="text-xs sm:text-sm">
                Create your first link
              </Button>
            </div>
          ) : viewMode === 'list' ? (
            <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="overflow-x-auto -mx-2 px-2">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="py-2 px-2 sm:py-3 sm:px-4 text-xs sm:text-sm">Name</TableHead>
                      <TableHead className="py-2 px-2 sm:py-3 sm:px-4 text-xs sm:text-sm">Views</TableHead>
                      <TableHead className="py-2 px-2 sm:py-3 sm:px-4 text-xs sm:text-sm hidden md:table-cell">Created</TableHead>
                      <TableHead className="py-2 px-2 sm:py-3 sm:px-4 text-xs sm:text-sm">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedLinks.map((link) => (
                      <TableRow
                        key={link.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        <TableCell className="py-2 px-2 sm:py-3 sm:px-4 font-medium text-xs sm:text-sm">
                          <div className="flex items-center gap-1 sm:gap-2">
                            <LinkIcon className="h-3 w-3 sm:h-4 sm:w-4 text-primary shrink-0" />
                            <span className="truncate max-w-[100px] sm:max-w-[150px] md:max-w-[200px]">
                              {link.name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="py-2 px-2 sm:py-3 sm:px-4 text-xs sm:text-sm">
                          <div className="flex items-center gap-1">
                            <Eye className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
                            {link.views}
                          </div>
                        </TableCell>
                        <TableCell className="py-2 px-2 sm:py-3 sm:px-4 text-xs sm:text-sm hidden md:table-cell">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
                            {new Date(link.created_at).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell className="py-1 px-1 sm:py-2 sm:px-2 text-xs sm:text-sm">
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => navigate(`/dashboard/edit?token=${link.token}`)}
                              className="h-6 w-6 sm:h-8 sm:w-8 hover:bg-primary/10"
                              title="Edit"
                            >
                              <Edit2 className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => window.open(`/view?token=${link.token}`, '_blank')}
                              className="h-6 w-6 sm:h-8 sm:w-8 hover:bg-primary/10"
                              title="Open"
                            >
                              <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => copyLinkToClipboard(link)}
                              className="h-6 w-6 sm:h-8 sm:w-8 hover:bg-primary/10"
                              title="Copy"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-4 sm:h-4"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {paginatedLinks.map((link) => (
                <motion.div
                  key={link.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white dark:bg-gray-800/80 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="p-3 sm:p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-1 sm:gap-2">
                        <div className="bg-primary/10 p-1 sm:p-2 rounded-full">
                          <LinkIcon className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                        </div>
                        <h3 className="font-medium text-xs sm:text-sm truncate max-w-[100px] sm:max-w-[150px]">{link.name}</h3>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
                        <span className="text-xs sm:text-sm text-gray-500">{link.views}</span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mb-3 sm:mb-4 flex items-center gap-1">
                      <Calendar className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                      {new Date(link.created_at).toLocaleDateString()}
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
                      <div className="text-[10px] sm:text-xs text-gray-500">
                        /{link.token}
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigate(`/dashboard/edit?token=${link.token}`)}
                          className="h-6 w-6 sm:h-8 sm:w-8 hover:bg-primary/10"
                          title="Edit"
                        >
                          <Edit2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => window.open(`/view?token=${link.token}`, '_blank')}
                          className="h-6 w-6 sm:h-8 sm:w-8 hover:bg-primary/10"
                          title="Open"
                        >
                          <ExternalLink className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => copyLinkToClipboard(link)}
                          className="h-6 w-6 sm:h-8 sm:w-8 hover:bg-primary/10"
                          title="Copy"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-3.5 sm:h-3.5"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center mt-4 sm:mt-6">
              <Pagination>
                <PaginationContent className="gap-1 sm:gap-2">
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      className={`text-xs sm:text-sm h-8 sm:h-10 ${currentPage === 1 ? "pointer-events-none opacity-50" : ""}`}
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <PaginationItem key={page}>
                      <Button
                        variant={currentPage === page ? "default" : "outline"}
                        size="icon"
                        onClick={() => setCurrentPage(page)}
                        className={`h-8 w-8 sm:h-10 sm:w-10 text-xs sm:text-sm ${currentPage === page ? "bg-primary" : ""}`}
                      >
                        {page}
                      </Button>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      className={`text-xs sm:text-sm h-8 sm:h-10 ${currentPage === totalPages ? "pointer-events-none opacity-50" : ""}`}
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
