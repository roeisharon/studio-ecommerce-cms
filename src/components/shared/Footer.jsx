import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils/index';
import { useAuth } from '../../lib/AuthContext';
import { api } from '../../api/apiClient';
import { Instagram, Facebook, Mail, MapPin, LogOut } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';

export default function Footer() {
  const { user } = useAuth();

  return (
    <footer className="bg-[#2D2D2D] text-white">
      <div className="container mx-auto px-6 lg:px-12 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">

          {/* Brand */}
          <div>
            <span className="text-3xl font-serif tracking-tight">
              Deborah<span className="text-[#C4785A]">.</span>
            </span>
            <p className="mt-4 text-white/60 leading-relaxed">
              Handcrafted ceramics made with love and intention.
              Each piece tells a story.
            </p>
            <div className="flex gap-4 mt-6">
              <a href="#" className="p-2 bg-white/10 hover:bg-[#C4785A] transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 bg-white/10 hover:bg-[#C4785A] transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-sm font-semibold tracking-wider uppercase mb-6">Shop</h4>
            <nav className="flex flex-col gap-3">
              {['Bowls', 'Vases', 'Mugs', 'Plates'].map((cat) => (
                <Link
                  key={cat}
                  to={createPageUrl(cat)}
                  className="text-white/60 hover:text-[#C4785A] transition-colors"
                >
                  {cat}
                </Link>
              ))}
            </nav>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-semibold tracking-wider uppercase mb-6">Company</h4>
            <nav className="flex flex-col gap-3">
              <Link to={createPageUrl('About')} className="text-white/60 hover:text-[#C4785A] transition-colors">
                Our Story
              </Link>
              <a href="#" className="text-white/60 hover:text-[#C4785A] transition-colors">Shipping Info</a>
              <a href="#" className="text-white/60 hover:text-[#C4785A] transition-colors">Returns Policy</a>
              <a href="#" className="text-white/60 hover:text-[#C4785A] transition-colors">Care Instructions</a>
            </nav>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold tracking-wider uppercase mb-6">Contact</h4>
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#C4785A] flex-shrink-0 mt-0.5" />
                <p className="text-white/60">Timmorim, Israel</p>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-[#C4785A]" />
                <a href="mailto:hello@deborah.studio" className="text-white/60 hover:text-[#C4785A] transition-colors">
                  hello@deborah.studio
                </a>
              </div>
              <div className="flex items-center gap-3">
                <FaWhatsapp className="w-5 h-5 text-[#C4785A]" />
                <a href="https://wa.me/972501234567" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-[#C4785A] transition-colors">
                  WhatsApp
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Instagram className="w-5 h-5 text-[#C4785A]" />
                <a href="https://instagram.com/deborahstudio" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-[#C4785A] transition-colors">
                  @deborahstudio
                </a>
              </div>
            </div>

            {/* Google Map */}
            <div className="mt-6 rounded-lg overflow-hidden h-48">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d16954.869280210194!2d34.76739037456236!3d31.717003628616805!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1502961d1490e0c9%3A0xcd036335f56ee4c0!2z16rXmdee15XXqNeZ150!5e1!3m2!1siw!2sil!4v1772619650549!5m2!1siw!2sil"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/40 text-sm">
            © {new Date().getFullYear()} Deborah Ceramics. All rights reserved.
          </p>
          {/* Admin logout — only visible when logged in */}
          {user && (
            <button
              onClick={() => api.auth.logout()}
              className="text-white/40 hover:text-white transition-colors flex items-center gap-2 text-sm"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          )}
        </div>
      </div>
    </footer>
  );
}