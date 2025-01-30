import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { User, LogOut, Menu } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion } from "framer-motion";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export const Header = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);

  const isLandingPage = location.pathname === "/";
  const isViewPage = location.pathname.startsWith("/view");

  const menuItems = [
    { label: "Create Link", path: "/dashboard/create" },
    { label: "Manage Links", path: "/dashboard/manage" },
    { label: "Statistics", path: "/dashboard/stats" },
    { label: "Profile", path: "/dashboard/profile" },
  ];

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700"
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(user ? "/dashboard/create" : "/")}
            className="cursor-pointer flex items-center space-x-2"
          >
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              LinkManager
            </span>
          </motion.div>

          <div className="flex items-center space-x-4">
            {!isLandingPage && !isViewPage && (
              <>
                {isMobile ? (
                  <Sheet open={isOpen} onOpenChange={setIsOpen}>
                    <SheetTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Menu className="h-5 w-5" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent>
                      <SheetHeader>
                        <SheetTitle>Menu</SheetTitle>
                      </SheetHeader>
                      <div className="mt-4 space-y-2">
                        {menuItems.map((item) => (
                          <Button
                            key={item.path}
                            variant="ghost"
                            className="w-full justify-start"
                            onClick={() => {
                              navigate(item.path);
                              setIsOpen(false);
                            }}
                          >
                            {item.label}
                          </Button>
                        ))}
                        <Button
                          variant="ghost"
                          className="w-full justify-start text-red-500"
                          onClick={() => {
                            signOut();
                            setIsOpen(false);
                          }}
                        >
                          Sign Out
                        </Button>
                      </div>
                    </SheetContent>
                  </Sheet>
                ) : (
                  <nav className="flex items-center space-x-2">
                    {menuItems.map((item) => (
                      <Button
                        key={item.path}
                        variant="ghost"
                        onClick={() => navigate(item.path)}
                        className={`${
                          location.pathname === item.path
                            ? "bg-primary/10 text-primary"
                            : ""
                        }`}
                      >
                        {item.label}
                      </Button>
                    ))}
                  </nav>
                )}
              </>
            )}

            <ThemeToggle />

            {user && !isMobile && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative"
                  >
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => navigate("/dashboard/profile")}>
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-red-500"
                    onClick={() => signOut()}
                  >
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
};