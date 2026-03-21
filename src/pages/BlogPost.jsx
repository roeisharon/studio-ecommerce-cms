import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { api } from '@/api/apiClient';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ArrowLeft, Calendar, User } from 'lucide-react';

export default function BlogPost() {
  const urlParams = new URLSearchParams(window.location.search);
  const slug = urlParams.get('slug');

  const { data: post, isLoading } = useQuery({
    queryKey: ['blog-post', slug],
    queryFn: async () => {
      if (slug?.includes('-')) {
        const posts = await api.entities.Blog.filter({ slug });
        return posts[0];
      } else {
        const posts = await api.entities.Blog.filter({ id: slug });
        return posts[0];
      }
    },
    enabled: !!slug
  });

  if (isLoading) {
    return (
      <div className="pt-32 pb-16 min-h-screen bg-white flex items-center justify-center">
        <p className="text-[#5A5A5A]">Loading...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="pt-32 pb-16 min-h-screen bg-white text-center">
        <p className="text-[#5A5A5A] mb-4">Post not found</p>
        <Link to={createPageUrl('Blog')} className="text-[#C4785A] hover:underline">
          Back to Blog
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-16 bg-white min-h-screen">
      <article className="container mx-auto px-6 lg:px-12 max-w-4xl">
        {/* Back Link */}
        <Link 
          to={createPageUrl('Blog')} 
          className="inline-flex items-center text-[#5A5A5A] hover:text-[#C4785A] mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Blog
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Featured Image */}
          {post.featured_image && (
            <div className="aspect-[21/9] mb-12 overflow-hidden rounded-lg">
              <img
                src={post.featured_image}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-6 mb-8 text-sm text-[#5A5A5A]">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>
                {post.published_date
                  ? format(new Date(post.published_date), 'MMMM d, yyyy')
                  : format(new Date(post.created_date), 'MMMM d, yyyy')
                }
              </span>
            </div>
            {post.author_name && (
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>{post.author_name}</span>
              </div>
            )}
            {post.tags && post.tags.length > 0 && (
              <div className="flex gap-2">
                {post.tags.map((tag, i) => (
                  <span key={i} className="px-3 py-1 bg-[#FAF7F2] text-[#8B9A7D] rounded-full text-xs">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-[#2D2D2D] mb-8 leading-tight">
            {post.title}
          </h1>

          {/* Content */}
          <div 
            className="prose prose-lg max-w-none prose-headings:font-serif prose-headings:text-[#2D2D2D] prose-a:text-[#C4785A] prose-a:no-underline hover:prose-a:underline prose-img:rounded-lg"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </motion.div>
      </article>
    </div>
  );
}