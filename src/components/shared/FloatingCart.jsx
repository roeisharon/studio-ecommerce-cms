import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils/index';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, X, Trash2, ArrowRight } from 'lucide-react';
import { Button } from '../ui/button';

export default function FloatingCart() {
  const [isOpen, setIsOpen] = useState(false);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const updateCart = () => {
      const savedCart = localStorage.getItem('terra-cart');
      setCart(savedCart ? JSON.parse(savedCart) : []);
    };
    
    updateCart();
    const interval = setInterval(updateCart, 500);
    return () => clearInterval(interval);
  }, []);

  const removeItem = (index) => {
    const newCart = cart.filter((_, i) => i !== index);
    setCart(newCart);
    localStorage.setItem('terra-cart', JSON.stringify(newCart));
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <>
      {/* Cart Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#C4785A] text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-[#B36A4C] transition-colors"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <ShoppingBag className="w-6 h-6" />
        {cartCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-6 h-6 bg-[#2D2D2D] text-white text-xs rounded-full flex items-center justify-center font-medium"
          >
            {cartCount}
          </motion.span>
        )}
      </motion.button>

      {/* Cart Panel */}
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
              initial={{ x: 400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 400, opacity: 0 }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed right-6 bottom-24 z-50 bg-white rounded-2xl shadow-2xl w-96 max-h-[70vh] flex flex-col"
            >
              {/* Header */}
              <div className="p-4 border-b flex items-center justify-between">
                <h3 className="text-lg font-semibold text-[#2D2D2D]">
                  Your Cart ({cartCount})
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-[#5A5A5A] hover:text-[#C4785A]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {cart.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-[#5A5A5A]">Your cart is empty</p>
                  </div>
                ) : (
                  cart.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="flex gap-3 bg-[#FAF7F2] p-3 rounded-lg"
                    >
                      <img
                        src={item.image_url || 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=100&q=80'}
                        alt={item.product_name}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#2D2D2D] truncate">
                          {item.product_name}
                        </p>
                        <p className="text-xs text-[#5A5A5A] mt-1">
                          ${item.price?.toFixed(2)} × {item.quantity}
                        </p>
                        <p className="text-sm font-medium text-[#C4785A] mt-1">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                      <button
                        onClick={() => removeItem(index)}
                        className="text-red-400 hover:text-red-600 self-start"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Footer */}
              {cart.length > 0 && (
                <div className="p-4 border-t space-y-3">
                  <div className="flex justify-between items-center font-semibold text-[#2D2D2D]">
                    <span>Total</span>
                    <span className="text-lg">${total.toFixed(2)}</span>
                  </div>
                  <Link to={createPageUrl('Cart')} onClick={() => setIsOpen(false)}>
                    <Button className="w-full bg-[#2D2D2D] hover:bg-[#3D3D3D] rounded-lg group">
                      View Cart & Checkout
                      <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}