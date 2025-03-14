
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
import { motion, AnimatePresence } from "framer-motion";
import { 
  Edit2, 
  ExternalLink, 
  Link as LinkIcon, 
  Search, 
  SlidersHorizontal, 
  Eye, 
  Calendar, 
  Lock,
  Unlock,
  Copy,
  Trash2,
  Sparkles,
  Filter,
  PlusCircle
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 container mx-auto px-2 sm:px-4 py-6 mb-20">
      <Card className="bg-white/90 dark:bg-indigo-950/20 backdrop-blur-sm border border-indigo-100/50 dark:border-indigo-800/30 shadow-lg rounded-xl overflow-hidden">
        <CardHeader className="pb-4 border-b border-indigo-100/50 dark:border-indigo-800/30">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-800/30 rounded-lg text-indigo-600 dark:text-indigo-300">
                  <LinkIcon className="h-5 w-5" />
                </div>
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Manage Links
                </CardTitle>
              </div>
              <CardDescription className="text-indigo-500 dark:text-indigo-400 mt-1">
                Organize and manage all your shortened links
              </CardDescription>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="outline" 
                size="sm"
                onClick={() => setViewMode('list')}
                className={`border border-indigo-200 dark:border-indigo-800/30 ${viewMode === 'list' ? 'bg-indigo-500 text-white dark:bg-indigo-600' : 'bg-white/80 dark:bg-indigo-950/30'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><line x1="8" x2="21" y1="6" y2="6"></line><line x1="8" x2="21" y1="12" y2="12"></line><line x1="8" x2="21" y1="18" y2="18"></line><line x1="3" x2="3.01" y1="6" y2="6"></line><line x1="3" x2="3.01" y1="12" y2="12"></line><line x1="3" x2="3.01" y1="18" y2="18"></line></svg>
                List
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setViewMode('grid')}
                className={`border border-indigo-200 dark:border-indigo-800/30 ${viewMode === 'grid' ? 'bg-indigo-500 text-white dark:bg-indigo-600' : 'bg-white/80 dark:bg-indigo-950/30'}`}
              >
                <div className="grid grid-cols-2 gap-0.5 h-4 w-4 mr-1">
                  <div className="bg-current rounded-sm"></div>
                  <div className="bg-current rounded-sm"></div>
                  <div className="bg-current rounded-sm"></div>
                  <div className="bg-current rounded-sm"></div>
                </div>
                Grid
              </Button>
              
              <Button 
                variant="default"
                size="sm"
                className="hidden sm:flex"
                onClick={() => navigate('/dashboard/create')}
              >
                <PlusCircle className="h-4 w-4 mr-1" /> 
                New Link
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6 px-2 sm:px-6 py-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400">
                <Search className="h-4 w-4" />
              </div>
              <Input
                placeholder="Search your links..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-white/50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800/30 placeholder:text-indigo-300 dark:placeholder:text-indigo-600"
              />
            </div>
            
            <div className="flex items-center gap-2 bg-white/50 dark:bg-indigo-900/20 backdrop-blur-sm rounded-md border border-indigo-200 dark:border-indigo-800/30 px-3 text-indigo-500 dark:text-indigo-400">
              <Filter className="h-4 w-4" />
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
              <div className="bg-indigo-100 dark:bg-indigo-800/30 p-6 rounded-full mb-4 text-indigo-500 dark:text-indigo-300">
                <LinkIcon className="h-10 w-10" />
              </div>
              <h3 className="text-xl font-medium mb-2 text-indigo-700 dark:text-indigo-300">No links found</h3>
              <p className="text-indigo-500 dark:text-indigo-400 max-w-md mb-6">
                {searchTerm ? "No links match your search criteria." : "You haven't created any links yet."}
              </p>
              <Button onClick={() => navigate('/dashboard/create')}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Create your first link
              </Button>
            </div>
          ) : viewMode === 'list' ? (
            <div className="overflow-hidden rounded-xl border border-indigo-100 dark:border-indigo-800/30">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-indigo-50/80 dark:bg-indigo-900/30">
                      <TableHead className="text-indigo-700 dark:text-indigo-300">Name</TableHead>
                      <TableHead className="hidden sm:table-cell text-indigo-700 dark:text-indigo-300">Views</TableHead>
                      <TableHead className="hidden sm:table-cell text-indigo-700 dark:text-indigo-300">Created</TableHead>
                      <TableHead className="text-right text-indigo-700 dark:text-indigo-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedLinks.map((link) => (
                      <TableRow
                        key={link.id}
                        className="hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 border-b border-indigo-100 dark:border-indigo-800/20"
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-full bg-indigo-100 dark:bg-indigo-800/30 text-indigo-600 dark:text-indigo-300">
                              {link.password ? (
                                <Lock className="h-3.5 w-3.5" />
                              ) : (
                                <LinkIcon className="h-3.5 w-3.5" />
                              )}
                            </div>
                            <span className="truncate max-w-[150px] sm:max-w-[200px] text-indigo-700 dark:text-indigo-300">
                              {link.name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-indigo-600/80 dark:text-indigo-400/80">
                          <div className="flex items-center gap-1">
                            <Eye className="h-3.5 w-3.5" />
                            {link.views || 0}
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-indigo-600/80 dark:text-indigo-400/80">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {new Date(link.created_at).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditLink(link)}
                              className="hover:bg-indigo-100 dark:hover:bg-indigo-800/30 text-indigo-600 dark:text-indigo-400"
                              title="Edit"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => window.open(`/view?token=${link.token}`, '_blank')}
                              className="hover:bg-indigo-100 dark:hover:bg-indigo-800/30 text-indigo-600 dark:text-indigo-400"
                              title="Open"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => copyLinkToClipboard(link)}
                              className="hover:bg-indigo-100 dark:hover:bg-indigo-800/30 text-indigo-600 dark:text-indigo-400"
                              title="Copy"
                            >
                              <Copy className="h-4 w-4" />
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
              <AnimatePresence>
                {paginatedLinks.map((link, index) => (
                  <motion.div
                    key={link.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="group relative rounded-xl overflow-hidden"
                  >
                    {/* Card background with gradient hover effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 to-purple-500/0 opacity-0 group-hover:opacity-100 group-hover:from-indigo-500/10 group-hover:to-purple-500/10 transition-all duration-300 rounded-xl"></div>
                    
                    {/* Card content */}
                    <div className="relative bg-white dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/30 shadow-sm hover:shadow-md transition-all duration-300 rounded-xl overflow-hidden">
                      {/* Top colored bar based on password protection */}
                      <div className={`h-1.5 ${link.password ? 'bg-amber-400' : 'bg-indigo-500'}`}></div>
                      
                      {/* Card header with name and type */}
                      <div className="p-4 pb-2">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className={`p-2 rounded-lg ${
                              link.password 
                                ? 'bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400' 
                                : 'bg-indigo-100 dark:bg-indigo-800/30 text-indigo-600 dark:text-indigo-400'
                            }`}>
                              {link.password ? <Lock className="h-4 w-4" /> : <LinkIcon className="h-4 w-4" />}
                            </div>
                            <div>
                              <h3 className="font-semibold truncate max-w-[150px] text-indigo-800 dark:text-indigo-200">
                                {link.name}
                              </h3>
                              <div className="flex items-center gap-1 text-xs text-indigo-500 dark:text-indigo-400">
                                <Calendar className="h-3 w-3" />
                                <span>{new Date(link.created_at).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                          
                          <Badge 
                            variant="outline" 
                            className="flex items-center gap-1 text-xs bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-700/30"
                          >
                            <Eye className="h-3 w-3 text-indigo-500" />
                            {link.views || 0}
                          </Badge>
                        </div>
                        
                        {/* Link token display */}
                        <div className="py-2 px-3 bg-indigo-50/80 dark:bg-indigo-900/30 rounded-md text-xs font-mono text-indigo-600 dark:text-indigo-400 truncate mt-2">
                          /{link.token}
                        </div>
                      </div>
                      
                      {/* Actions footer */}
                      <div className="flex items-center justify-between p-3 border-t border-indigo-100 dark:border-indigo-800/30 bg-indigo-50/50 dark:bg-indigo-900/10">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-xs bg-white/80 dark:bg-indigo-900/40 hover:bg-indigo-100 dark:hover:bg-indigo-800/30 border border-indigo-100 dark:border-indigo-800/30 rounded-full"
                          onClick={() => copyLinkToClipboard(link)}
                        >
                          <Copy className="h-3 w-3 mr-1" /> Copy
                        </Button>
                        
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditLink(link)}
                            className="h-8 w-8 rounded-full bg-white/80 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-800/50 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800/30"
                            title="Edit"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => window.open(`/view?token=${link.token}`, '_blank')}
                            className="h-8 w-8 rounded-full bg-white/80 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-800/50 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800/30"
                            title="Open"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      className={`${currentPage === 1 ? "pointer-events-none opacity-50" : ""} bg-white dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800/30`}
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <PaginationItem key={page} className="hidden sm:block">
                      <Button
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className={currentPage === page ? "bg-indigo-500" : "bg-white dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800/30"}
                      >
                        {page}
                      </Button>
                    </PaginationItem>
                  ))}
                  <PaginationItem className="sm:hidden">
                    <span className="text-sm text-indigo-700 dark:text-indigo-300">{currentPage} / {totalPages}</span>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      className={`${currentPage === totalPages ? "pointer-events-none opacity-50" : ""} bg-white dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800/30`}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
          
          {/* Mobile "Create New" button */}
          <div className="sm:hidden flex justify-center">
            <Button 
              className="w-full"
              onClick={() => navigate('/dashboard/create')}
            >
              <PlusCircle className="h-4 w-4 mr-2" /> 
              Create New Link
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManageLinks;
