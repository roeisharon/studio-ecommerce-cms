import React, { useState } from 'react';
import { api } from '@/api/apiClient';
import { sendCustomOrderEmails } from '@/lib/emailService';
import { motion } from 'framer-motion';
import { Sparkles, Upload, Check, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function CustomOrder() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted]       = useState(false);
  const [isUploading, setIsUploading]   = useState(false);
  const [error, setError]               = useState('');

  const [form, setForm] = useState({
    customer_name:       '',
    customer_email:      '',
    customer_phone:      '',
    request_title:       '',
    request_description: '',
    reference_images:    [],
    budget:              '',
    timeline:            '',
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const { file_url } = await api.integrations.Core.UploadFile({ file });
      setForm({ ...form, reference_images: [...form.reference_images, file_url] });
    } catch (err) {
      console.error('Image upload failed:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index) => {
    setForm({ ...form, reference_images: form.reference_images.filter((_, i) => i !== index) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    // Snapshot form before async calls
    const snap = { ...form };

    try {
      // 1. Save to Firestore
      const created = await api.entities.PersonalOrder.create({
        ...snap,
        status: 'pending',
      });

      const order = { ...snap, id: created.id };

      // 2. Notify admin by email
      await sendCustomOrderEmails(order);

      setSubmitted(true);
    } catch (err) {
      console.error('Custom order submission failed:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSubmitted(false);
    setForm({
      customer_name: '', customer_email: '', customer_phone: '',
      request_title: '', request_description: '',
      reference_images: [], budget: '', timeline: '',
    });
  };

  if (submitted) {
    return (
      <div className="pt-32 pb-16 min-h-screen bg-[#FAF7F2] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-lg bg-white p-12 rounded-lg shadow-lg"
        >
          <div className="w-20 h-20 bg-[#8B9A7D] rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-serif text-[#2D2D2D] mb-4">Request Received!</h2>
          <p className="text-[#5A5A5A] mb-8 leading-relaxed">
            Thank you for your custom order request. We will review your vision and
            get back to you within 5–7 business days with a quote and timeline.
          </p>
          <Button onClick={resetForm} className="bg-[#2D2D2D] hover:bg-[#3D3D3D] rounded-none">
            Submit Another Request
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-16 min-h-screen bg-[#FAF7F2]">
      <div className="container mx-auto px-6 lg:px-12 max-w-3xl">

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="w-16 h-16 bg-[#C4785A] rounded-full flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <span className="text-[#C4785A] text-sm tracking-[0.3em] uppercase font-medium">Custom Orders</span>
          <h1 className="mt-3 text-5xl md:text-6xl font-serif text-[#2D2D2D]">Bring Your Vision to Life</h1>
          <p className="mt-4 text-[#5A5A5A] max-w-2xl mx-auto leading-relaxed">
            We love creating custom pieces that tell your unique story. Share your
            ideas with us and we will work together to craft something truly special.
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onSubmit={handleSubmit}
          className="bg-white p-8 md:p-12 shadow-lg space-y-6"
        >
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="customer_name">Your Name *</Label>
              <Input id="customer_name" name="customer_name" value={form.customer_name}
                onChange={handleChange} required className="mt-1 rounded-none" />
            </div>
            <div>
              <Label htmlFor="customer_email">Email *</Label>
              <Input id="customer_email" name="customer_email" type="email"
                value={form.customer_email} onChange={handleChange} required className="mt-1 rounded-none" />
            </div>
          </div>

          <div>
            <Label htmlFor="customer_phone">Phone Number</Label>
            <Input id="customer_phone" name="customer_phone" type="tel"
              value={form.customer_phone} onChange={handleChange} className="mt-1 rounded-none" />
          </div>

          <div>
            <Label htmlFor="request_title">Project Title *</Label>
            <Input id="request_title" name="request_title" value={form.request_title}
              onChange={handleChange} placeholder="e.g., Custom dinnerware set for 6"
              required className="mt-1 rounded-none" />
          </div>

          <div>
            <Label htmlFor="request_description">Describe Your Vision *</Label>
            <Textarea id="request_description" name="request_description"
              value={form.request_description} onChange={handleChange} rows={6}
              placeholder="Tell us about your ideal piece(s)... What style, colors, size, purpose? The more details, the better!"
              required className="mt-1 rounded-none" />
          </div>

          <div>
            <Label>Reference Images (Optional)</Label>
            <p className="text-sm text-[#5A5A5A] mt-1 mb-3">
              Upload photos that inspire you or show what you are looking for
            </p>
            <div className="flex flex-wrap gap-4">
              {form.reference_images.map((url, index) => (
                <div key={index} className="relative w-24 h-24 bg-[#FAF7F2] rounded-lg overflow-hidden">
                  <img src={url} alt={`Reference ${index + 1}`} className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {form.reference_images.length < 5 && (
                <label className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-[#C4785A] transition-colors">
                  {isUploading ? (
                    <Loader2 className="w-6 h-6 text-[#C4785A] animate-spin" />
                  ) : (
                    <><Upload className="w-6 h-6 text-gray-400" /><span className="text-xs text-gray-400 mt-1">Upload</span></>
                  )}
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label>Budget Range</Label>
              <Select value={form.budget} onValueChange={(val) => setForm({ ...form, budget: val })}>
                <SelectTrigger className="mt-1 rounded-none"><SelectValue placeholder="Select budget" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="under_200">Under $200</SelectItem>
                  <SelectItem value="200_500">$200 - $500</SelectItem>
                  <SelectItem value="500_1000">$500 - $1,000</SelectItem>
                  <SelectItem value="1000_2000">$1,000 - $2,000</SelectItem>
                  <SelectItem value="over_2000">Over $2,000</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Desired Timeline</Label>
              <Select value={form.timeline} onValueChange={(val) => setForm({ ...form, timeline: val })}>
                <SelectTrigger className="mt-1 rounded-none"><SelectValue placeholder="Select timeline" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="flexible">Flexible</SelectItem>
                  <SelectItem value="1_month">Within 1 month</SelectItem>
                  <SelectItem value="2_months">1-2 months</SelectItem>
                  <SelectItem value="3_months">2-3 months</SelectItem>
                  <SelectItem value="urgent">Urgent (special event)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded">{error}</div>
          )}

          <div className="pt-6 border-t">
            <Button type="submit" disabled={isSubmitting} size="lg"
              className="w-full bg-[#C4785A] hover:bg-[#B36A4C] rounded-none py-6">
              {isSubmitting ? (
                <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Submitting...</>
              ) : (
                <><Sparkles className="w-5 h-5 mr-2" />Submit Custom Order Request</>
              )}
            </Button>
          </div>
        </motion.form>
      </div>
    </div>
  );
}