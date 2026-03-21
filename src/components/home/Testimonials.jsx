import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Sarah Mitchell',
    role: 'Interior Designer',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80',
    text: 'These ceramics have transformed my clients\' spaces. The quality and artistry is unmatched. Each piece feels like a treasure.',
    rating: 5
  },
  {
    name: 'James Chen',
    role: 'Home Chef',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
    text: 'My morning coffee ritual has never felt more special. The mugs are perfectly weighted and absolutely beautiful.',
    rating: 5
  },
  {
    name: 'Emma Rodriguez',
    role: 'Art Collector',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80',
    text: 'I\'ve been collecting handmade ceramics for years, and these are among the finest I\'ve ever owned. True works of art.',
    rating: 5
  }
];

export default function Testimonials() {
  return (
    <section className="py-24 bg-[#2D2D2D]">
      <div className="container mx-auto px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-[#C4785A] text-sm tracking-[0.3em] uppercase font-medium">
            Testimonials
          </span>
          <h2 className="mt-3 text-4xl md:text-5xl font-serif text-white">
            What Our Customers Say
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="bg-[#3A3A3A] p-8 relative"
            >
              <Quote className="absolute top-6 right-6 w-12 h-12 text-[#C4785A] opacity-30" />
              
              <div className="flex gap-1 mb-6">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#C4785A] text-[#C4785A]" />
                ))}
              </div>

              <p className="text-white/80 leading-relaxed mb-8">
                "{testimonial.text}"
              </p>

              <div className="flex items-center gap-4">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p className="text-white font-medium">{testimonial.name}</p>
                  <p className="text-white/50 text-sm">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}