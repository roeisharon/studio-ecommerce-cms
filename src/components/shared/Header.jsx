import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { createPageUrl } from '../../utils/index';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ShoppingBag } from 'lucide-react';

const navLinks = [
  { name: 'Home',         page: 'Home' },
  { name: 'Bowls',        page: 'Bowls' },
  { name: 'Vases',        page: 'Vases' },
  { name: 'Mugs',         page: 'Mugs' },
  { name: 'Plates',       page: 'Plates' },
  { name: 'About',        page: 'About' },
  { name: 'Custom Order', page: 'CustomOrder' },
];

const LOGO_TAP_COUNT     = parseInt(import.meta.env.VITE_ADMIN_TAP_COUNT || '0', 10);
const LOGO_TAP_WINDOW_MS = 3000;

export default function Header() {
  const [isScrolled, setIsScrolled]             = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const tapCount = useRef(0);
  const tapTimer = useRef(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMobileMenuOpen]);

  // Secret tap handler — use onTouchEnd for reliability on iOS
  const handleLogoTouchEnd = (e) => {
    if (!LOGO_TAP_COUNT) return;

    tapCount.current += 1;
    clearTimeout(tapTimer.current);
    tapTimer.current = setTimeout(() => { tapCount.current = 0; }, LOGO_TAP_WINDOW_MS);

    if (tapCount.current >= LOGO_TAP_COUNT) {
      tapCount.current = 0;
      clearTimeout(tapTimer.current);
      e.preventDefault();
      navigate('/AdminLogin');
    }
  };

  const isActive = (page) => {
    if (page === 'Home') return location.pathname === '/';
    return location.pathname === '/' + page;
  };

  const headerBg = isScrolled
    ? 'bg-white/95 backdrop-blur-sm shadow-sm'
    : 'bg-transparent';

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${headerBg}`}>
        <div className="container mx-auto px-4 lg:px-12">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link
              to={createPageUrl('Home')}
              onTouchEnd={handleLogoTouchEnd}
              className="flex items-center flex-shrink-0 select-none"
            >
              <span className="text-xl lg:text-2xl font-serif text-[#2D2D2D] tracking-tight">
                Deborah<span className="text-[#C4785A]">.</span>
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.page}
                  to={createPageUrl(link.page)}
                  className={`text-sm tracking-wide transition-colors hover:text-[#C4785A] ${
                    isActive(link.page) ? 'text-[#C4785A]' : 'text-[#2D2D2D]'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            {/* Mobile hamburger */}
            <button
              type="button"
              onTouchEnd={(e) => { e.stopPropagation(); setIsMobileMenuOpen(true); }}
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 -mr-1 touch-manipulation"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6 text-[#2D2D2D]" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu — rendered in place, high z-index */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 9999 }}
          >
            {/* Backdrop */}
            <div
              style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }}
              onClick={() => setIsMobileMenuOpen(false)}
              onTouchEnd={() => setIsMobileMenuOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              style={{
                position: 'absolute', top: 0, right: 0, bottom: 0,
                width: '280px', background: '#fff',
                padding: '24px', display: 'flex', flexDirection: 'column',
                overflowY: 'auto',
              }}
            >
              {/* Drawer header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <span style={{ fontSize: '22px', fontFamily: 'Georgia, serif', color: '#2D2D2D' }}>
                  Deborah<span style={{ color: '#C4785A' }}>.</span>
                </span>
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  onTouchEnd={() => setIsMobileMenuOpen(false)}
                  style={{ padding: '4px' }}
                  aria-label="Close menu"
                >
                  <X style={{ width: 24, height: 24, color: '#2D2D2D' }} />
                </button>
              </div>

              {/* Nav links */}
              <nav style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {navLinks.map((link) => (
                  <Link
                    key={link.page}
                    to={createPageUrl(link.page)}
                    onClick={() => setIsMobileMenuOpen(false)}
                    style={{
                      padding: '14px 0',
                      borderBottom: '1px solid #f0f0f0',
                      fontSize: '16px',
                      color: isActive(link.page) ? '#C4785A' : '#2D2D2D',
                      fontWeight: isActive(link.page) ? 600 : 400,
                      textDecoration: 'none',
                    }}
                  >
                    {link.name}
                  </Link>
                ))}
              </nav>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}