import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { api } from '@/api/apiClient';
import { sendOrderEmails } from '@/lib/emailService';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function Checkout() {
  const navigate = useNavigate();
  const [cart, setCart]               = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced]   = useState(false);
  const [error, setError]               = useState('');

  const [form, setForm] = useState({
    customer_name:    '',
    customer_email:   '',
    customer_phone:   '',
    shipping_address: '',
    notes:            '',
  });

  useEffect(() => {
    const saved = localStorage.getItem('terra-cart');
    if (saved) setCart(JSON.parse(saved));
  }, []);

  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const shipping  = subtotal > 100 ? 0 : 15;
  const total     = subtotal + shipping;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      // ── 1. Create order in Firestore ───────────────────────────────────────
      const orderData = {
        ...form,
        items: cart.map((i) => ({
          product_id:   i.product_id,
          product_name: i.product_name,
          quantity:     i.quantity,
          price:        i.price,
          image_url:    i.image_url,
        })),
        subtotal,
        shipping_cost: shipping,
        total,
        status: 'pending',
      };

      const order = await api.entities.Order.create(orderData);

      // ── 2. Decrement stock for each product ────────────────────────────────
      await Promise.all(
        cart.map(async (item) => {
          try {
            const [product] = await api.entities.Product.filter({ id: item.product_id });
            if (product && product.stock > 0) {
              const newStock = Math.max(0, product.stock - item.quantity);
              await api.entities.Product.update(item.product_id, { stock: newStock });
            }
          } catch (err) {
            // Non-fatal — order is saved even if stock update fails
            console.warn(`Stock update failed for ${item.product_name}:`, err);
          }
        })
      );

      // ── 3. Send emails (admin notification + customer receipt) ─────────────
      await sendOrderEmails(order);

      // ── 4. Clear cart and show success ─────────────────────────────────────
      localStorage.removeItem('terra-cart');
      setOrderPlaced(true);

    } catch (err) {
      console.error('Checkout error:', err);
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Success screen ──────────────────────────────────────────────────────────
  if (orderPlaced) {
    return (
      <div className="pt-32 pb-16 min-h-screen bg-[#FAF7F2]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="container mx-auto px-6 lg:px-12 text-center max-w-lg"
        >
          <div className="w-20 h-20 bg-[#8B9A7D] rounded-full flex items-center justify-center mx-auto mb-8">
            <Check className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-serif text-[#2D2D2D] mb-4">Thank You!</h1>
          <p className="text-[#5A5A5A] mb-2 leading-relaxed">
            Your order has been placed successfully.
          </p>
          <p className="text-[#5A5A5A] mb-8 leading-relaxed">
            A confirmation email with your receipt has been sent to{' '}
            <strong>{form.customer_email}</strong>.
          </p>
          <Link to={createPageUrl('Home')}>
            <Button className="bg-[#2D2D2D] hover:bg-[#3D3D3D] rounded-none px-8">
              Continue Shopping
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  // ── Empty cart ──────────────────────────────────────────────────────────────
  if (cart.length === 0) {
    return (
      <div className="pt-32 pb-16 min-h-screen bg-[#FAF7F2]">
        <div className="container mx-auto px-6 lg:px-12 text-center">
          <h1 className="text-3xl font-serif text-[#2D2D2D] mb-4">Your Cart is Empty</h1>
          <Link to={createPageUrl('Bowls')}>
            <Button className="bg-[#2D2D2D] hover:bg-[#3D3D3D] rounded-none px-8">
              Start Shopping
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // ── Checkout form ───────────────────────────────────────────────────────────
  return (
    <div className="pt-32 pb-16 min-h-screen bg-[#FAF7F2]">
      <div className="container mx-auto px-6 lg:px-12">
        <Link
          to={createPageUrl('Cart')}
          className="inline-flex items-center text-[#5A5A5A] hover:text-[#C4785A] mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Cart
        </Link>

        <h1 className="text-4xl font-serif text-[#2D2D2D] mb-12">Checkout</h1>

        <div className="grid lg:grid-cols-2 gap-12">

          {/* ── Form ── */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white p-8">
              <h2 className="text-xl font-serif text-[#2D2D2D] mb-6">Contact Information</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="customer_name">Full Name *</Label>
                  <Input
                    id="customer_name" name="customer_name"
                    value={form.customer_name} onChange={handleChange}
                    required className="mt-1 rounded-none"
                  />
                </div>
                <div>
                  <Label htmlFor="customer_email">Email Address *</Label>
                  <Input
                    id="customer_email" name="customer_email" type="email"
                    value={form.customer_email} onChange={handleChange}
                    required className="mt-1 rounded-none"
                  />
                </div>
                <div>
                  <Label htmlFor="customer_phone">Phone Number</Label>
                  <Input
                    id="customer_phone" name="customer_phone" type="tel"
                    value={form.customer_phone} onChange={handleChange}
                    className="mt-1 rounded-none"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white p-8">
              <h2 className="text-xl font-serif text-[#2D2D2D] mb-6">Shipping Address</h2>
              <div>
                <Label htmlFor="shipping_address">Full Address *</Label>
                <Textarea
                  id="shipping_address" name="shipping_address"
                  value={form.shipping_address} onChange={handleChange}
                  required rows={3} placeholder="Street, city, zip code"
                  className="mt-1 rounded-none"
                />
              </div>
            </div>

            <div className="bg-white p-8">
              <h2 className="text-xl font-serif text-[#2D2D2D] mb-6">Additional Notes</h2>
              <div>
                <Label htmlFor="notes">Order Notes (optional)</Label>
                <Textarea
                  id="notes" name="notes"
                  value={form.notes} onChange={handleChange}
                  rows={3} placeholder="Any special instructions?"
                  className="mt-1 rounded-none"
                />
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded">
                {error}
              </div>
            )}

            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting}
              className="w-full bg-[#C4785A] hover:bg-[#B36A4C] rounded-none py-6 text-base"
            >
              {isSubmitting ? (
                <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Placing order...</>
              ) : (
                `Place Order — $${total.toFixed(2)}`
              )}
            </Button>
          </form>

          {/* ── Order Summary ── */}
          <div>
            <div className="bg-white p-8 sticky top-32">
              <h2 className="text-xl font-serif text-[#2D2D2D] mb-6">Order Summary</h2>

              <div className="space-y-4 pb-6 border-b border-gray-200">
                {cart.map((item) => (
                  <div key={item.product_id} className="flex gap-4">
                    <div className="w-16 h-20 bg-[#FAF7F2] flex-shrink-0 overflow-hidden">
                      <img
                        src={item.image_url || 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=100&q=80'}
                        alt={item.product_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-[#2D2D2D] font-medium">{item.product_name}</p>
                      <p className="text-sm text-[#5A5A5A]">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-[#2D2D2D]">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-3 py-6 border-b border-gray-200">
                <div className="flex justify-between text-[#5A5A5A]">
                  <span>Subtotal</span><span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[#5A5A5A]">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
                </div>
                {shipping > 0 && (
                  <p className="text-xs text-[#8B9A7D]">Free shipping on orders over $100</p>
                )}
              </div>

              <div className="flex justify-between py-6 text-lg font-medium text-[#2D2D2D]">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
