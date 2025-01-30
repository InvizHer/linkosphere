import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

const ViewLink = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [link, setLink] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const fetchLink = async () => {
      if (!token) {
        setError("Invalid link");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("links")
        .select("*")
        .eq("token", token)
        .single();

      if (error) {
        setError("Link not found");
        setLoading(false);
        return;
      }

      setLink(data);
      setLoading(false);

      // Increment views
      await supabase.rpc("increment_link_views", { link_id: data.id });
    };

    fetchLink();
  }, [token]);

  const handlePasswordSubmit = () => {
    if (password === link.password) {
      window.location.href = link.original_url;
    } else {
      toast({
        title: "Error",
        description: "Incorrect password",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        {link.thumbnail_url && (
          <img
            src={link.thumbnail_url}
            alt={link.name}
            className="w-full h-48 object-cover"
          />
        )}
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-2">{link.name}</h1>
          {link.description && (
            <p className="text-gray-600 mb-4">{link.description}</p>
          )}
          <div className="flex items-center text-sm text-gray-500 mb-4">
            <span>Views: {link.views}</span>
            <span className="mx-2">•</span>
            <span>
              Created:{" "}
              {new Date(link.created_at).toLocaleDateString()}
            </span>
          </div>
          {link.password ? (
            <div className="space-y-4">
              {link.show_password && (
                <div className="text-sm text-gray-500">
                  Password: {link.password}
                </div>
              )}
              <Input
                type="password"
                placeholder="Enter password to access link"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Button
                className="w-full"
                onClick={handlePasswordSubmit}
              >
                Access Link
              </Button>
            </div>
          ) : (
            <Button
              className="w-full"
              onClick={() => window.location.href = link.original_url}
            >
              Visit Link
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewLink;