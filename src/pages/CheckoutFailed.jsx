import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { api } from '@/api/apiClient';
import { motion } from 'framer-motion';
import { XCircle, ArrowLeft, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CheckoutFailed() {
  useEffect(() => {
    // Mark the pending order as payment_failed so admin can see it
    const urlParams = new URLSearchParams(window.location.search);
    const orderId   = urlParams.get('order_id');
    if (orderId) {
      api.entities.Order.update(orderId, { status: 'payment_failed' }).catch(console.warn);
    }
  }, []);

  return (
    <div className="pt-32 pb-16 min-h-screen bg-[#FAF7F2]">
      <div className="container mx-auto px-6 lg:px-12 text-center max-w-lg">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-10 h-10 text-red-500" />
          </div>

          <h1 className="text-3xl font-serif text-[#2D2D2D] mb-4">Payment Failed</h1>
          <p className="text-[#5A5A5A] leading-relaxed mb-8">
            Your payment could not be processed. No charge was made.
            Please try again or contact us if the problem persists.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={createPageUrl('Cart')}>
              <Button className="bg-[#2D2D2D] hover:bg-[#3D3D3D] rounded-none px-8">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Cart
              </Button>
            </Link>
            <a href="mailto:hello@deborah.studio">
              <Button variant="outline" className="rounded-none px-8">
                <Mail className="w-4 h-4 mr-2" />
                Contact Support
              </Button>
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
