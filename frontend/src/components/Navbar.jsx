import React, { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import AISellModal from './AISellModal';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../api';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const { t, lang, toggleLanguage } = useLanguage();
  const location = useLocation();

  const handleLogout = async () => {
    await api.logout();
    localStorage.removeItem('auth');
    localStorage.removeItem('role');
    localStorage.removeItem('token');
    window.dispatchEvent(new Event('auth-change'));
  };

  const navLinks = [
    { name: t('nav.feed'), path: '/feed' },
    { name: t('nav.messages'), path: '/messages' },
    { name: t('nav.profile'), path: '/profile' },
  ];

  return (
    <>
    <header className="sticky top-0 z-50 w-full border-b border-border-subtle bg-app-bg/90 backdrop-blur-md">
      <div className="w-full px-margin-mobile md:px-margin-desktop h-20 max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to="/feed" className="font-headline-md text-headline-md font-bold text-primary flex items-center gap-xs">
          <span className="material-symbols-outlined text-[28px]" style={{fontVariationSettings: "'FILL' 1"}}>eco</span>
          EcoValue
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-lg">
          {navLinks.map((link) => (
            <NavLink 
              key={link.path} 
              to={link.path} 
              className={({ isActive }) => `font-body-main text-body-main transition-colors ${isActive ? 'text-primary font-bold border-b-2 border-primary pb-1' : 'text-on-surface-variant hover:text-primary'}`}
            >
              {link.name}
            </NavLink>
          ))}
          
          <Link to="/" onClick={handleLogout} className="font-label-caps text-label-caps text-on-surface-variant hover:text-status-error transition-colors px-4 py-2 ml-4 border border-border-subtle rounded-full flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">logout</span>
            {t('nav.signOut')}
          </Link>

          <button onClick={toggleLanguage} className="font-label-caps text-label-caps text-on-surface-variant hover:text-primary transition-colors px-3 py-1 ml-2 border border-border-subtle rounded flex items-center">
            {lang === 'en' ? 'TR' : 'EN'}
          </button>

          <button 
            onClick={() => setIsAIModalOpen(true)}
            className="bg-primary text-on-primary px-lg py-sm rounded-full font-label-caps text-label-caps uppercase tracking-wider shadow-sm hover:scale-105 active:scale-95 transition-all flex items-center gap-xs ml-4"
          >
            <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
            {t('nav.aiSell')}
          </button>
        </nav>

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden p-2 text-on-surface-variant hover:text-primary transition-colors"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="material-symbols-outlined text-[28px]">{isOpen ? 'close' : 'menu'}</span>
        </button>
      </div>

      {/* Mobile Navigation Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-surface-card border-b border-border-subtle overflow-hidden"
          >
            <div className="px-margin-mobile py-lg flex flex-col gap-md text-center">
              {navLinks.map((link) => (
                <NavLink 
                  key={link.path} 
                  to={link.path} 
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) => `font-headline-md text-headline-md transition-colors ${isActive ? 'text-primary font-bold' : 'text-on-surface-variant hover:text-primary'}`}
                >
                  {link.name}
                </NavLink>
              ))}
              <button 
                onClick={() => {
                  setIsOpen(false);
                  setIsAIModalOpen(true);
                }}
                className="mt-sm bg-primary text-on-primary py-md rounded-xl font-title-card text-title-card flex items-center justify-center gap-sm shadow-sm"
              >
                <span className="material-symbols-outlined text-[24px]">auto_awesome</span>
                {t('nav.aiSell')}
              </button>
              <button onClick={toggleLanguage} className="mt-sm border border-border-subtle text-on-surface-variant py-md rounded-xl font-title-card text-title-card flex items-center justify-center">
                Language: {lang === 'en' ? 'English' : 'Türkçe'} (Tap to switch)
              </button>
              <Link 
                to="/" 
                onClick={() => {
                  setIsOpen(false);
                  handleLogout();
                }}
                className="mt-md font-title-card text-title-card text-status-error flex items-center justify-center gap-2 py-3"
              >
                <span className="material-symbols-outlined">logout</span>
                {t('nav.signOut')}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
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
    </>
  );
};

export default Navbar;
