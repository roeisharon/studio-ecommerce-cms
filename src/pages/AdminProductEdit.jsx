import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { api } from '@/api/apiClient';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Loader2, Upload, X, Plus, Video, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AdminProductEdit() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');
  const isEdit = !!productId;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [user, setUser] = useState(null);
  
  const [form, setForm] = useState({
    name: '',
    description: '',
    short_description: '',
    price: '',
    category: '',
    image_url: '',
    gallery_items: [],
    stock: '',
    featured: false,
    is_active: true,
    dimensions: '',
    materials: '',
    care_instructions: ''
  });

  useEffect(() => {
    const checkAuth = async () => {
      const isAuth = await api.auth.isAuthenticated();
      if (isAuth) {
        const userData = await api.auth.me();
        setUser(userData);
      } else {
        api.auth.redirectToLogin(createPageUrl('AdminProductEdit'));
      }
    };
    checkAuth();
  }, []);

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => api.entities.Product.filter({ id: productId }),
    select: (data) => data[0],
    enabled: isEdit
  });

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name || '',
        description: product.description || '',
        short_description: product.short_description || '',
        price: product.price?.toString() || '',
        category: product.category || '',
        image_url: product.image_url || '',
        gallery_items: product.gallery_items || [],
        stock: product.stock?.toString() || '',
        featured: product.featured || false,
        is_active: product.is_active !== false,
        dimensions: product.dimensions || '',
        materials: product.materials || '',
        care_instructions: product.care_instructions || ''
      });
    }
  }, [product]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageUpload = async (e, isGallery = false) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError('');
    try {
      const { file_url } = await api.integrations.Core.UploadFile({ file });
      if (isGallery) {
        const type = file.type.startsWith('video/') ? 'video' : 'image';
        setForm(prev => ({ ...prev, gallery_items: [...prev.gallery_items, { type, url: file_url }] }));
      } else {
        setForm(prev => ({ ...prev, image_url: file_url }));
      }
    } catch (err) {
      console.error('Upload failed:', err);
      const msg = err?.code === 'storage/unauthorized'
        ? 'Upload blocked: check your Firebase Storage rules (see README).'
        : err?.code === 'storage/unknown' || err?.message?.includes('CORS')
        ? 'CORS error: open Firebase Storage in the console and check the bucket is initialized.'
        : `Upload failed: ${err?.message || err?.code || 'unknown error'}`;
      setUploadError(msg);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const removeGalleryItem = (index) => {
    setForm(prev => ({ ...prev, gallery_items: prev.gallery_items.filter((_, i) => i !== index) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const data = {
      ...form,
      price: parseFloat(form.price) || 0,
      stock: parseInt(form.stock) || 0
    };

    if (isEdit) {
      await api.entities.Product.update(productId, data);
    } else {
      await api.entities.Product.create(data);
    }

    queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    navigate(createPageUrl('AdminProducts'));
  };

  if (!user || (isEdit && isLoading)) {
    return (
      <div className="pt-32 pb-16 min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#C4785A]" />
      </div>
    );
  }

  return (
    <div className="pt-28 pb-16 min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 lg:px-12 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link 
            to={createPageUrl('AdminProducts')} 
            className="inline-flex items-center text-[#5A5A5A] hover:text-[#C4785A] mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Products
          </Link>
          
          <h1 className="text-3xl font-serif text-[#2D2D2D]">
            {isEdit ? 'Edit Product' : 'Add New Product'}
          </h1>
        </div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* Basic Info */}
          <div className="bg-white p-8 shadow-md">
            <h2 className="text-lg font-semibold text-[#2D2D2D] mb-6">Basic Information</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="mt-1 rounded-none"
                />
              </div>

              <div>
                <Label htmlFor="category">Category *</Label>
                <Select 
                  value={form.category} 
                  onValueChange={(val) => setForm({ ...form, category: val })}
                >
                  <SelectTrigger className="mt-1 rounded-none">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bowls">Bowls</SelectItem>
                    <SelectItem value="vases">Vases</SelectItem>
                    <SelectItem value="mugs">Mugs</SelectItem>
                    <SelectItem value="plates">Plates</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="price">Price ($) *</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.price}
                  onChange={handleChange}
                  required
                  className="mt-1 rounded-none"
                />
              </div>

              <div>
                <Label htmlFor="stock">Stock Quantity</Label>
                <Input
                  id="stock"
                  name="stock"
                  type="number"
                  min="0"
                  value={form.stock}
                  onChange={handleChange}
                  className="mt-1 rounded-none"
                />
              </div>

              <div className="flex items-center gap-8">
                <div className="flex items-center gap-2">
                  <Switch
                    id="featured"
                    checked={form.featured}
                    onCheckedChange={(val) => setForm({ ...form, featured: val })}
                  />
                  <Label htmlFor="featured">Featured</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="is_active"
                    checked={form.is_active}
                    onCheckedChange={(val) => setForm({ ...form, is_active: val })}
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="short_description">Short Description</Label>
                <Input
                  id="short_description"
                  name="short_description"
                  value={form.short_description}
                  onChange={handleChange}
                  placeholder="Brief description for product cards"
                  className="mt-1 rounded-none"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="description">Full Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={4}
                  className="mt-1 rounded-none"
                />
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="bg-white p-8 shadow-md">
            <h2 className="text-lg font-semibold text-[#2D2D2D] mb-6">Images</h2>
            {uploadError && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                <strong>Upload Error:</strong> {uploadError}
              </div>
            )}
            
            <div className="space-y-6">
              <div>
                <Label>Main Image</Label>
                <div className="mt-2 flex items-start gap-4">
                  {form.image_url ? (
                    <div className="relative w-32 h-40 bg-[#FAF7F2]">
                      <img
                        src={form.image_url}
                        alt="Product"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, image_url: '' })}
                        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <label className="w-32 h-40 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-[#C4785A] transition-colors">
                      <Upload className="w-6 h-6 text-gray-400" />
                      <span className="text-sm text-gray-400 mt-2">Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, false)}
                        className="hidden"
                      />
                    </label>
                  )}
                  {isUploading && <Loader2 className="w-5 h-5 animate-spin" />}
                </div>
              </div>

              <div>
                <Label>Gallery Images & Videos</Label>
                <p className="text-xs text-[#5A5A5A] mt-1 mb-3">Add extra images or videos shown in the product gallery</p>
                <div className="flex flex-wrap gap-4">
                  {form.gallery_items.map((item, index) => (
                    <div key={index} className="relative w-24 h-24 bg-[#FAF7F2]">
                      {item.type === 'video' ? (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-800 text-white">
                          <Video className="w-6 h-6 mb-1" />
                          <span className="text-xs">Video</span>
                        </div>
                      ) : (
                        <img
                          src={item.url}
                          alt={`Gallery ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      )}
                      <button
                        type="button"
                        onClick={() => removeGalleryItem(index)}
                        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <label className="w-24 h-24 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-[#C4785A] transition-colors">
                    {isUploading ? (
                      <Loader2 className="w-5 h-5 animate-spin text-[#C4785A]" />
                    ) : (
                      <>
                        <Plus className="w-5 h-5 text-gray-400" />
                        <span className="text-xs text-gray-400 mt-1 text-center px-1">Image / Video</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*,video/*"
                      onChange={(e) => handleImageUpload(e, true)}
                      className="hidden"
                      disabled={isUploading}
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Details */}
          <div className="bg-white p-8 shadow-md">
            <h2 className="text-lg font-semibold text-[#2D2D2D] mb-6">Additional Details</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="dimensions">Dimensions</Label>
                <Input
                  id="dimensions"
                  name="dimensions"
                  value={form.dimensions}
                  onChange={handleChange}
                  placeholder='e.g., 4" x 6" x 3"'
                  className="mt-1 rounded-none"
                />
              </div>

              <div>
                <Label htmlFor="materials">Materials</Label>
                <Input
                  id="materials"
                  name="materials"
                  value={form.materials}
                  onChange={handleChange}
                  placeholder="e.g., Stoneware, Food-safe glaze"
                  className="mt-1 rounded-none"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="care_instructions">Care Instructions</Label>
                <Textarea
                  id="care_instructions"
                  name="care_instructions"
                  value={form.care_instructions}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Dishwasher and microwave safe..."
                  className="mt-1 rounded-none"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Link to={createPageUrl('AdminProducts')}>
              <Button type="button" variant="outline" className="rounded-none">
                Cancel
              </Button>
            </Link>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-[#2D2D2D] hover:bg-[#3D3D3D] rounded-none"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {isEdit ? 'Update Product' : 'Create Product'}
                </>
              )}
            </Button>
          </div>
        </motion.form>
      </div>
    </div>
  );
}