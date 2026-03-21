import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/apiClient';
import Hero from '@/components/home/Hero';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import Categories from '@/components/home/Categories';
import AboutTeaser from '@/components/home/AboutTeaser';
import Testimonials from '@/components/home/Testimonials';
import LatestBlog from '@/components/home/LatestBlog';
import FAQ from '@/components/home/FAQ';
import Newsletter from '@/components/home/Newsletter';

export default function Home() {
  const { data: featuredProducts = [] } = useQuery({
    queryKey: ['featured-products'],
    queryFn: () => api.entities.Product.filter({ featured: true, is_active: true }),
  });
  const { data: blogPosts = [] } = useQuery({
    queryKey: ['latest-blog'],
    queryFn: () => api.entities.Blog.filter({ is_published: true }, '-published_date'),
  });
  const latestPost = blogPosts[0] || null;

  const addToCart = (product) => {
    const cart = JSON.parse(localStorage.getItem('terra-cart') || '[]');
    const idx = cart.findIndex(i => i.product_id === product.id);
    if (idx >= 0) cart[idx].quantity += 1;
    else cart.push({ product_id: product.id, product_name: product.name, price: product.price, image_url: product.image_url, quantity: 1 });
    localStorage.setItem('terra-cart', JSON.stringify(cart));
  };

  return (
    <div>
      <Hero />
      <FeaturedProducts products={featuredProducts} onAddToCart={addToCart} />
      <Categories />
      <AboutTeaser />
      <Testimonials />
      {latestPost && <LatestBlog post={latestPost} />}
      <FAQ />
      <Newsletter />
    </div>
  );
}
