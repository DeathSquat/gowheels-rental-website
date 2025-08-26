"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Car, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Plus,
  FileText,
  Bell,
  Settings,
  Activity,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  CreditCard,
  UserPlus,
  MessageSquare
} from 'lucide-react';
import AdminLayout from './layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { LineChart, Line, PieChart, Pie, Cell, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';

interface StatCard {
  title: string;
  value: string;
  subtitle: string;
  trend: number;
  icon: React.ReactNode;
  color: string;
}

interface RecentActivity {
  id: string;
  type: 'booking' | 'user' | 'support' | 'payment';
  title: string;
  subtitle: string;
  time: string;
  status?: string;
}

interface DashboardData {
  stats: {
    totalUsers: number;
    totalVehicles: number;
    activeBookings: number;
    totalRevenue: number;
    userGrowth: number;
    vehicleUtilization: number;
    bookingGrowth: number;
    revenueGrowth: number;
  };
  revenueData: Array<{ month: string; revenue: number }>;
  bookingStatusData: Array<{ name: string; value: number; color: string }>;
  vehicleTypesData: Array<{ type: string; count: number }>;
  userGrowthData: Array<{ month: string; users: number }>;
  recentActivities: RecentActivity[];
  realTimeData: {
    onlineUsers: number;
    todayRevenue: number;
    systemStatus: 'operational' | 'warning' | 'error';
  };
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const mockData: DashboardData = {
    stats: {
      totalUsers: 1247,
      totalVehicles: 85,
      activeBookings: 23,
      totalRevenue: 2847650,
      userGrowth: 12.5,
      vehicleUtilization: 78.5,
      bookingGrowth: 8.3,
      revenueGrowth: 15.2
    },
    revenueData: [
      { month: 'Jan', revenue: 185000 },
      { month: 'Feb', revenue: 198000 },
      { month: 'Mar', revenue: 215000 },
      { month: 'Apr', revenue: 232000 },
      { month: 'May', revenue: 248000 },
      { month: 'Jun', revenue: 265000 },
      { month: 'Jul', revenue: 281000 },
      { month: 'Aug', revenue: 295000 },
      { month: 'Sep', revenue: 312000 },
      { month: 'Oct', revenue: 328000 },
      { month: 'Nov', revenue: 345000 },
      { month: 'Dec', revenue: 362000 }
    ],
    bookingStatusData: [
      { name: 'Confirmed', value: 45, color: '#10b981' },
      { name: 'Pending', value: 28, color: '#f59e0b' },
      { name: 'Active', value: 23, color: '#3b82f6' },
      { name: 'Completed', value: 187, color: '#06b6d4' },
      { name: 'Cancelled', value: 12, color: '#ef4444' }
    ],
    vehicleTypesData: [
      { type: 'Sedan', count: 32 },
      { type: 'SUV', count: 28 },
      { type: 'Hatchback', count: 18 },
      { type: 'Convertible', count: 5 },
      { type: 'Truck', count: 2 }
    ],
    userGrowthData: [
      { month: 'Jul', users: 890 },
      { month: 'Aug', users: 925 },
      { month: 'Sep', users: 1050 },
      { month: 'Oct', users: 1125 },
      { month: 'Nov', users: 1200 },
      { month: 'Dec', users: 1247 }
    ],
    recentActivities: [
      {
        id: '1',
        type: 'booking',
        title: 'New booking confirmed',
        subtitle: 'John Doe - Honda City (BK-20241215-001)',
        time: '2 minutes ago',
        status: 'confirmed'
      },
      {
        id: '2',
        type: 'user',
        title: 'New user registered',
        subtitle: 'Sarah Johnson joined Go Wheels',
        time: '15 minutes ago'
      },
      {
        id: '3',
        type: 'payment',
        title: 'Payment received',
        subtitle: '₹8,500 for booking BK-20241215-002',
        time: '1 hour ago',
        status: 'completed'
      },
      {
        id: '4',
        type: 'support',
        title: 'Support ticket created',
        subtitle: 'Vehicle maintenance query',
        time: '2 hours ago',
        status: 'active'
      },
      {
        id: '5',
        type: 'booking',
        title: 'Booking cancelled',
        subtitle: 'Mike Wilson - BMW 3 Series',
        time: '3 hours ago',
        status: 'cancelled'
      }
    ],
    realTimeData: {
      onlineUsers: 47,
      todayRevenue: 125430,
      systemStatus: 'operational'
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // Simulate API call with mock data
        await new Promise(resolve => setTimeout(resolve, 1000));
        setData(mockData);
        setError(null);
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error('Dashboard data fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const statCards: StatCard[] = data ? [
    {
      title: 'Total Users',
      value: data.stats.totalUsers.toLocaleString(),
      subtitle: `+${data.stats.userGrowth}% from last month`,
      trend: data.stats.userGrowth,
      icon: <Users className="h-6 w-6" />,
      color: 'text-blue-600'
    },
    {
      title: 'Total Vehicles',
      value: data.stats.totalVehicles.toString(),
      subtitle: `${data.stats.vehicleUtilization}% utilization`,
      trend: data.stats.vehicleUtilization,
      icon: <Car className="h-6 w-6" />,
      color: 'text-green-600'
    },
    {
      title: 'Active Bookings',
      value: data.stats.activeBookings.toString(),
      subtitle: `+${data.stats.bookingGrowth}% from last week`,
      trend: data.stats.bookingGrowth,
      icon: <Calendar className="h-6 w-6" />,
      color: 'text-orange-600'
    },
    {
      title: 'Total Revenue',
      value: `₹${(data.stats.totalRevenue / 100000).toFixed(1)}L`,
      subtitle: `+${data.stats.revenueGrowth}% from last month`,
      trend: data.stats.revenueGrowth,
      icon: <DollarSign className="h-6 w-6" />,
      color: 'text-purple-600'
    }
  ] : [];

  const quickActions = [
    {
      title: 'Add New Vehicle',
      description: 'Register a new vehicle',
      icon: <Plus className="h-5 w-5" />,
      action: () => toast.success('Add Vehicle action triggered')
    },
    {
      title: 'Create Booking',
      description: 'Manual booking creation',
      icon: <Calendar className="h-5 w-5" />,
      action: () => toast.success('Create Booking action triggered')
    },
    {
      title: 'Export Reports',
      description: 'Download analytics',
      icon: <FileText className="h-5 w-5" />,
      action: () => toast.success('Export Reports action triggered')
    },
    {
      title: 'View Notifications',
      description: 'Check all alerts',
      icon: <Bell className="h-5 w-5" />,
      action: () => toast.success('View Notifications action triggered')
    },
    {
      title: 'Manage Users',
      description: 'User administration',
      icon: <Users className="h-5 w-5" />,
      action: () => toast.success('Manage Users action triggered')
    },
    {
      title: 'System Settings',
      description: 'Configure platform',
      icon: <Settings className="h-5 w-5" />,
      action: () => toast.success('System Settings action triggered')
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'booking':
        return <Calendar className="h-4 w-4" />;
      case 'user':
        return <UserPlus className="h-4 w-4" />;
      case 'support':
        return <MessageSquare className="h-4 w-4" />;
      case 'payment':
        return <CreditCard className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status?: string) => {
    if (!status) return null;
    
    const variants = {
      confirmed: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      active: 'bg-blue-100 text-blue-700',
      completed: 'bg-cyan-100 text-cyan-700',
      cancelled: 'bg-red-100 text-red-700'
    };

    return (
      <Badge className={variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-700'}>
        {status}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <AdminLayout currentSection="dashboard">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout currentSection="dashboard">
        <div className="flex items-center justify-center min-h-screen">
          <Card className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Error Loading Dashboard</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  if (!data) return null;

  return (
    <AdminLayout currentSection="dashboard">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Dashboard Overview</h1>
            <p className="text-muted-foreground">Welcome back! Here's what's happening with Go Wheels.</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Activity className="h-4 w-4" />
              <span>{data.realTimeData.onlineUsers} users online</span>
            </div>
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
              data.realTimeData.systemStatus === 'operational' ? 'bg-green-100 text-green-700' :
              data.realTimeData.systemStatus === 'warning' ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                data.realTimeData.systemStatus === 'operational' ? 'bg-green-500' :
                data.realTimeData.systemStatus === 'warning' ? 'bg-yellow-500' :
                'bg-red-500'
              }`} />
              System {data.realTimeData.systemStatus}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">{stat.title}</p>
                      <p className="text-3xl font-bold">{stat.value}</p>
                      <div className="flex items-center gap-2">
                        {stat.trend > 0 ? (
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-600" />
                        )}
                        <span className={`text-sm ${stat.trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {stat.subtitle}
                        </span>
                      </div>
                    </div>
                    <div className={`p-3 rounded-lg bg-gray-100 ${stat.color}`}>
                      {stat.icon}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Revenue</CardTitle>
              <CardDescription>Revenue trend over the past 12 months</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Revenue']} />
                  <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Booking Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Booking Status Distribution</CardTitle>
              <CardDescription>Current booking statuses breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data.bookingStatusData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {data.bookingStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Vehicle Types */}
          <Card>
            <CardHeader>
              <CardTitle>Popular Vehicle Types</CardTitle>
              <CardDescription>Vehicle distribution by type</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.vehicleTypesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* User Growth */}
          <Card>
            <CardHeader>
              <CardTitle>User Growth</CardTitle>
              <CardDescription>User registration trend</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={data.userGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="users" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activities */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
              <CardDescription>Latest platform activities and updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 rounded-full">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div>
                        <p className="font-medium">{activity.title}</p>
                        <p className="text-sm text-muted-foreground">{activity.subtitle}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(activity.status)}
                      <span className="text-sm text-muted-foreground">{activity.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common administrative tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3">
                {quickActions.map((action) => (
                  <Button
                    key={action.title}
                    variant="outline"
                    className="justify-start h-auto p-4"
                    onClick={action.action}
                  >
                    <div className="flex items-center gap-3">
                      {action.icon}
                      <div className="text-left">
                        <p className="font-medium">{action.title}</p>
                        <p className="text-sm text-muted-foreground">{action.description}</p>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Today's Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Today's Summary</CardTitle>
            <CardDescription>Key metrics for today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 text-green-600 rounded-full">
                  <DollarSign className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold">₹{data.realTimeData.todayRevenue.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Today's Revenue</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
                  <Calendar className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{data.stats.activeBookings}</p>
                  <p className="text-sm text-muted-foreground">Active Bookings</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 text-purple-600 rounded-full">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{data.realTimeData.onlineUsers}</p>
                  <p className="text-sm text-muted-foreground">Users Online</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}