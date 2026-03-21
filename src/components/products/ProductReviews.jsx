import React, { useState } from 'react';
import { api } from '@/api/apiClient';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function ProductReviews({ productId }) {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ customer_name: '', customer_email: '', rating: 5, comment: '' });

  const { data: reviews = [] } = useQuery({
    queryKey: ['reviews', productId],
    queryFn: () => api.entities.Review.filter({ product_id: productId, is_approved: true }, '-created_date'),
  });

  const avgRating = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.entities.Review.create({ ...form, product_id: productId, is_approved: false });
    qc.invalidateQueries({ queryKey: ['reviews', productId] });
    setShowForm(false);
    setForm({ customer_name: '', customer_email: '', rating: 5, comment: '' });
  };

  return (
    <div className="mt-16 border-t pt-16">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-serif text-[#2D2D2D]">Customer Reviews</h2>
          {reviews.length > 0 && (
            <div className="flex items-center gap-2 mt-2">
              <div className="flex">{[...Array(5)].map((_, i) => <Star key={i} className={`w-4 h-4 ${i < Math.round(avgRating) ? 'fill-[#C4785A] text-[#C4785A]' : 'text-gray-300'}`} />)}</div>
              <span className="text-[#5A5A5A]">{avgRating} out of 5 ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})</span>
            </div>
          )}
        </div>
        {!showForm && <Button onClick={() => setShowForm(true)} className="bg-[#2D2D2D] hover:bg-[#3D3D3D] rounded-none">Write a Review</Button>}
      </div>
      {showForm && (
        <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleSubmit} className="bg-[#FAF7F2] p-6 rounded-lg mb-8 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div><Label>Your Name *</Label><Input value={form.customer_name} onChange={e => setForm({...form, customer_name: e.target.value})} required className="mt-1 rounded-none" /></div>
            <div><Label>Email *</Label><Input type="email" value={form.customer_email} onChange={e => setForm({...form, customer_email: e.target.value})} required className="mt-1 rounded-none" /></div>
          </div>
          <div>
            <Label>Rating *</Label>
            <div className="flex gap-2 mt-2">
              {[1,2,3,4,5].map(r => (
                <button key={r} type="button" onClick={() => setForm({...form, rating: r})} className="focus:outline-none">
                  <Star className={`w-8 h-8 transition-colors ${r <= form.rating ? 'fill-[#C4785A] text-[#C4785A]' : 'text-gray-300 hover:text-[#C4785A]'}`} />
                </button>
              ))}
            </div>
          </div>
          <div><Label>Your Review *</Label><Textarea value={form.comment} onChange={e => setForm({...form, comment: e.target.value})} rows={4} required className="mt-1 rounded-none" /></div>
          <div className="flex gap-3">
            <Button type="submit" className="bg-[#C4785A] hover:bg-[#B36A4C] rounded-none">Submit Review</Button>
            <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="rounded-none">Cancel</Button>
          </div>
          <p className="text-sm text-[#5A5A5A]">Your review will be published after approval.</p>
        </motion.form>
      )}
      <div className="space-y-6">
        {reviews.length === 0 ? (
          <p className="text-[#5A5A5A] text-center py-8">No reviews yet. Be the first to share your experience!</p>
        ) : reviews.map(review => (
          <motion.div key={review.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="border-b pb-6 last:border-0">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-[#C4785A] rounded-full flex items-center justify-center text-white font-medium flex-shrink-0">{review.customer_name?.charAt(0).toUpperCase()}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-medium text-[#2D2D2D]">{review.customer_name}</p>
                    <p className="text-sm text-[#5A5A5A]">{review.created_date ? format(new Date(review.created_date), 'MMMM d, yyyy') : ''}</p>
                  </div>
                  <div className="flex">{[...Array(5)].map((_, i) => <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-[#C4785A] text-[#C4785A]' : 'text-gray-300'}`} />)}</div>
                </div>
                <p className="text-[#5A5A5A] leading-relaxed">{review.comment}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
