import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProductGrid({ products, isLoading, onAddToCart }) {
  if (isLoading) return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {[...Array(6)].map((_, i) => <div key={i} className="space-y-4"><Skeleton className="aspect-[3/4] w-full" /><Skeleton className="h-4 w-20" /><Skeleton className="h-6 w-3/4" /><Skeleton className="h-5 w-16" /></div>)}
    </div>
  );
  if (!products || products.length === 0) return <div className="text-center py-16"><p className="text-[#5A5A5A] text-lg">No products available yet.</p></div>;
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {products.map((product, index) => (
        <motion.div key={product.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} className="group">
          <Link to={createPageUrl(`ProductDetail?id=${product.id}`)}>
            <div className="relative aspect-[3/4] overflow-hidden bg-[#FAF7F2]">
              <img src={product.image_url || 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=500&q=80'} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
              {product.stock <= 0 && <div className="absolute top-4 left-4 bg-[#2D2D2D] text-white px-3 py-1 text-xs tracking-wider">SOLD OUT</div>}
              <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <Button onClick={e => { e.preventDefault(); e.stopPropagation(); if (product.stock > 0) onAddToCart(product); }} disabled={product.stock <= 0} className="w-full bg-white text-[#2D2D2D] hover:bg-[#C4785A] hover:text-white rounded-none">
                  <ShoppingBag className="w-4 h-4 mr-2" />Add to Cart
                </Button>
              </div>
            </div>
          </Link>
          <div className="mt-5">
            <p className="text-xs text-[#8B9A7D] uppercase tracking-wider">{product.category}</p>
            <Link to={createPageUrl(`ProductDetail?id=${product.id}`)}><h3 className="mt-1 text-lg text-[#2D2D2D] font-medium group-hover:text-[#C4785A] transition-colors">{product.name}</h3></Link>
            <p className="text-sm text-[#5A5A5A] mt-1 line-clamp-2">{product.short_description}</p>
            <p className="mt-2 text-[#C4785A] font-medium text-lg">${product.price?.toFixed(2)}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
