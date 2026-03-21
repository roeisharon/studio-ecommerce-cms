import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Cart() {
  const [cart, setCart] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    setCart(JSON.parse(localStorage.getItem('terra-cart') || '[]'));
  }, []);

  const save = (newCart) => {
    setCart(newCart);
    localStorage.setItem('terra-cart', JSON.stringify(newCart));
  };

  const updateQty = (idx, delta) => {
    const c = [...cart];
    c[idx].quantity = Math.max(1, c[idx].quantity + delta);
    save(c);
  };

  const remove = (idx) => save(cart.filter((_, i) => i !== idx));

  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const shipping = subtotal > 100 ? 0 : 15;

  return (
    <div className="pt-24 min-h-screen bg-[#FAF7F2]">
      <div className="container mx-auto px-6 lg:px-12 py-16">
        <h1 className="text-4xl font-serif text-[#2D2D2D] mb-12">Your Cart</h1>
        {cart.length === 0 ? (
          <div className="text-center py-24">
            <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-[#5A5A5A] text-lg mb-6">Your cart is empty</p>
            <Link to={createPageUrl('Home')}><Button className="bg-[#2D2D2D] rounded-none">Continue Shopping</Button></Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-4">
              <AnimatePresence>
                {cart.map((item, idx) => (
                  <motion.div key={idx} layout exit={{ opacity: 0, x: -20 }} className="flex gap-4 bg-white p-4 shadow-sm">
                    <img src={item.image_url || 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=200&q=80'} alt={item.product_name} className="w-24 h-24 object-cover" />
                    <div className="flex-1">
                      <h3 className="font-medium text-[#2D2D2D]">{item.product_name}</h3>
                      <p className="text-[#C4785A] font-medium mt-1">${item.price?.toFixed(2)}</p>
                      <div className="flex items-center gap-3 mt-3">
                        <button onClick={() => updateQty(idx, -1)} className="w-7 h-7 border flex items-center justify-center hover:bg-gray-100"><Minus className="w-3 h-3" /></button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <button onClick={() => updateQty(idx, 1)} className="w-7 h-7 border flex items-center justify-center hover:bg-gray-100"><Plus className="w-3 h-3" /></button>
                      </div>
                    </div>
                    <div className="flex flex-col items-end justify-between">
                      <button onClick={() => remove(idx)} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                      <p className="font-semibold text-[#2D2D2D]">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            <div className="bg-white p-6 shadow-sm h-fit space-y-4">
              <h2 className="text-xl font-serif text-[#2D2D2D]">Order Summary</h2>
              <div className="flex justify-between text-[#5A5A5A]"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between text-[#5A5A5A]"><span>Shipping</span><span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span></div>
              {shipping > 0 && <p className="text-xs text-[#8B9A7D]">Free shipping on orders over $100</p>}
              <div className="border-t pt-4 flex justify-between font-semibold text-[#2D2D2D] text-lg"><span>Total</span><span>${(subtotal + shipping).toFixed(2)}</span></div>
              <Button onClick={() => navigate(createPageUrl('Checkout'))} className="w-full bg-[#2D2D2D] hover:bg-[#3D3D3D] rounded-none group">
                Proceed to Checkout <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
