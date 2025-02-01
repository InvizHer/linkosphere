import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  Facebook, 
  Twitter, 
  MessageCircle, 
  Share2, 
  MessageSquare 
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
}

const ShareModal = ({ isOpen, onClose, url }: ShareModalProps) => {
  const shareOptions = [
    {
      name: "WhatsApp",
      icon: MessageSquare,
      color: "#25D366",
      url: `https://wa.me/?text=${encodeURIComponent(url)}`,
    },
    {
      name: "Telegram",
      icon: MessageCircle,
      color: "#0088cc",
      url: `https://t.me/share/url?url=${encodeURIComponent(url)}`,
    },
    {
      name: "Facebook",
      icon: Facebook,
      color: "#1877f2",
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        url
      )}`,
    },
    {
      name: "Twitter",
      icon: Twitter,
      color: "#1da1f2",
      url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}`,
    },
  ];

  const handleShare = (shareUrl: string) => {
    window.open(shareUrl, "_blank");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-[#9b87f5]" />
            Share Link
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 p-4">
          {shareOptions.map((option) => (
            <Button
              key={option.name}
              variant="outline"
              className="flex items-center gap-2 p-4 hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => handleShare(option.url)}
            >
              <option.icon
                className="h-5 w-5"
                style={{ color: option.color }}
              />
              {option.name}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareModal;