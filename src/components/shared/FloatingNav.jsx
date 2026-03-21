import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils/index';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Home, Info, Package, ShoppingBag, FileText, Sparkles } from 'lucide-react';

const navItems = [
  { name: 'Home', page: 'Home', icon: Home },
  { name: 'Bowls', page: 'Bowls', icon: Package },
  { name: 'Vases', page: 'Vases', icon: Package },
  { name: 'Mugs', page: 'Mugs', icon: Package },
  { name: 'Plates', page: 'Plates', icon: Package },
  { name: 'About', page: 'About', icon: Info },
  { name: 'Blog', page: 'Blog', icon: FileText },
  { name: 'Custom Order', page: 'CustomOrder', icon: Sparkles },
];

export default function FloatingNav() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Menu Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 left-6 z-50 w-14 h-14 bg-[#2D2D2D] text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-[#C4785A] transition-colors"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </motion.button>

      {/* Menu Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed left-6 bottom-24 z-50 bg-white rounded-2xl shadow-2xl p-4 w-64"
            >
              <nav className="space-y-1">
                {navItems.map((item, index) => (
                  <motion.div
                    key={item.page}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      to={createPageUrl(item.page)}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#FAF7F2] transition-colors group"
                    >
                      <item.icon className="w-5 h-5 text-[#5A5A5A] group-hover:text-[#C4785A]" />
                      <span className="text-[#2D2D2D] group-hover:text-[#C4785A]">{item.name}</span>
                    </Link>
                  </motion.div>
                ))}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}