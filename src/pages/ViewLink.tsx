import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/layout/Header";
import { useToast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ViewLink = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [link, setLink] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchLink = async () => {
      if (!token) return;

      const { data, error } = await supabase
        .from("links")
        .select("*")
        .eq("token", token)
        .single();

      if (error) {
        toast({
          title: "Error",
          description: "Link not found.",
          variant: "destructive",
        });
        return;
      }

      setLink(data);
    };

    fetchLink();
  }, [token, toast]);

  if (!link) {
    return <div>Loading...</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="container mx-auto px-4 py-8"
    >
      <Header />
      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">{link.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">{link.description}</p>
          <a href={link.original_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
            {link.original_url}
          </a>
          <p className="text-gray-500">Views: {link.views || 0}</p>
          <p className="text-gray-500">Created At: {new Date(link.created_at).toLocaleString()}</p>
          {link.password && <p className="text-red-500">This link is password protected.</p>}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ViewLink;
