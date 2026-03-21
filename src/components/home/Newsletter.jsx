import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Send, Check } from 'lucide-react';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      setEmail('');
    }
  };

  return (
    <section className="py-24 bg-[#FAF7F2]">
      <div className="container mx-auto px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center"
        >
          <span className="text-[#8B9A7D] text-sm tracking-[0.3em] uppercase font-medium">
            Stay Connected
          </span>
          <h2 className="mt-3 text-4xl md:text-5xl font-serif text-[#2D2D2D]">
            Join Our Journey
          </h2>
          <p className="mt-4 text-[#5A5A5A] text-lg">
            Subscribe for exclusive updates on new collections, studio insights, 
            and special offers.
          </p>

          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-10 inline-flex items-center gap-2 text-[#8B9A7D] text-lg"
            >
              <Check className="w-5 h-5" />
              Thank you for subscribing!
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-10 flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 rounded-none border-[#2D2D2D]/20 focus:border-[#C4785A] h-12"
                required
              />
              <Button 
                type="submit"
                className="bg-[#C4785A] hover:bg-[#B36A4C] text-white rounded-none h-12 px-8"
              >
                Subscribe
                <Send className="ml-2 w-4 h-4" />
              </Button>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
}