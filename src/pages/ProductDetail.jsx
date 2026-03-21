import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { api } from '@/api/apiClient';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Minus, Plus, ShoppingBag, ArrowLeft, Check, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import ProductReviews from '@/components/products/ProductReviews';

export default function ProductDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');
  
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const savedCart = localStorage.getItem('terra-cart');
    if (savedCart) setCart(JSON.parse(savedCart));
  }, []);

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => api.entities.Product.filter({ id: productId }),
    select: (data) => data[0],
    enabled: !!productId
  });

  const allGalleryItems = product 
    ? [
        { type: 'image', url: product.image_url },
        ...(product.gallery_items || [])
      ].filter(item => item.url) 
    : [];

  const handleAddToCart = () => {
    const existingIndex = cart.findIndex(item => item.product_id === product.id);
    let newCart;
    
    if (existingIndex > -1) {
      newCart = [...cart];
      newCart[existingIndex].quantity += quantity;
    } else {
      newCart = [...cart, {
        product_id: product.id,
        product_name: product.name,
        price: product.price,
        image_url: product.image_url,
        quantity: quantity
      }];
    }
    
    setCart(newCart);
    localStorage.setItem('terra-cart', JSON.stringify(newCart));
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-12">
            <Skeleton className="aspect-[3/4] w-full" />
            <div className="space-y-4">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pt-24 pb-16 text-center">
        <p className="text-[#5A5A5A]">Product not found</p>
        <Link to={createPageUrl('Home')} className="text-[#C4785A] mt-4 inline-block">
          Return to Home
        </Link>
      </div>
    );
  }

  const categoryPage = product.category.charAt(0).toUpperCase() + product.category.slice(1);

  return (
    <div className="pt-24 pb-16 bg-white">
      <div className="container mx-auto px-6 lg:px-12">
        {/* Breadcrumb */}
        <Link 
          to={createPageUrl(categoryPage)} 
          className="inline-flex items-center text-[#5A5A5A] hover:text-[#C4785A] mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to {categoryPage}
        </Link>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Image Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="aspect-[3/4] bg-[#FAF7F2] overflow-hidden relative">
              {allGalleryItems[selectedImage]?.type === 'video' ? (
                <video
                  src={allGalleryItems[selectedImage]?.url}
                  controls
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={allGalleryItems[selectedImage]?.url || 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=800&q=80'}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            {allGalleryItems.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {allGalleryItems.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square overflow-hidden border-2 transition-colors relative ${
                      selectedImage === index ? 'border-[#C4785A]' : 'border-transparent'
                    }`}
                  >
                    {item.type === 'video' ? (
                      <>
                        <video src={item.url} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          <Play className="w-6 h-6 text-white" />
                        </div>
                      </>
                    ) : (
                      <img src={item.url} alt="" className="w-full h-full object-cover" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:py-8"
          >
            <p className="text-[#8B9A7D] text-sm tracking-[0.3em] uppercase font-medium">
              {product.category}
            </p>
            <h1 className="mt-3 text-4xl md:text-5xl font-serif text-[#2D2D2D]">
              {product.name}
            </h1>
            <p className="mt-4 text-3xl text-[#C4785A] font-medium">
              ${product.price?.toFixed(2)}
            </p>

            <p className="mt-6 text-[#5A5A5A] leading-relaxed text-lg">
              {product.description || product.short_description}
            </p>

            {/* Details */}
            {(product.dimensions || product.materials) && (
              <div className="mt-8 space-y-4 py-6 border-y border-gray-200">
                {product.dimensions && (
                  <div className="flex justify-between">
                    <span className="text-[#5A5A5A]">Dimensions</span>
                    <span className="text-[#2D2D2D] font-medium">{product.dimensions}</span>
                  </div>
                )}
                {product.materials && (
                  <div className="flex justify-between">
                    <span className="text-[#5A5A5A]">Materials</span>
                    <span className="text-[#2D2D2D] font-medium">{product.materials}</span>
                  </div>
                )}
              </div>
            )}

            {/* Quantity & Add to Cart */}
            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-sm text-[#5A5A5A]">Quantity</span>
                <div className="flex items-center border border-gray-300">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 hover:bg-gray-50 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-3 hover:bg-gray-50 transition-colors"
                    disabled={product.stock > 0 && quantity >= product.stock}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {product.stock > 0 && (
                  <span className="text-sm text-[#8B9A7D]">{product.stock} in stock</span>
                )}
              </div>

              <Button
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                size="lg"
                className={`w-full rounded-none py-6 text-base transition-all ${
                  addedToCart 
                    ? 'bg-[#8B9A7D] hover:bg-[#8B9A7D]' 
                    : 'bg-[#2D2D2D] hover:bg-[#3D3D3D]'
                }`}
              >
                {addedToCart ? (
                  <>
                    <Check className="w-5 h-5 mr-2" />
                    Added to Cart
                  </>
                ) : product.stock <= 0 ? (
                  'Sold Out'
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5 mr-2" />
                    Add to Cart
                  </>
                )}
              </Button>
            </div>

            {/* Care Instructions */}
            {product.care_instructions && (
              <div className="mt-10">
                <h3 className="text-sm font-semibold tracking-wider uppercase text-[#2D2D2D] mb-3">
                  Care Instructions
                </h3>
                <p className="text-[#5A5A5A] leading-relaxed">
                  {product.care_instructions}
                </p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Reviews Section */}
        <ProductReviews productId={productId} />
      </div>
    </div>
  );
}