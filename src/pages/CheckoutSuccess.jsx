import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { api } from '@/api/apiClient';
import { motion } from 'framer-motion';
import { Check, Loader2, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { sendOrderEmails } from '@/lib/emailService';

export default function CheckoutSuccess() {
  const [status, setStatus] = useState('processing'); // processing | done | error
  const [order, setOrder]   = useState(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const orderId   = urlParams.get('order_id');

    const finalizeOrder = async () => {
      try {
        // 1. Fetch the order from Firestore
        const fetchedOrder = await api.entities.Order.get(orderId);
        if (!fetchedOrder) throw new Error('Order not found');

        // 2. Update order status to confirmed
        await api.entities.Order.update(orderId, { status: 'confirmed' });

        // 3. Decrement stock for each ordered product
        await Promise.allSettled(
          (fetchedOrder.items || []).map(async (item) => {
            try {
              const product = await api.entities.Product.get(item.product_id);
              if (product && typeof product.stock === 'number') {
                const newStock = Math.max(0, product.stock - item.quantity);
                await api.entities.Product.update(item.product_id, { stock: newStock });
              }
            } catch (e) {
              console.warn(`Could not update stock for product ${item.product_id}:`, e);
            }
          })
        );

        // 4. Send emails (admin notification + customer receipt)
        await sendOrderEmails({ ...fetchedOrder, id: orderId, status: 'confirmed' });

        // 5. Clear cart
        localStorage.removeItem('terra-cart');
        localStorage.removeItem('terra-pending-order');

        setOrder({ ...fetchedOrder, id: orderId });
        setStatus('done');

      } catch (err) {
        console.error('Order finalization error:', err);
        setStatus('error');
      }
    };

    if (orderId) {
      finalizeOrder();
    } else {
      setStatus('error');
    }
  }, []);

  // ── Processing ──────────────────────────────────────────────────────────────
  if (status === 'processing') {
    return (
      <div className="pt-32 pb-16 min-h-screen bg-[#FAF7F2] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#C4785A] mx-auto mb-4" />
          <p className="text-[#5A5A5A]">Confirming your order...</p>
        </div>
      </div>
    );
  }

  // ── Error ───────────────────────────────────────────────────────────────────
  if (status === 'error') {
    return (
      <div className="pt-32 pb-16 min-h-screen bg-[#FAF7F2]">
        <div className="container mx-auto px-6 lg:px-12 text-center max-w-lg">
          <h1 className="text-3xl font-serif text-[#2D2D2D] mb-4">Something went wrong</h1>
          <p className="text-[#5A5A5A] mb-8">
            Your payment may have been processed but we couldn't confirm your order.
            Please contact us at{' '}
            <a href="mailto:hello@deborah.studio" className="text-[#C4785A] hover:underline">
              hello@deborah.studio
            </a>{' '}
            with your order details.
          </p>
          <Link to={createPageUrl('Home')}>
            <Button className="bg-[#2D2D2D] hover:bg-[#3D3D3D] rounded-none px-8">
              Return to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // ── Success ─────────────────────────────────────────────────────────────────
  const shortId = order?.id?.slice(-6).toUpperCase();

  return (
    <div className="pt-32 pb-16 min-h-screen bg-[#FAF7F2]">
      <div className="container mx-auto px-6 lg:px-12 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="w-20 h-20 bg-[#8B9A7D] rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-serif text-[#2D2D2D] mb-3">Thank You!</h1>
          <p className="text-[#5A5A5A] leading-relaxed">
            Your order <strong>#{shortId}</strong> has been confirmed.
            A receipt has been sent to <strong>{order?.customer_email}</strong>.
          </p>
        </motion.div>

        {/* Order receipt */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white shadow-md p-8 mb-8"
        >
          <div className="flex items-center justify-between mb-6 pb-4 border-b">
            <h2 className="text-lg font-serif text-[#2D2D2D]">Order Receipt</h2>
            <span className="text-sm font-mono text-[#5A5A5A]">#{shortId}</span>
          </div>

          {/* Items */}
          <div className="space-y-4 mb-6">
            {(order?.items || []).map((item, i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  {item.image_url && (
                    <img src={item.image_url} alt={item.product_name}
                      className="w-12 h-12 object-cover bg-[#FAF7F2]" />
                  )}
                  <div>
                    <p className="font-medium text-[#2D2D2D]">{item.product_name}</p>
                    <p className="text-sm text-[#5A5A5A]">Qty: {item.quantity}</p>
                  </div>
                </div>
                <p className="font-medium text-[#2D2D2D]">
                  ₪{(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between text-[#5A5A5A]">
              <span>Subtotal</span>
              <span>₪{order?.subtotal?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[#5A5A5A]">
              <span>Shipping</span>
              <span>{order?.shipping_cost === 0 ? 'Free' : `₪${order?.shipping_cost?.toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between text-lg font-semibold text-[#2D2D2D] pt-2 border-t">
              <span>Total Paid</span>
              <span>₪{order?.total?.toFixed(2)}</span>
            </div>
          </div>

          {/* Shipping address */}
          {order?.shipping_address && (
            <div className="mt-6 pt-4 border-t">
              <p className="text-sm text-[#5A5A5A] mb-1">Shipping to:</p>
              <p className="text-[#2D2D2D] whitespace-pre-line">{order.shipping_address}</p>
            </div>
          )}
        </motion.div>

        <div className="text-center">
          <Link to={createPageUrl('Home')}>
            <Button className="bg-[#2D2D2D] hover:bg-[#3D3D3D] rounded-none px-10">
              <ShoppingBag className="w-4 h-4 mr-2" />
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
