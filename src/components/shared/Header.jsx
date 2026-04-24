import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { createPageUrl } from '../../utils/index';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';

const navLinks = [
  { name: 'Home',         page: 'Home' },
  { name: 'Bowls',        page: 'Bowls' },
  { name: 'Vases',        page: 'Vases' },
  { name: 'Mugs',         page: 'Mugs' },
  { name: 'Plates',       page: 'Plates' },
  { name: 'About',        page: 'About' },
  { name: 'Custom Order', page: 'CustomOrder' },
];

// Number of taps on the logo required to open admin login on mobile
// Set VITE_ADMIN_TAP_COUNT in your .env file
const LOGO_TAP_COUNT = parseInt(import.meta.env.VITE_ADMIN_TAP_COUNT || '0', 10);
const LOGO_TAP_WINDOW_MS = 3000;

export default function Header({ cartCount = 0 }) {
  const [isScrolled, setIsScrolled]         = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location  = useLocation();
  const navigate  = useNavigate();
  const tapCount  = useRef(0);
  const tapTimer  = useRef(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  // Secret tap handler — tap logo LOGO_TAP_COUNT times within LOGO_TAP_WINDOW_MS
  const handleLogoTap = (e) => {
    // Only intercept on touch / mobile — desktop uses keyboard sequence
    if (!window.matchMedia('(hover: none)').matches) return;

    e.preventDefault();
    tapCount.current += 1;

    clearTimeout(tapTimer.current);
    tapTimer.current = setTimeout(() => {
      tapCount.current = 0;
    }, LOGO_TAP_WINDOW_MS);

    if (tapCount.current >= LOGO_TAP_COUNT) {
      tapCount.current = 0;
      clearTimeout(tapTimer.current);
      navigate('/AdminLogin');
    }
  };

  const headerBg = isScrolled
    ? 'bg-white/95 backdrop-blur-sm shadow-sm py-3'
    : 'bg-transparent py-5';

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${headerBg}`}>
        <div className="container mx-auto px-4 lg:px-12">
          <div className="flex items-center justify-between h-12">

            {/* Logo */}
            <Link
              to={createPageUrl('Home')}
              onClick={handleLogoTap}
              className="flex items-center flex-shrink-0"
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
                    location.pathname === '/' + link.page || location.pathname === '/'  && link.page === 'Home'
                      ? 'text-[#C4785A]'
                      : 'text-[#2D2D2D]'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            {/* Mobile hamburger */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 -mr-2"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6 text-[#2D2D2D]" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 lg:hidden"
          >
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="absolute right-0 top-0 bottom-0 w-72 bg-white p-6 flex flex-col"
            >
              <div className="flex justify-between items-center mb-8">
                <span className="text-2xl font-serif text-[#2D2D2D]">
                  Deborah<span className="text-[#C4785A]">.</span>
                </span>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1"
                  aria-label="Close menu"
                >
                  <X className="w-6 h-6 text-[#2D2D2D]" />
                </button>
              </div>

              <nav className="flex flex-col gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.page}
                    to={createPageUrl(link.page)}
                    className={`text-base py-3 border-b border-gray-100 transition-colors ${
                      location.pathname === '/' + link.page
                        ? 'text-[#C4785A] font-medium'
                        : 'text-[#2D2D2D] hover:text-[#C4785A]'
                    }`}
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