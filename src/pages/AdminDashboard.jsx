import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { api } from '@/api/apiClient';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Package, ShoppingCart, DollarSign, TrendingUp,
  Plus, Eye, LogOut, FileText, ArrowLeft, Star, MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/lib/AuthContext';

const STATUS_COLORS = {
  pending:    'bg-yellow-100 text-yellow-800',
  confirmed:  'bg-blue-100 text-blue-800',
  processing: 'bg-purple-100 text-purple-800',
  shipped:    'bg-indigo-100 text-indigo-800',
  delivered:  'bg-green-100 text-green-800',
  cancelled:  'bg-red-100 text-red-800',
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();

  const { data: products = [] } = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => api.entities.Product.list('-created_date', 100),
    enabled: isAuthenticated,
  });

  const { data: orders = [] } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: () => api.entities.Order.list('-created_date', 100),
    enabled: isAuthenticated,
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['admin-reviews'],
    queryFn: () => api.entities.Review.list('-created_date', 100),
    enabled: isAuthenticated,
  });

  const totalRevenue  = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const pendingOrders = orders.filter((o) => o.status === 'pending').length;
  const pendingReviews = reviews.filter((r) => !r.is_approved).length;
  const recentOrders  = orders.slice(0, 5);

  const handleLogout = () => api.auth.logout();

  // ── Loading state ──────────────────────────────────────────────────────────
  if (authLoading) {
    return (
      <div className="pt-32 pb-16 min-h-screen bg-gray-50">
        <div className="container mx-auto px-6 lg:px-12">
          <Skeleton className="h-10 w-48 mb-8" />
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32" />)}
          </div>
        </div>
      </div>
    );
  }

  // ── Not authenticated ──────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="pt-32 pb-16 min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-12 text-center max-w-md mx-auto shadow-lg"
        >
          <h1 className="text-2xl font-serif text-[#2D2D2D] mb-4">Admin Access</h1>
          <p className="text-[#5A5A5A] mb-8">Please log in to access the admin dashboard.</p>
          <Button
            onClick={() => navigate('/AdminLogin')}
            className="bg-[#2D2D2D] hover:bg-[#3D3D3D] rounded-none px-8"
          >
            Login to Dashboard
          </Button>
        </motion.div>
      </div>
    );
  }

  const stats = [
    { label: 'Total Products',  value: products.length,           icon: Package,      color: 'bg-blue-500' },
    { label: 'Total Orders',    value: orders.length,             icon: ShoppingCart, color: 'bg-green-500' },
    { label: 'Revenue',         value: `$${totalRevenue.toFixed(2)}`, icon: DollarSign, color: 'bg-[#C4785A]' },
    { label: 'Pending Orders',  value: pendingOrders,             icon: TrendingUp,   color: 'bg-amber-500' },
  ];

  const quickLinks = [
    { to: 'AdminProducts', label: 'Manage Products', desc: 'Add, edit, or remove products', icon: Package,        bg: 'bg-blue-50',   color: 'text-blue-600' },
    { to: 'AdminOrders',   label: 'Manage Orders',   desc: 'View and update customer orders', icon: ShoppingCart, bg: 'bg-green-50',  color: 'text-green-600' },
    { to: 'AdminBlog',     label: 'Manage Blog',     desc: 'Create and edit blog posts',   icon: FileText,        bg: 'bg-purple-50', color: 'text-purple-600' },
    { to: 'AdminReviews',  label: 'Manage Reviews',  desc: `${pendingReviews} awaiting approval`, icon: MessageSquare, bg: 'bg-amber-50', color: 'text-amber-600', badge: pendingReviews },
  ];

  return (
    <div className="pt-28 pb-16 min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 lg:px-12">

        {/* Page header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-serif text-[#2D2D2D]">Admin Dashboard</h1>
            <p className="text-[#5A5A5A] mt-1">Welcome back, {user.full_name || user.email}</p>
          </div>
          <div className="flex gap-3">
            <Link to="/">
              <Button variant="outline" className="rounded-none">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to site
              </Button>
            </Link>
            <Link to={createPageUrl('AdminProducts')}>
              <Button className="bg-[#2D2D2D] hover:bg-[#3D3D3D] rounded-none">
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </Link>
            <Button variant="outline" onClick={handleLogout} className="rounded-none">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="border-0 shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-[#5A5A5A]">{stat.label}</p>
                      <p className="text-3xl font-semibold text-[#2D2D2D] mt-2">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-lg ${stat.color}`}>
                      <stat.icon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Quick links */}
        <div className="grid md:grid-cols-2 gap-6 mb-10">
          {quickLinks.map(({ to, label, desc, icon: Icon, bg, color, badge }) => (
            <Link key={to} to={createPageUrl(to)}>
              <Card className="border-0 shadow-md hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className={`p-4 ${bg} rounded-lg`}>
                    <Icon className={`w-8 h-8 ${color}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-medium text-[#2D2D2D]">{label}</h3>
                      {badge > 0 && (
                        <span className="px-2 py-0.5 bg-amber-500 text-white text-xs rounded-full">
                          {badge}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-[#5A5A5A]">{desc}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Recent orders */}
        <Card className="border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl font-serif">Recent Orders</CardTitle>
            <Link to={createPageUrl('AdminOrders')} className="text-sm text-[#C4785A] hover:underline">
              View All
            </Link>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <p className="text-[#5A5A5A] text-center py-8">No orders yet</p>
            ) : (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-[#2D2D2D]">{order.customer_name}</p>
                      <p className="text-sm text-[#5A5A5A]">
                        {order.items?.length || 0} items · ${order.total?.toFixed(2)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-800'}>
                        {order.status}
                      </Badge>
                      <Link to={createPageUrl(`AdminOrders?id=${order.id}`)}>
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
