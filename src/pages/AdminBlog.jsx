import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { api } from '@/api/apiClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { 
  Plus, Edit, Trash2, Eye, EyeOff, Search, ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function AdminBlog() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    const checkAuth = async () => {
      const isAuth = await api.auth.isAuthenticated();
      if (!isAuth) {
        api.auth.redirectToLogin(createPageUrl('AdminBlog'));
        return;
      }
      const userData = await api.auth.me();
      setUser(userData);
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  const { data: posts = [] } = useQuery({
    queryKey: ['admin-blog-posts'],
    queryFn: () => api.entities.Blog.list('-created_date', 100)
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.entities.Blog.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] });
      setDeleteId(null);
    }
  });

  const togglePublishMutation = useMutation({
    mutationFn: ({ id, is_published }) => 
      api.entities.Blog.update(id, { is_published }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] });
    }
  });

  const filteredPosts = posts.filter(post =>
    post.title?.toLowerCase().includes(search.toLowerCase()) ||
    post.excerpt?.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
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
        <div className="flex items-center gap-4 mb-8">
          <Link to={createPageUrl('AdminDashboard')}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-serif text-[#2D2D2D]">Blog Posts</h1>
            <p className="text-[#5A5A5A] mt-1">Manage your blog content</p>
          </div>
          <Link to={createPageUrl('AdminBlogEdit')}>
            <Button className="bg-[#2D2D2D] hover:bg-[#3D3D3D] rounded-none">
              <Plus className="w-4 h-4 mr-2" />
              Create Post
            </Button>
          </Link>
        </div>

        {/* Search */}
        <div className="mb-6 relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Search posts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 rounded-none"
          />
        </div>

        {/* Posts Grid */}
        {filteredPosts.length === 0 ? (
          <Card className="border-0 shadow-md">
            <CardContent className="p-12 text-center">
              <p className="text-[#5A5A5A]">No blog posts found.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="border-0 shadow-md hover:shadow-lg transition-shadow h-full flex flex-col">
                  {post.featured_image && (
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={post.featured_image}
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardContent className="p-6 flex-1 flex flex-col">
                    <div className="flex items-start justify-between mb-3">
                      <Badge className={post.is_published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {post.is_published ? 'Published' : 'Draft'}
                      </Badge>
                      <button
                        onClick={() => togglePublishMutation.mutate({
                          id: post.id,
                          is_published: !post.is_published
                        })}
                        className="text-[#5A5A5A] hover:text-[#C4785A]"
                      >
                        {post.is_published ? (
                          <Eye className="w-4 h-4" />
                        ) : (
                          <EyeOff className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    <h3 className="font-serif text-lg text-[#2D2D2D] mb-2 line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-sm text-[#5A5A5A] mb-3 line-clamp-2 flex-1">
                      {post.excerpt || post.content?.substring(0, 100) + '...'}
                    </p>
                    <p className="text-xs text-[#8B9A7D] mb-4">
                      {post.published_date
                        ? format(new Date(post.published_date), 'MMM d, yyyy')
                        : format(new Date(post.created_date), 'MMM d, yyyy')
                      }
                    </p>
                    <div className="flex gap-2">
                      <Link to={createPageUrl(`AdminBlogEdit?id=${post.id}`)} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full rounded-none">
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeleteId(post.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-none"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Delete Confirmation */}
        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Post</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this blog post? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteMutation.mutate(deleteId)}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}