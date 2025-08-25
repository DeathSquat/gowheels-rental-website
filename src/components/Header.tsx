"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, LogIn, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";

interface User {
  id: string;
  email: string;
  name: string;
}

interface FormData {
  name: string;
  email: string;
  password: string;
}

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
  });

  // Handle scroll effect for sticky header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success("Connection restored");
    };
    const handleOffline = () => {
      setIsOnline(false);
      toast.error("Connection lost");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Load user from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (error) {
          console.error("Failed to parse saved user:", error);
          localStorage.removeItem("user");
        }
      }
    }
  }, []);

  const saveUser = (userData: User) => {
    setUser(userData);
    if (typeof window !== "undefined") {
      localStorage.setItem("user", JSON.stringify(userData));
    }
  };

  const clearUser = () => {
    setUser(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("user");
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate Convex API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      if (authMode === "signup") {
        // Simulate user creation
        const newUser: User = {
          id: Math.random().toString(36).substr(2, 9),
          email: formData.email,
          name: formData.name,
        };
        
        saveUser(newUser);
        setAuthModalOpen(false);
        toast.success("Account created successfully! Welcome to Go Wheels!");
        
        // Simulate backend welcome email call
        try {
          await new Promise(resolve => setTimeout(resolve, 1000));
          toast.success("Welcome email sent!");
        } catch (error) {
          toast.error("Failed to send welcome email, but your account is ready!");
        }
      } else {
        // Simulate login
        const loginUser: User = {
          id: Math.random().toString(36).substr(2, 9),
          email: formData.email,
          name: formData.name || formData.email.split("@")[0],
        };
        
        saveUser(loginUser);
        setAuthModalOpen(false);
        toast.success("Welcome back!");
      }

      setFormData({ name: "", email: "", password: "" });
    } catch (error) {
      toast.error("Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const openAuthModal = (mode: "login" | "signup") => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const handleLogout = () => {
    clearUser();
    toast.success("Logged out successfully");
  };

  const navLinks = [
    { href: "/fleet", label: "Fleet" },
    { href: "/how-it-works", label: "How it Works" },
    { href: "/pricing", label: "Pricing" },
    { href: "/support", label: "Support" },
  ];

  return (
    <>
      <header
        className={`sticky top-0 z-50 w-full border-b border-border/40 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 transition-all duration-200 ${
          isScrolled ? "shadow-sm" : ""
        }`}
      >
        <div className="container flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
              GW
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-lg leading-tight">Go Wheels</span>
              <span className="text-xs text-muted-foreground leading-tight">
                Affordable Rides · Pure comfort · Your Journey
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm px-2 py-1"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center space-x-3">
            {/* Network Status Indicator */}
            <div className={`h-2 w-2 rounded-full ${isOnline ? "bg-green-500" : "bg-red-500"}`} />

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {user.name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{user.name || "User"}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem>Profile</DropdownMenuItem>
                  <DropdownMenuItem>Bookings</DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>Log out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openAuthModal("login")}
                  className="hidden sm:inline-flex"
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  Log in
                </Button>
                <Button size="sm" onClick={() => openAuthModal("signup")}>
                  Get started
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </>
            )}

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col space-y-4 mt-6">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="text-lg font-medium hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))}
                  {!user && (
                    <div className="flex flex-col space-y-2 pt-4 border-t">
                      <Button variant="ghost" onClick={() => openAuthModal("login")}>
                        Log in
                      </Button>
                      <Button onClick={() => openAuthModal("signup")}>Get started</Button>
                    </div>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Auth Modal */}
      <Dialog open={authModalOpen} onOpenChange={setAuthModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {authMode === "login" ? "Welcome back" : "Create your account"}
            </DialogTitle>
          </DialogHeader>
          <Tabs value={authMode} onValueChange={(value) => setAuthMode(value as "login" | "signup")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Log in</TabsTrigger>
              <TabsTrigger value="signup">Sign up</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Signing in..." : "Sign in"}
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="signup">
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full name</Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Creating account..." : "Create account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Header;