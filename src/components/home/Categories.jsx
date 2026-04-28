import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils/index';
import { motion } from 'framer-motion';

const categories = [
  {
    name: 'Bowls',
    page: 'Bowls',
    image: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=600&q=80',
    description: 'Everyday elegance'
  },
  {
    name: 'Vases',
    page: 'Vases',
    image: 'https://images.unsplash.com/photo-1676534967649-de5853869036?q=80',
    description: 'Sculptural beauty'
  },
  {
    name: 'Mugs',
    page: 'Mugs',
    image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600&q=80',
    description: 'Morning rituals'
  },
  {
    name: 'Plates',
    page: 'Plates',
    image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=600&q=80',
    description: 'Table artistry'
  }
];

export default function Categories() {
  return (
    <section className="py-24 bg-[#FAF7F2]">
      <div className="container mx-auto px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-[#C4785A] text-sm tracking-[0.3em] uppercase font-medium">
            Explore
          </span>
          <h2 className="mt-3 text-4xl md:text-5xl font-serif text-[#2D2D2D]">
            Our Collections
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Link to={createPageUrl(category.page)}>
                <div className="group relative aspect-[3/4] overflow-hidden cursor-pointer">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <p className="text-sm opacity-80">{category.description}</p>
                    <h3 className="text-2xl font-serif mt-1">{category.name}</h3>
                  </div>
                  <div className="absolute inset-0 border-2 border-white/0 group-hover:border-white/30 transition-colors duration-300 m-3" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}