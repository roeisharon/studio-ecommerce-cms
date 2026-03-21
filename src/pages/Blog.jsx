import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { api } from '@/api/apiClient';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Calendar, ArrowRight, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

export default function Blog() {
  const [search, setSearch] = useState('');

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['blog-posts'],
    queryFn: () => api.entities.Blog.filter({ is_published: true }, '-published_date', 100)
  });

  const filteredPosts = posts.filter(post =>
    post.title?.toLowerCase().includes(search.toLowerCase()) ||
    post.excerpt?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="pt-32 pb-16 bg-[#FAF7F2] min-h-screen">
      <div className="container mx-auto px-6 lg:px-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <span className="text-[#C4785A] text-sm tracking-[0.3em] uppercase font-medium">
            Stories & Insights
          </span>
          <h1 className="mt-3 text-5xl md:text-6xl font-serif text-[#2D2D2D]">
            From the Studio
          </h1>
          <p className="mt-4 text-[#5A5A5A] max-w-2xl mx-auto">
            Thoughts on craft, creativity, and the beauty of handmade objects.
          </p>
        </motion.div>

        {/* Search */}
        <div className="max-w-md mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search posts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 rounded-full border-gray-300"
            />
          </div>
        </div>

        {/* Posts Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white overflow-hidden">
                <Skeleton className="aspect-[4/3] w-full" />
                <div className="p-6 space-y-3">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-[#5A5A5A]">No blog posts found.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link to={createPageUrl(`BlogPost?slug=${post.slug || post.id}`)}>
                  <div className="bg-white overflow-hidden group cursor-pointer h-full flex flex-col">
                    <div className="aspect-[4/3] overflow-hidden">
                      <img
                        src={post.featured_image || 'https://images.unsplash.com/photo-1493106641515-6b5631de4bb9?w=600&q=80'}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex items-center gap-2 text-sm text-[#8B9A7D] mb-3">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {post.published_date
                            ? format(new Date(post.published_date), 'MMM d, yyyy')
                            : format(new Date(post.created_date), 'MMM d, yyyy')
                          }
                        </span>
                      </div>
                      <h3 className="text-xl font-serif text-[#2D2D2D] mb-3 group-hover:text-[#C4785A] transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-[#5A5A5A] text-sm leading-relaxed mb-4 line-clamp-3 flex-1">
                        {post.excerpt || post.content?.substring(0, 120) + '...'}
                      </p>
                      <div className="flex items-center text-[#C4785A] font-medium text-sm group-hover:gap-2 transition-all">
                        Read More
                        <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}