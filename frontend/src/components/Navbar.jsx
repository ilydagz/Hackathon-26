import React, { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X, Sparkles, User, MessageCircle, LogIn } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AISellModal from './AISellModal';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const location = useLocation();
  const isLanding = location.pathname === '/';

  const navLinks = [
    { name: 'Feed', path: '/feed' },
    { name: 'Messages', path: '/messages' },
    { name: 'Profile', path: '/profile' },
  ];

  return (
    <header className="sticky top-0 z-[100] w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="text-2xl font-black tracking-tighter text-secondary flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Sparkles size={18} className="text-white" fill="currentColor" />
          </div>
          EcoValue
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-10">
          {navLinks.map((link) => (
            <NavLink 
              key={link.path} 
              to={link.path} 
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              {link.name}
            </NavLink>
          ))}
          
          <button 
            onClick={() => setIsAIModalOpen(true)}
            className="bg-primary text-white px-6 py-2.5 rounded-full font-bold text-sm uppercase tracking-widest shadow-lg shadow-primary/30 hover:scale-105 transition-all flex items-center gap-2"
          >
            <Sparkles size={16} fill="currentColor" />
            AI ile Hızlı Sat
          </button>
        </nav>

        {/* Auth Actions (Desktop) */}
        {isLanding && (
          <div className="hidden md:flex items-center gap-4">
            <Link to="/login" className="font-bold text-sm uppercase tracking-widest hover:text-primary transition-colors">
              Login
            </Link>
            <Link to="/register" className="bg-secondary text-white px-6 py-2.5 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-secondary/90 transition-all">
              Sign Up
            </Link>
          </div>
        )}

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden p-2 text-secondary"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Navigation Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background border-b border-border overflow-hidden"
          >
            <div className="px-6 py-10 flex flex-col gap-6 text-center">
              {navLinks.map((link) => (
                <NavLink 
                  key={link.path} 
                  to={link.path} 
                  onClick={() => setIsOpen(false)}
                  className="text-2xl font-bold tracking-tighter hover:text-primary"
                >
                  {link.name}
                </NavLink>
              ))}
              <button 
                onClick={() => {
                  setIsOpen(false);
                  setIsAIModalOpen(true);
                }}
                className="mt-4 bg-primary text-white py-5 rounded-2xl font-black text-xl flex items-center justify-center gap-3"
              >
                <Sparkles size={24} fill="currentColor" />
                AI ile Hızlı Sat
              </button>
              {isLanding && (
                <div className="mt-4 flex flex-col gap-4">
                  <Link 
                    to="/login" 
                    onClick={() => setIsOpen(false)}
                    className="font-bold text-sm uppercase tracking-widest"
                  >
                    Login
                  </Link>
                  <Link 
                    to="/register" 
                    onClick={() => setIsOpen(false)}
                    className="bg-secondary text-white py-4 rounded-2xl font-bold text-sm uppercase tracking-widest"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AISellModal 
        isOpen={isAIModalOpen} 
        onClose={() => setIsAIModalOpen(false)} 
        onPublished={() => {
          // You could trigger a refresh of the feed here
          if (location.pathname === '/feed') {
            window.location.reload();
          }
        }}
      />
    </header>
  );
};

export default Navbar;
