import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils/index';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '../ui/button';

export default function AboutTeaser() {
  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative z-10">
              <img
                src="https://images.unsplash.com/photo-1493106641515-6b5631de4bb9?w=700&q=80"
                alt="Ceramic artist at work"
                className="w-full aspect-[4/5] object-cover"
              />
            </div>
            <div className="absolute -bottom-8 -right-8 w-2/3 aspect-square bg-[#FAF7F2] -z-10" />
            <div className="absolute -top-8 -left-8 w-32 h-32 border-2 border-[#C4785A] -z-10" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-[#8B9A7D] text-sm tracking-[0.3em] uppercase font-medium">
              Our Story
            </span>
            <h2 className="mt-4 text-4xl md:text-5xl font-serif text-[#2D2D2D] leading-tight">
              Crafted by Hand,
              <br />
              <span className="italic text-[#C4785A]">Made with Soul</span>
            </h2>
            <p className="mt-6 text-[#5A5A5A] leading-relaxed text-lg">
              Nestled in a sun-filled studio, we shape each piece by hand using 
              time-honored techniques passed down through generations. Our ceramics 
              aren't just objects—they're vessels of intention, designed to bring 
              beauty and mindfulness to your daily rituals.
            </p>
            <p className="mt-4 text-[#5A5A5A] leading-relaxed">
              From the first touch of clay to the final glaze, every step is a 
              meditation. We believe in slow making, sustainable practices, and 
              creating pieces that will be cherished for years to come.
            </p>

            <div className="mt-10 flex items-center gap-12">
              <div>
                <p className="text-4xl font-serif text-[#C4785A]">500+</p>
                <p className="text-sm text-[#5A5A5A] mt-1">Happy Customers</p>
              </div>
              <div>
                <p className="text-4xl font-serif text-[#C4785A]">100%</p>
                <p className="text-sm text-[#5A5A5A] mt-1">Handmade</p>
              </div>
            </div>

            <Link to={createPageUrl('About')} className="inline-block mt-10">
              <Button 
                variant="outline" 
                size="lg"
                className="border-[#2D2D2D] text-[#2D2D2D] hover:bg-[#2D2D2D] hover:text-white rounded-none px-8 group"
              >
                Learn More About Us
                <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}