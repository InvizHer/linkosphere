
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
import { Edit2, ExternalLink, Link as LinkIcon, Search, SlidersHorizontal, Eye, Calendar, Trash2, Copy } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-12 w-12 rounded-full border-4 border-sky-500 border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 container mx-auto px-2 sm:px-4 py-6 mb-20">
      <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-sky-100 dark:border-gray-700 shadow-lg rounded-xl overflow-hidden">
        <CardHeader className="pb-4 border-b border-sky-100 dark:border-gray-700">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl font-bold gradient-text">
                Manage Links
              </CardTitle>
              <CardDescription className="text-gray-500 dark:text-gray-400">
                View, edit and track all your shortened links
              </CardDescription>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                size="sm"
                className={`${viewMode === 'list' ? 'bg-sky-500 text-white border-sky-500' : 'border-sky-200'} transition-all`}
                onClick={() => setViewMode('list')}
              >
                <LinkIcon className="h-4 w-4 mr-1" />
                List
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className={`${viewMode === 'grid' ? 'bg-sky-500 text-white border-sky-500' : 'border-sky-200'} transition-all`}
                onClick={() => setViewMode('grid')}
              >
                <div className="grid grid-cols-2 gap-0.5 h-4 w-4 mr-1">
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
        <CardContent className="space-y-6 px-2 sm:px-6 py-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search links..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-sky-100 dark:border-gray-700 focus-visible:ring-sky-500"
              />
            </div>
            <div className="flex items-center gap-2 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-md border border-sky-100 dark:border-gray-700 px-3">
              <SlidersHorizontal className="h-4 w-4 text-sky-500" />
              <select
                className="bg-transparent border-none outline-none py-2 text-sm"
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
              <div className="bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 p-4 rounded-full mb-4">
                <LinkIcon className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-medium mb-1">No links found</h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-md mb-4">
                {searchTerm ? "No links match your search criteria." : "You haven't created any links yet."}
              </p>
              <Button onClick={() => navigate('/dashboard/create')} className="bg-sky-500 hover:bg-sky-600">
                Create your first link
              </Button>
            </div>
          ) : viewMode === 'list' ? (
            <div className="overflow-hidden rounded-xl border border-sky-100 dark:border-gray-700">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-sky-50 dark:bg-sky-900/10">
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
                        className="hover:bg-sky-50 dark:hover:bg-sky-900/10 transition-colors border-b border-sky-100 dark:border-gray-700"
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center text-sky-600 dark:text-sky-400">
                              <LinkIcon className="h-4 w-4" />
                            </div>
                            <span className="truncate max-w-[150px] sm:max-w-[200px] font-medium">
                              {link.name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <div className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
                            <Eye className="h-4 w-4 text-sky-500" />
                            {link.views || 0}
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-gray-700 dark:text-gray-300">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-sky-500" />
                            {new Date(link.created_at).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditLink(link)}
                              className="hover:bg-sky-100 dark:hover:bg-sky-900/20 h-8 w-8 rounded-full"
                              title="Edit"
                            >
                              <Edit2 className="h-4 w-4 text-sky-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => window.open(`/view?token=${link.token}`, '_blank')}
                              className="hover:bg-sky-100 dark:hover:bg-sky-900/20 h-8 w-8 rounded-full"
                              title="Open"
                            >
                              <ExternalLink className="h-4 w-4 text-sky-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => copyLinkToClipboard(link)}
                              className="hover:bg-sky-100 dark:hover:bg-sky-900/20 h-8 w-8 rounded-full"
                              title="Copy"
                            >
                              <Copy className="h-4 w-4 text-sky-600" />
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
                  className="bg-white dark:bg-gray-800/80 rounded-xl border border-sky-100 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-md transition-all hover:-translate-y-1"
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 p-1.5 rounded-full">
                          <LinkIcon className="h-3.5 w-3.5" />
                        </div>
                        <h3 className="font-medium truncate max-w-[100px] xs:max-w-[120px] sm:max-w-[150px]">
                          {link.name}
                        </h3>
                      </div>
                      <div className="flex items-center gap-1 bg-sky-50 dark:bg-sky-900/10 px-2 py-1 rounded-full text-gray-700 dark:text-gray-300">
                        <Eye className="h-3.5 w-3.5 text-sky-500" />
                        <span className="text-xs">{link.views || 0}</span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mb-3 flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-sky-500" />
                      {new Date(link.created_at).toLocaleDateString()}
                    </div>
                    <div className="bg-sky-50 dark:bg-sky-900/10 text-xs rounded-md px-2 py-1.5 mb-3 text-gray-600 dark:text-gray-300 font-mono">
                      /{link.token}
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-sky-100 dark:border-gray-700">
                      <div className="text-xs text-gray-500">
                        {link.password ? "🔒 Password protected" : "🌐 Public"}
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditLink(link)}
                          className="h-7 w-7 hover:bg-sky-100 dark:hover:bg-sky-900/20 rounded-full"
                          title="Edit"
                        >
                          <Edit2 className="h-3 w-3 text-sky-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => window.open(`/view?token=${link.token}`, '_blank')}
                          className="h-7 w-7 hover:bg-sky-100 dark:hover:bg-sky-900/20 rounded-full"
                          title="Open"
                        >
                          <ExternalLink className="h-3 w-3 text-sky-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => copyLinkToClipboard(link)}
                          className="h-7 w-7 hover:bg-sky-100 dark:hover:bg-sky-900/20 rounded-full"
                          title="Copy"
                        >
                          <Copy className="h-3 w-3 text-sky-600" />
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
                      className={`${currentPage === 1 ? "pointer-events-none opacity-50" : ""} border border-sky-100 dark:border-gray-700`}
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <PaginationItem key={page} className="hidden sm:block">
                      <Button
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className={`
                          ${currentPage === page ? "bg-sky-500 border-sky-500" : "border-sky-100 dark:border-gray-700"}
                          rounded-md border
                        `}
                      >
                        {page}
                      </Button>
                    </PaginationItem>
                  ))}
                  <PaginationItem className="sm:hidden">
                    <span className="text-sm px-2">{currentPage} / {totalPages}</span>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      className={`${currentPage === totalPages ? "pointer-events-none opacity-50" : ""} border border-sky-100 dark:border-gray-700`}
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
