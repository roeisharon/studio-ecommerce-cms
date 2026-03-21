import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils/index';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export default function FeaturedProducts({ products }) {
  if (!products || products.length === 0) return null;

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex justify-between items-end mb-16"
        >
          <div>
            <span className="text-[#8B9A7D] text-sm tracking-[0.3em] uppercase font-medium">
              Curated Selection
            </span>
            <h2 className="mt-3 text-4xl md:text-5xl font-serif text-[#2D2D2D]">
              Featured Pieces
            </h2>
          </div>
          <Link 
            to={createPageUrl('Bowls')} 
            className="hidden md:flex items-center text-[#2D2D2D] hover:text-[#C4785A] transition-colors group"
          >
            View All
            <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.slice(0, 4).map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Link to={createPageUrl(`ProductDetail?id=${product.id}`)}>
                <div className="group cursor-pointer">
                  <div className="relative aspect-[3/4] overflow-hidden bg-[#FAF7F2]">
                    <img
                      src={product.image_url || 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=500&q=80'}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                  </div>
                  <div className="mt-5">
                    <p className="text-xs text-[#8B9A7D] uppercase tracking-wider">
                      {product.category}
                    </p>
                    <h3 className="mt-1 text-lg text-[#2D2D2D] font-medium group-hover:text-[#C4785A] transition-colors">
                      {product.name}
                    </h3>
                    <p className="mt-2 text-[#C4785A] font-medium">
                      ${product.price?.toFixed(2)}
                    </p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 text-center md:hidden">
          <Link 
            to={createPageUrl('Bowls')} 
            className="inline-flex items-center text-[#2D2D2D] hover:text-[#C4785A] transition-colors"
          >
            View All Products
            <ArrowRight className="ml-2 w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}