import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { api } from '@/api/apiClient';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { ArrowLeft, Star, Check, X, Trash2, Search, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useAuth } from '@/lib/AuthContext';

function StarRating({ rating }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${star <= rating ? 'fill-[#C4785A] text-[#C4785A]' : 'text-gray-200'}`}
        />
      ))}
    </div>
  );
}

export default function AdminReviews() {
  const queryClient = useQueryClient();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [deleteId, setDeleteId] = useState(null);

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['admin-reviews'],
    queryFn: () => api.entities.Review.list('-created_date', 200),
    enabled: isAuthenticated,
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products-lookup'],
    queryFn: () => api.entities.Product.list('-created_date', 200),
    enabled: isAuthenticated,
  });

  const productMap = Object.fromEntries(products.map((p) => [p.id, p.name]));

  const filtered = reviews.filter((r) => {
    const matchesSearch =
      r.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
      r.comment?.toLowerCase().includes(search.toLowerCase()) ||
      productMap[r.product_id]?.toLowerCase().includes(search.toLowerCase());

    if (statusFilter === 'pending') return matchesSearch && !r.is_approved;
    if (statusFilter === 'approved') return matchesSearch && r.is_approved;
    return matchesSearch;
  });

  const pendingCount = reviews.filter((r) => !r.is_approved).length;

  const approve = async (id) => {
    await api.entities.Review.update(id, { is_approved: true });
    queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
  };

  const reject = async (id) => {
    await api.entities.Review.update(id, { is_approved: false });
    queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
  };

  const handleDelete = async () => {
    if (deleteId) {
      await api.entities.Review.delete(deleteId);
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
      setDeleteId(null);
    }
  };

  if (authLoading) {
    return (
      <div className="pt-32 pb-16 min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-[#5A5A5A]">Loading...</p>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-16 min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            to={createPageUrl('AdminDashboard')}
            className="inline-flex items-center text-[#5A5A5A] hover:text-[#C4785A] mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-serif text-[#2D2D2D]">Customer Reviews</h1>
              <p className="text-[#5A5A5A] mt-1">
                {reviews.length} total reviews
                {pendingCount > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-amber-100 text-amber-800 text-xs rounded-full">
                    {pendingCount} pending approval
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 mb-6 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by name, product or comment..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 rounded-none"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-48 rounded-none">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Reviews</SelectItem>
              <SelectItem value="pending">Pending Approval</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Reviews List */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white p-6 shadow-md animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-3" />
                <div className="h-3 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white shadow-md p-16 text-center">
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-[#5A5A5A]">
              {statusFilter === 'pending' ? 'No reviews awaiting approval' : 'No reviews found'}
            </p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            <div className="space-y-4">
              {filtered.map((review) => (
                <motion.div
                  key={review.id}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white shadow-md p-6"
                >
                  <div className="flex flex-col md:flex-row md:items-start gap-4">
                    {/* Avatar */}
                    <div className="w-12 h-12 bg-[#C4785A] rounded-full flex items-center justify-center text-white font-medium text-lg flex-shrink-0">
                      {review.customer_name?.charAt(0).toUpperCase() || '?'}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                        <div>
                          <p className="font-medium text-[#2D2D2D]">{review.customer_name}</p>
                          <p className="text-sm text-[#5A5A5A]">{review.customer_email}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge
                            className={
                              review.is_approved
                                ? 'bg-green-100 text-green-800'
                                : 'bg-amber-100 text-amber-800'
                            }
                          >
                            {review.is_approved ? 'Approved' : 'Pending'}
                          </Badge>
                          <span className="text-xs text-[#5A5A5A]">
                            {review.created_date
                              ? format(new Date(review.created_date), 'MMM d, yyyy')
                              : ''}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 mb-3">
                        <StarRating rating={review.rating} />
                        {review.product_id && (
                          <span className="text-sm text-[#8B9A7D]">
                            on <strong>{productMap[review.product_id] || 'Unknown Product'}</strong>
                          </span>
                        )}
                      </div>

                      <p className="text-[#5A5A5A] leading-relaxed">{review.comment}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex md:flex-col gap-2 flex-shrink-0">
                      {!review.is_approved ? (
                        <Button
                          size="sm"
                          onClick={() => approve(review.id)}
                          className="bg-green-600 hover:bg-green-700 text-white rounded-none"
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => reject(review.id)}
                          className="text-amber-600 border-amber-300 hover:bg-amber-50 rounded-none"
                        >
                          <X className="w-4 h-4 mr-1" />
                          Unapprove
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setDeleteId(review.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-none"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Review</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete this review? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
