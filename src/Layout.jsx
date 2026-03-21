import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header        from '@/components/shared/Header';
import Footer        from '@/components/shared/Footer';
import FloatingCart  from '@/components/shared/FloatingCart';
import LanguageToggle from '@/components/shared/LanguageToggle';

const ADMIN_PATHS = [
  '/AdminLogin',
  '/AdminDashboard',
  '/AdminProducts',
  '/AdminProductEdit',
  '/AdminOrders',
  '/AdminBlog',
  '/AdminBlogEdit',
  '/AdminReviews',
];

export default function Layout() {
  const location = useLocation();
  const isAdmin   = ADMIN_PATHS.some((p) => location.pathname.startsWith(p));
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const update = () => {
      const cart = JSON.parse(localStorage.getItem('terra-cart') || '[]');
      setCartCount(cart.reduce((s, i) => s + i.quantity, 0));
    };
    update();
    const id = setInterval(update, 500);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {!isAdmin && <Header cartCount={cartCount} />}
      <main className="flex-1">
        <Outlet />
      </main>
      {!isAdmin && <Footer />}
      {!isAdmin && <FloatingCart />}
      {!isAdmin && <LanguageToggle />}
    </div>
  );
}
