"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Users, 
  Car, 
  Calendar, 
  CreditCard, 
  MessageSquare, 
  Settings, 
  FileText,
  Menu,
  X,
  Bell,
  Plus,
  LogOut,
  User,
  ChevronDown,
  Wifi,
  WifiOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface AdminLayoutProps {
  children: React.ReactNode;
  currentSection?: string;
}

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  badge?: number;
}

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  profileImageUrl?: string;
}

const sidebarItems: SidebarItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/admin/dashboard'
  },
  {
    id: 'users',
    label: 'User Management',
    icon: Users,
    href: '/admin/users',
    badge: 3
  },
  {
    id: 'vehicles',
    label: 'Vehicle Management',
    icon: Car,
    href: '/admin/vehicles'
  },
  {
    id: 'bookings',
    label: 'Booking Management',
    icon: Calendar,
    href: '/admin/bookings',
    badge: 12
  },
  {
    id: 'payments',
    label: 'Payment Management',
    icon: CreditCard,
    href: '/admin/payments'
  },
  {
    id: 'support',
    label: 'Support Management',
    icon: MessageSquare,
    href: '/admin/support',
    badge: 5
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    href: '/admin/settings'
  },
  {
    id: 'logs',
    label: 'System Logs',
    icon: FileText,
    href: '/admin/logs'
  }
];

export const AdminLayout: React.FC<AdminLayoutProps> = ({ 
  children, 
  currentSection = 'dashboard' 
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [notificationCount, setNotificationCount] = useState(7);
  const [adminUser, setAdminUser] = useState<AdminUser>({
    id: '1',
    name: 'Admin User',
    email: 'admin@gowheels.com',
    role: 'admin',
    profileImageUrl: undefined
  });

  // Check online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [currentSection]);

  const handleLogout = () => {
    // TODO: Implement logout logic
    console.log('Logging out...');
  };

  const handleQuickAction = (action: string) => {
    console.log(`Quick action: ${action}`);
  };

  const sidebarVariants = {
    open: {
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    },
    closed: {
      x: "-100%",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    }
  };

  const overlayVariants = {
    open: {
      opacity: 1,
      visibility: 'visible' as const,
      transition: { duration: 0.2 }
    },
    closed: {
      opacity: 0,
      visibility: 'hidden' as const,
      transition: { duration: 0.2 }
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            variants={overlayVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 z-50 h-full w-64 bg-sidebar border-r border-sidebar-border",
        "lg:translate-x-0 lg:static lg:z-30",
        "transform transition-transform duration-300 ease-in-out lg:transition-none",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <motion.div
          variants={sidebarVariants}
          initial="closed"
          animate={sidebarOpen ? "open" : "closed"}
          className="h-full flex flex-col lg:motion-safe:animate-none"
        >
          {/* Sidebar Header */}
          <div className="p-6 border-b border-sidebar-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
                  <Car className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="text-lg font-display font-bold text-sidebar-foreground">
                    Go Wheels
                  </h2>
                  <p className="text-xs text-sidebar-foreground/60">Admin Panel</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden text-sidebar-foreground hover:bg-sidebar-accent"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {sidebarItems.map((item) => {
              const isActive = currentSection === item.id;
              const Icon = item.icon;
              
              return (
                <motion.a
                  key={item.id}
                  href={item.href}
                  className={cn(
                    "flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                    "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    isActive 
                      ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm" 
                      : "text-sidebar-foreground"
                  )}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <Badge 
                      variant={isActive ? "secondary" : "default"} 
                      className="text-xs min-w-[1.25rem] h-5"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </motion.a>
              );
            })}
          </nav>

          {/* Connection Status */}
          <div className="p-4 border-t border-sidebar-border">
            <div className="flex items-center space-x-2 text-xs text-sidebar-foreground/60">
              {isOnline ? (
                <>
                  <Wifi className="h-3 w-3 text-green-500" />
                  <span>Connected</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-3 w-3 text-red-500" />
                  <span>Offline</span>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </aside>

      {/* Main Content */}
      <div className="lg:ml-64 min-h-screen flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 border-b border-border">
          <div className="flex items-center justify-between px-4 py-3">
            {/* Left Section */}
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              
              <div className="hidden md:block">
                <h1 className="text-xl font-display font-bold">
                  {sidebarItems.find(item => item.id === currentSection)?.label || 'Dashboard'}
                </h1>
                <p className="text-sm text-muted-foreground">
                  Manage your Go Wheels platform
                </p>
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-4">
              {/* Quick Actions */}
              <div className="hidden md:flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAction('new-booking')}
                  className="text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  New Booking
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAction('add-vehicle')}
                  className="text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Vehicle
                </Button>
              </div>

              {/* Notifications */}
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-4 w-4" />
                {notificationCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]"
                  >
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </Badge>
                )}
              </Button>

              {/* Admin User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={adminUser.profileImageUrl} alt={adminUser.name} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {adminUser.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{adminUser.name}</p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {adminUser.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;