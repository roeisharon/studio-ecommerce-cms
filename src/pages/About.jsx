import React from 'react';
import { motion } from 'framer-motion';
import { Award, Heart, Leaf, Clock } from 'lucide-react';

const values = [
  {
    icon: Heart,
    title: 'Made with Love',
    description: 'Every piece is crafted with intention and care, infused with the energy of our makers.'
  },
  {
    icon: Leaf,
    title: 'Sustainable',
    description: 'We source locally and use eco-friendly glazes and firing techniques.'
  },
  {
    icon: Clock,
    title: 'Slow Made',
    description: 'Good things take time. We never rush the creative process.'
  },
  {
    icon: Award,
    title: 'Quality First',
    description: 'We only release pieces that meet our exacting standards.'
  }
];

export default function About() {
  return (
    <div className="pt-24">
      {/* Hero Section */}
      <section className="py-20 bg-[#FAF7F2]">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="text-[#C4785A] text-sm tracking-[0.3em] uppercase font-medium">
                Our Story
              </span>
              <h1 className="mt-4 text-5xl md:text-6xl font-serif text-[#2D2D2D] leading-tight">
                Where Earth
                <br />
                <span className="italic text-[#C4785A]">Meets Art</span>
              </h1>
              <p className="mt-8 text-lg text-[#5A5A5A] leading-relaxed">
                Terra Ceramics was born from a simple belief: that the objects we 
                use every day should bring us joy. Founded in 2009 in a small 
                Portland studio, we've grown from a one-woman workshop into a 
                collective of passionate artisans, all united by our love for clay.
              </p>
              <p className="mt-4 text-[#5A5A5A] leading-relaxed">
                Our founder, Elena Vasquez, discovered ceramics during a transformative 
                trip to Japan, where she studied under master potters in Kyoto. She 
                returned home with a vision: to create functional art that honors 
                tradition while embracing contemporary design.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <img
                src="https://images.unsplash.com/photo-1416339442236-8ceb164046f8?w=800&q=80"
                alt="Ceramic studio"
                className="w-full aspect-[4/5] object-cover"
              />
              <div className="absolute -bottom-6 -left-6 bg-[#C4785A] text-white p-8 max-w-xs">
                <p className="text-4xl font-serif">2009</p>
                <p className="text-sm mt-2 opacity-80">Year we first opened our studio doors</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto mb-16"
          >
            <span className="text-[#8B9A7D] text-sm tracking-[0.3em] uppercase font-medium">
              What We Believe
            </span>
            <h2 className="mt-3 text-4xl md:text-5xl font-serif text-[#2D2D2D]">
              Our Values
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-8 bg-[#FAF7F2]"
              >
                <div className="w-16 h-16 mx-auto bg-white flex items-center justify-center mb-6">
                  <value.icon className="w-8 h-8 text-[#C4785A]" />
                </div>
                <h3 className="text-xl font-serif text-[#2D2D2D] mb-3">{value.title}</h3>
                <p className="text-[#5A5A5A] leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-24 bg-[#2D2D2D]">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              <span className="text-[#C4785A] text-sm tracking-[0.3em] uppercase font-medium">
                The Process
              </span>
              <h2 className="mt-4 text-4xl md:text-5xl font-serif text-white leading-tight">
                From Clay to
                <br />
                <span className="italic text-[#C4785A]">Masterpiece</span>
              </h2>
              <div className="mt-10 space-y-8">
                {[
                  { step: '01', title: 'Shaping', desc: 'Each piece begins on the wheel or hand-built with care.' },
                  { step: '02', title: 'Drying', desc: 'Slow drying ensures structural integrity.' },
                  { step: '03', title: 'First Fire', desc: 'Bisque firing transforms clay into ceramic.' },
                  { step: '04', title: 'Glazing', desc: 'Hand-applied glazes create unique finishes.' },
                  { step: '05', title: 'Final Fire', desc: 'High-temperature firing brings the piece to life.' },
                ].map((item) => (
                  <div key={item.step} className="flex gap-6">
                    <span className="text-[#C4785A] font-serif text-2xl">{item.step}</span>
                    <div>
                      <h4 className="text-white font-medium text-lg">{item.title}</h4>
                      <p className="text-white/60 mt-1">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-4"
            >
              <img
                src="https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=500&q=80"
                alt="Ceramic process"
                className="w-full aspect-[3/4] object-cover"
              />
              <img
                src="https://images.unsplash.com/photo-1493106641515-6b5631de4bb9?w=500&q=80"
                alt="Ceramic process"
                className="w-full aspect-[3/4] object-cover mt-12"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto mb-16"
          >
            <span className="text-[#C4785A] text-sm tracking-[0.3em] uppercase font-medium">
              The Makers
            </span>
            <h2 className="mt-3 text-4xl md:text-5xl font-serif text-[#2D2D2D]">
              Meet Our Team
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { name: 'Elena Vasquez', role: 'Founder & Lead Potter', image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80' },
              { name: 'Marcus Chen', role: 'Master Glazer', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80' },
              { name: 'Sofia Martinez', role: 'Ceramic Artist', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80' },
            ].map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="aspect-[3/4] overflow-hidden bg-[#FAF7F2]">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
                  />
                </div>
                <h3 className="mt-6 text-xl font-serif text-[#2D2D2D]">{member.name}</h3>
                <p className="text-[#5A5A5A]">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}