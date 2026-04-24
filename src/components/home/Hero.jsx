import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils/index';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '../ui/button';

export default function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-[#FAF7F2] pt-16 lg:pt-0">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-64 h-64 rounded-full border-2 border-[#C4785A]" />
        <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full border border-[#8B9A7D]" />
        <div className="absolute top-1/2 left-1/3 w-32 h-32 rounded-full bg-[#C4785A]" />
      </div>

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <span className="text-[#C4785A] text-sm tracking-[0.3em] uppercase font-medium">
              Handcrafted with love
            </span>
            <h1 className="mt-4 text-5xl md:text-6xl lg:text-7xl font-serif text-[#2D2D2D] leading-[1.1]">
              Deborah's
              <br />
              <span className="italic text-[#C4785A]">Ceramics</span>
              <br />
              Studio
            </h1>
            <p className="mt-6 text-lg text-[#5A5A5A] max-w-md leading-relaxed">
              Each piece tells a story. Discover handmade ceramics crafted with 
              traditional techniques and contemporary design, made to bring 
              warmth to your everyday moments.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link to={createPageUrl('Bowls')}>
                <Button 
                  size="lg" 
                  className="bg-[#2D2D2D] hover:bg-[#3D3D3D] text-white px-8 py-6 text-base rounded-none group"
                >
                  Shop Collection
                  <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link to={createPageUrl('About')}>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="border-[#2D2D2D] text-[#2D2D2D] hover:bg-[#2D2D2D] hover:text-white px-8 py-6 text-base rounded-none"
                >
                  Our Story
                </Button>
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative"
          >
            <div className="relative aspect-[4/5] rounded-t-full overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&q=80"
                alt="Handcrafted ceramic vase"
                className="w-full h-full object-cover opacity-50"
              />
            </div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="absolute -left-8 bottom-20 bg-white p-6 shadow-xl"
            >
              <p className="text-3xl font-serif text-[#C4785A]">15+</p>
              <p className="text-sm text-[#5A5A5A] mt-1">Years of Craftsmanship</p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}