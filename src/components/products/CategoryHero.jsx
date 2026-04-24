import React from 'react';
import { motion } from 'framer-motion';

export default function CategoryHero({ title, description, image, position }) {
  return (
    <section className="relative h-[50vh] min-h-[400px] flex items-center overflow-hidden">
      <div className="absolute inset-0">
        <img src={image} alt={title} className="w-full h-full object-cover" 
        style={{ objectPosition: position || 'center' }}/>
        <div className="absolute inset-0 bg-black/40" />
      </div>
      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-2xl">
          <h1 className="text-5xl md:text-6xl font-serif text-white">{title}</h1>
          <p className="mt-4 text-lg text-white/80">{description}</p>
        </motion.div>
      </div>
    </section>
  );
}
