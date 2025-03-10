
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
  CardFooter,
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
  PlusCircle,
  Copy,
  Eye,
  Calendar,
  Clock,
  Lock,
  Unlock,
  Filter,
  Check,
  SlidersHorizontal,
  ArrowUpRight,
  BarChart2,
  Clipboard,
  Globe,
  Download
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ITEMS_PER_PAGE = 10;

const ManageLinks = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [links, setLinks] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"views" | "created_at">("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<"grid" | "list">(isMobile ? "grid" : "list");
  const [filterBy, setFilterBy] = useState<"all" | "password" | "no-password">("all");

  useEffect(() => {
    fetchLinks();
  }, [sortBy, sortOrder, filterBy]);

  useEffect(() => {
    if (isMobile) {
      setViewMode("grid");
    }
  }, [isMobile]);

  const fetchLinks = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from("links")
        .select("*")
        .eq("user_id", user?.id)
        .order(sortBy, { ascending: sortOrder === "asc" });

      if (filterBy === "password") {
        query = query.not("password", "is", null);
      } else if (filterBy === "no-password") {
        query = query.is("password", null);
      }

      const { data, error } = await query;

      if (error) throw error;

      setLinks(data || []);
      setLoading(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const filteredLinks = links.filter((link) =>
    link.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    link.original_url.toLowerCase().includes(searchTerm.toLowerCase())
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
      variant: "success",
    });
  };

  const handleEditLink = (link: any) => {
    navigate(`/dashboard/edit/${link.id}`);
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return "Today";
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    } else {
      return format(date, 'MMM d, yyyy');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-2 sm:px-4 py-6 mb-20 max-w-6xl">
      <Card className="bg-white/90 dark:bg-indigo-950/20 backdrop-blur-sm border border-indigo-100/50 dark:border-indigo-800/30 shadow-lg rounded-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-indigo-50/90 to-purple-50/90 dark:from-indigo-950/50 dark:to-purple-950/50 border-b border-indigo-100/50 dark:border-indigo-800/30 pb-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg text-white">
                  <LinkIcon className="h-5 w-5" />
                </div>
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Manage Links
                </CardTitle>
              </div>
              <CardDescription className="text-indigo-500 dark:text-indigo-400 mt-1">
                Organize and manage your shortened links
              </CardDescription>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="outline" 
                size="sm"
                onClick={() => setViewMode('list')}
                className={`${viewMode === 'list' ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white' : ''}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><line x1="8" x2="21" y1="6" y2="6"></line><line x1="8" x2="21" y1="12" y2="12"></line><line x1="8" x2="21" y1="18" y2="18"></line><line x1="3" x2="3.01" y1="6" y2="6"></line><line x1="3" x2="3.01" y1="12" y2="12"></line><line x1="3" x2="3.01" y1="18" y2="18"></line></svg>
                List
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setViewMode('grid')}
                className={`${viewMode === 'grid' ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white' : ''}`}
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
                variant="gradient"
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
                placeholder="Search by name or URL..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-white dark:bg-indigo-900/10 border-indigo-200 dark:border-indigo-800/30 placeholder:text-indigo-300 dark:placeholder:text-indigo-600"
              />
            </div>
            
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="default" className="gap-2">
                    <Filter className="h-4 w-4" />
                    <span className="hidden sm:inline">Filter</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Filter Links</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => setFilterBy("all")} 
                    className="flex items-center justify-between"
                  >
                    All Links
                    {filterBy === "all" && <Check className="h-4 w-4" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setFilterBy("password")} 
                    className="flex items-center justify-between"
                  >
                    Password Protected
                    {filterBy === "password" && <Check className="h-4 w-4" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setFilterBy("no-password")} 
                    className="flex items-center justify-between"
                  >
                    Not Protected
                    {filterBy === "no-password" && <Check className="h-4 w-4" />}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="default" className="gap-2">
                    <SlidersHorizontal className="h-4 w-4" />
                    <span className="hidden sm:inline">Sort</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Sort By</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => {
                      setSortBy("created_at");
                      setSortOrder("desc");
                    }} 
                    className="flex items-center justify-between"
                  >
                    Newest First
                    {sortBy === "created_at" && sortOrder === "desc" && <Check className="h-4 w-4" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => {
                      setSortBy("created_at");
                      setSortOrder("asc");
                    }} 
                    className="flex items-center justify-between"
                  >
                    Oldest First
                    {sortBy === "created_at" && sortOrder === "asc" && <Check className="h-4 w-4" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => {
                      setSortBy("views");
                      setSortOrder("desc");
                    }} 
                    className="flex items-center justify-between"
                  >
                    Most Views
                    {sortBy === "views" && sortOrder === "desc" && <Check className="h-4 w-4" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => {
                      setSortBy("views");
                      setSortOrder("asc");
                    }} 
                    className="flex items-center justify-between"
                  >
                    Least Views
                    {sortBy === "views" && sortOrder === "asc" && <Check className="h-4 w-4" />}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {paginatedLinks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 p-6 rounded-full mb-4 text-indigo-500 dark:text-indigo-300">
                <LinkIcon className="h-10 w-10" />
              </div>
              <h3 className="text-xl font-medium mb-2 text-indigo-700 dark:text-indigo-300">No links found</h3>
              <p className="text-indigo-500 dark:text-indigo-400 max-w-md mb-6">
                {searchTerm ? "No links match your search criteria." : "You haven't created any links yet."}
              </p>
              <Button onClick={() => navigate('/dashboard/create')} variant="gradient">
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
                      <TableHead className="hidden md:table-cell text-indigo-700 dark:text-indigo-300">Created</TableHead>
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
                            <div className={`p-1.5 rounded-full ${link.password ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600' : 'bg-indigo-100 dark:bg-indigo-800/30 text-indigo-600'} dark:text-indigo-300`}>
                              {link.password ? (
                                <Lock className="h-3.5 w-3.5" />
                              ) : (
                                <LinkIcon className="h-3.5 w-3.5" />
                              )}
                            </div>
                            <div>
                              <span className="truncate max-w-[150px] sm:max-w-[200px] text-indigo-700 dark:text-indigo-300 block">
                                {link.name}
                              </span>
                              <span className="text-xs text-indigo-400 dark:text-indigo-500 truncate max-w-[150px] sm:max-w-[200px] block">
                                /{link.token}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-indigo-600/80 dark:text-indigo-400/80">
                          <div className="flex items-center gap-1">
                            <Eye className="h-3.5 w-3.5" />
                            {link.views || 0}
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-indigo-600/80 dark:text-indigo-400/80">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {getTimeAgo(link.created_at)}
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
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="hover:bg-indigo-100 dark:hover:bg-indigo-800/30 text-indigo-600 dark:text-indigo-400"
                                >
                                  <SlidersHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Link Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => copyLinkToClipboard(link)}>
                                  <Copy className="h-4 w-4 mr-2" />
                                  Copy Link
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => navigate(`/dashboard/stats?id=${link.id}`)}>
                                  <BarChart2 className="h-4 w-4 mr-2" />
                                  View Stats
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => window.open(link.original_url, '_blank')}>
                                  <ArrowUpRight className="h-4 w-4 mr-2" />
                                  Visit Original
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence>
                {paginatedLinks.map((link, index) => (
                  <motion.div
                    key={link.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="group"
                  >
                    <Card className="overflow-hidden h-full border border-indigo-100/80 dark:border-indigo-800/30 bg-white/80 dark:bg-indigo-900/20 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
                      <div className={`h-1.5 ${link.password ? 'bg-gradient-to-r from-amber-400 to-orange-400' : 'bg-gradient-to-r from-indigo-500 to-purple-500'}`}></div>
                      
                      <CardHeader className="p-4 pb-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-3">
                            <div className={`p-2.5 rounded-lg ${
                              link.password 
                                ? 'bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/20 text-amber-600 dark:text-amber-400' 
                                : 'bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/20 text-indigo-600 dark:text-indigo-400'
                            }`}>
                              {link.password ? <Lock className="h-5 w-5" /> : <Globe className="h-5 w-5" />}
                            </div>
                            <div>
                              <h3 className="font-semibold truncate max-w-[150px] text-indigo-800 dark:text-indigo-200">
                                {link.name}
                              </h3>
                              <div className="flex items-center gap-2 mt-1 text-xs text-indigo-500 dark:text-indigo-400">
                                <Clock className="h-3 w-3" />
                                <span>{getTimeAgo(link.created_at)}</span>
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
                      </CardHeader>
                      
                      <CardContent className="p-4 pt-2">
                        <div className="space-y-3">
                          <div>
                            <div className="text-xs text-indigo-400 dark:text-indigo-500 mb-1">Original URL:</div>
                            <div className="text-xs bg-indigo-50/80 dark:bg-indigo-900/20 p-2 rounded truncate text-indigo-600 dark:text-indigo-400">
                              {link.original_url}
                            </div>
                          </div>
                          
                          <div>
                            <div className="text-xs text-indigo-400 dark:text-indigo-500 mb-1">Short Link:</div>
                            <div className="relative group/copy">
                              <div 
                                className="text-xs bg-indigo-50/80 dark:bg-indigo-900/20 p-2 rounded truncate font-mono text-indigo-600 dark:text-indigo-400 pr-8"
                                onClick={() => copyLinkToClipboard(link)}
                              >
                                {window.location.origin}/view?token={link.token}
                              </div>
                              <button 
                                className="absolute right-2 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100 transition-opacity" 
                                onClick={() => copyLinkToClipboard(link)}
                              >
                                <Copy className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                              </button>
                              <div className="absolute right-0 top-0 opacity-0 group-hover/copy:opacity-100 transition-opacity bg-black text-white text-[10px] py-1 px-2 rounded -mt-8 pointer-events-none">
                                Copy
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                      
                      <CardFooter className="flex items-center justify-between p-4 pt-0 mt-2 gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full gap-1 text-xs border-indigo-200 dark:border-indigo-800/30"
                          onClick={() => window.open(`/view?token=${link.token}`, '_blank')}
                        >
                          <ExternalLink className="h-3 w-3" />
                          Open
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full gap-1 text-xs border-indigo-200 dark:border-indigo-800/30"
                          onClick={() => handleEditLink(link)}
                        >
                          <Edit2 className="h-3 w-3" />
                          Edit
                        </Button>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="border-indigo-200 dark:border-indigo-800/30"
                            >
                              <SlidersHorizontal className="h-3.5 w-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>Link Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => copyLinkToClipboard(link)}>
                              <Copy className="h-4 w-4 mr-2" />
                              Copy Link
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate(`/dashboard/stats?id=${link.id}`)}>
                              <BarChart2 className="h-4 w-4 mr-2" />
                              View Stats
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => window.open(link.original_url, '_blank')}>
                              <ArrowUpRight className="h-4 w-4 mr-2" />
                              Visit Original
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => window.open(`data:text/plain;charset=utf-8,${encodeURIComponent(JSON.stringify(link, null, 2))}`, '_blank')}
                              className="text-blue-600 dark:text-blue-400"
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Export Data
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </CardFooter>
                    </Card>
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
                        className={currentPage === page ? "bg-gradient-to-r from-indigo-600 to-purple-600" : "bg-white dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800/30"}
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
              variant="gradient"
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
