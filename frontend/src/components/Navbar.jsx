import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import AISellModal from './AISellModal';
import SettingsModal from './SettingsModal';
import { useLanguage } from '../context/LanguageContext';
import { useNotifications } from '../context/NotificationContext';
import { api } from '../api';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, lang, toggleLanguage } = useLanguage();
  const { unreadCount, notifications, clearNotifications, resetNotifications } = useNotifications();
  
  const [isOpen, setIsOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [user, setUser] = useState({ name: 'User', avatar_url: null });
  const [activeToast, setActiveToast] = useState(null);
  const [lastNotificationId, setLastNotificationId] = useState(0);

  const avatarSrc = user.avatar_url
    ? (user.avatar_url.startsWith('http') ? user.avatar_url : `http://localhost:8000/static/${user.avatar_url}`)
    : '';

  useEffect(() => {
    if (notifications.length > 0) {
      const latest = notifications[0];
      if (latest.id > lastNotificationId) {
        setLastNotificationId(latest.id);
        setActiveToast(latest);
        const timer = setTimeout(() => setActiveToast(null), 5000);
        return () => clearTimeout(timer);
      }
    }
  }, [notifications, lastNotificationId]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await api.getMe();
        setUser(data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    await api.logout();
    resetNotifications();
    localStorage.removeItem('auth');
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    window.dispatchEvent(new Event('auth-change'));
    navigate('/');
  };

  const navLinks = [
    { name: t('nav.feed'), path: '/feed' },
    { name: t('nav.messages'), path: '/messages' },
    { name: t('nav.profile'), path: '/profile' },
    { name: t('nav.myPosts') || 'My Posts', path: '/my-posts' },
    { name: t('nav.favorites') || 'Favorites', path: '/favorites' },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 h-20 bg-surface-card/90 backdrop-blur-md border-b border-border-subtle z-50 px-margin-mobile md:px-margin-desktop">
        <div className="h-full max-w-7xl mx-auto flex items-center justify-between">
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

            <div className="flex items-center gap-sm ml-4">
              <Link
                to="/profile"
                className="hidden lg:flex items-center gap-2 rounded-full border border-border-subtle bg-surface-muted/60 px-2 py-1 pr-3 hover:bg-surface-muted transition-colors"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden bg-surface-muted flex items-center justify-center text-xs font-bold text-on-surface-variant">
                  {avatarSrc ? (
                    <img src={avatarSrc} alt={user.name || 'Profile'} className="w-full h-full object-cover" />
                  ) : (
                    (user.name || 'U').substring(0, 2).toUpperCase()
                  )}
                </div>
                <span className="font-body-sm text-body-sm text-on-surface-variant max-w-[120px] truncate">{user.name || t('profile.info')}</span>
              </Link>

              {/* Notifications */}
              <div className="relative">
                <button 
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    if (!showNotifications) clearNotifications();
                  }}
                  className={`p-2 rounded-xl transition-all relative ${showNotifications ? 'bg-primary/10 text-primary' : 'hover:bg-surface-muted text-on-surface-variant'}`}
                >
                  <span className="material-symbols-outlined text-[22px]">notifications</span>
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-status-error text-[10px] text-white flex items-center justify-center rounded-full font-bold border-2 border-surface-card">
                      {unreadCount}
                    </span>
                  )}
                </button>

                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-80 bg-surface-card border border-border-subtle rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl z-[600]"
                    >
                      <div className="p-4 border-b border-border-subtle flex justify-between items-center bg-surface-muted/30">
                        <span className="font-title-card text-sm text-on-background">{t('notif.title')}</span>
                        <button onClick={() => setShowNotifications(false)} className="text-text-secondary hover:text-on-surface">
                          <span className="material-symbols-outlined text-[18px]">close</span>
                        </button>
                      </div>
                      <div className="p-2 max-h-96 overflow-y-auto space-y-1 no-scrollbar">
                        {notifications.length > 0 ? notifications.map(n => (
                          <div key={n.id} className="p-3 rounded-xl hover:bg-surface-muted flex gap-3 transition-colors cursor-pointer">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${n.type === 'message' ? 'bg-primary/10 text-primary' : 'bg-status-success/10 text-status-success'}`}>
                              <span className="material-symbols-outlined text-[20px]">{n.type === 'message' ? 'chat' : 'info'}</span>
                            </div>
                            <div>
                              <p className="font-title-card text-xs text-on-surface">
                                {n.titleKey ? t(n.titleKey, n.variables) : n.title}
                              </p>
                              <p className="font-body-sm text-[11px] text-text-secondary">
                                {n.messageKey ? t(n.messageKey, n.variables) : n.message}
                              </p>
                            </div>
                          </div>
                        )) : (
                          <div className="p-8 text-center text-text-secondary italic font-body-sm">
                            {t('notif.noNotifs')}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Settings */}
              <button 
                onClick={() => setIsSettingsOpen(true)}
                className="p-2 rounded-xl hover:bg-surface-muted text-on-surface-variant transition-all"
              >
                <span className="material-symbols-outlined text-[22px]">settings</span>
              </button>
            </div>
            
            <Link to="/" onClick={handleLogout} className="font-label-caps text-label-caps text-on-surface-variant hover:text-status-error transition-colors px-4 py-2 ml-2 border border-border-subtle rounded-full flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">logout</span>
              {t('nav.signOut')}
            </Link>

            <button onClick={toggleLanguage} className="font-label-caps text-label-caps text-on-surface-variant hover:text-primary transition-colors px-3 py-1 ml-1 border border-border-subtle rounded flex items-center">
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

                <Link
                  to="/profile"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-3 rounded-2xl border border-border-subtle bg-surface-muted/60 px-4 py-3"
                >
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-surface-card flex items-center justify-center text-sm font-bold text-on-surface-variant">
                    {avatarSrc ? (
                      <img src={avatarSrc} alt={user.name || 'Profile'} className="w-full h-full object-cover" />
                    ) : (
                      (user.name || 'U').substring(0, 2).toUpperCase()
                    )}
                  </div>
                  <div className="text-left">
                    <p className="font-title-card text-sm text-on-surface">{user.name || t('profile.info')}</p>
                    <p className="font-body-sm text-[11px] text-text-secondary">{t('nav.profile')}</p>
                  </div>
                </Link>
                
                <div className="flex justify-center gap-lg py-4 border-y border-border-subtle">
                   <button 
                    onClick={() => {setIsOpen(false); setShowNotifications(true); clearNotifications();}}
                    className="relative flex flex-col items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[28px]">notifications</span>
                    <span className="text-[10px] uppercase font-bold">{t('notif.alerts')}</span>
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-status-error text-[10px] text-white flex items-center justify-center rounded-full font-bold border-2 border-surface-card">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                  <button 
                    onClick={() => {setIsOpen(false); setIsSettingsOpen(true);}}
                    className="flex flex-col items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[28px]">settings</span>
                    <span className="text-[10px] uppercase font-bold">{t('settings.title')}</span>
                  </button>
                </div>

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
                  {lang === 'en' ? 'Türkçe' : 'English'}
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
          if (location.pathname === '/feed') window.location.reload();
        }}
      />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

      {/* Toast Notification Pop-up */}
      <AnimatePresence>
        {activeToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed bottom-8 right-8 z-[1000] w-full max-w-[320px] bg-inverse-surface text-inverse-on-surface p-4 rounded-2xl shadow-2xl flex items-center gap-4 cursor-pointer"
            onClick={() => setActiveToast(null)}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${activeToast.type === 'message' ? 'bg-primary text-on-primary' : 'bg-status-success text-white'}`}>
              <span className="material-symbols-outlined text-[20px]">{activeToast.type === 'message' ? 'chat' : 'info'}</span>
            </div>
            <div className="flex-1">
              <p className="font-title-card text-sm">
                {activeToast.titleKey ? t(activeToast.titleKey, activeToast.variables) : activeToast.title}
              </p>
              <p className="font-body-sm text-[11px] opacity-80">
                {activeToast.messageKey ? t(activeToast.messageKey, activeToast.variables) : activeToast.message}
              </p>
            </div>
            <button className="opacity-50 hover:opacity-100">
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
