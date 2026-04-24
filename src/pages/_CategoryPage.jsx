import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/apiClient';
import CategoryHero from '@/components/products/CategoryHero';
import ProductGrid from '@/components/products/ProductGrid';
import EnhancedFilters from '@/components/products/EnhancedFilters';

const CONFIG = {
  bowls:  { title: 'Bowls', description: 'Handcrafted ceramic bowls for everyday beauty.', image: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=1200&q=80' },
  vases:  { title: 'Vases', description: 'Statement pieces that transform any space.', image: 'https://images.unsplash.com/photo-1567225557594-88d73e55f2cb?w=1200&q=80' },
  mugs:   { title: 'Mugs', description: 'Morning rituals made special.', image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=1200&q=80' },
  plates: { title: 'Plates', description: 'Everyday elegance for your table.', image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=1200&q=80' },
};

export default function CategoryPage({ category }) {
  const cfg = CONFIG[category];
  const [search, setSearch] = useState('');
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [sortBy, setSortBy] = useState('newest');
  const [inStock, setInStock] = useState(false);
  const queryClient = useQueryClient();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products', category],
    queryFn: () => api.entities.Product.filter({ category, is_active: true }),
  });

  const filtered = products
    .filter(p => !search || p.name?.toLowerCase().includes(search.toLowerCase()))
    .filter(p => p.price >= priceRange[0] && p.price <= priceRange[1])
    .filter(p => !inStock || p.stock > 0)
    .sort((a, b) => {
      if (sortBy === 'price_low') return a.price - b.price;
      if (sortBy === 'price_high') return b.price - a.price;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return new Date(b.created_date) - new Date(a.created_date);
    });

  const addToCart = (product) => {
    const cart = JSON.parse(localStorage.getItem('terra-cart') || '[]');
    const idx = cart.findIndex(i => i.product_id === product.id);
    if (idx >= 0) { cart[idx].quantity += 1; } 
    else { cart.push({ product_id: product.id, product_name: product.name, price: product.price, image_url: product.image_url, quantity: 1 }); }
    localStorage.setItem('terra-cart', JSON.stringify(cart));
  };

  return (
    <div>
      <CategoryHero title={cfg.title} description={cfg.description} image={cfg.image} />
      <div className="container mx-auto px-6 lg:px-12 py-16">
        <EnhancedFilters search={search} setSearch={setSearch} priceRange={priceRange} setPriceRange={setPriceRange} sortBy={sortBy} setSortBy={setSortBy} inStock={inStock} setInStock={setInStock} />
        <ProductGrid products={filtered} isLoading={isLoading} onAddToCart={addToCart} />
      </div>
    </div>
  );
}
