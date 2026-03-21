import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils/index';
import { motion } from 'framer-motion';
import { ArrowRight, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '../ui/button';

export default function LatestBlog({ post }) {
  if (!post) return null;

  return (
    <section className="py-24 bg-[#2D2D2D]">
      <div className="container mx-auto px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-[#C4785A] text-sm tracking-[0.3em] uppercase font-medium">
            From the Studio
          </span>
          <h2 className="mt-3 text-4xl md:text-5xl font-serif text-white">
            Latest Blog Post
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <Link to={createPageUrl(`BlogPost?slug=${post.slug || post.id}`)}>
            <div className="grid md:grid-cols-2 gap-8 bg-white overflow-hidden group cursor-pointer">
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={post.featured_image || 'https://images.unsplash.com/photo-1493106641515-6b5631de4bb9?w=800&q=80'}
                  alt={post.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>
              <div className="p-8 flex flex-col justify-center">
                <div className="flex items-center gap-2 text-sm text-[#8B9A7D] mb-4">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {post.published_date 
                      ? format(new Date(post.published_date), 'MMMM d, yyyy')
                      : format(new Date(post.created_date), 'MMMM d, yyyy')
                    }
                  </span>
                </div>
                <h3 className="text-2xl md:text-3xl font-serif text-[#2D2D2D] mb-4 group-hover:text-[#C4785A] transition-colors">
                  {post.title}
                </h3>
                <p className="text-[#5A5A5A] leading-relaxed mb-6 line-clamp-3">
                  {post.excerpt || post.content?.substring(0, 150) + '...'}
                </p>
                <div className="flex items-center text-[#C4785A] font-medium group-hover:gap-2 transition-all">
                  Read More
                  <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </div>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}