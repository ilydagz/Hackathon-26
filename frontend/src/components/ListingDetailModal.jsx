import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../api';
import { useLanguage } from '../context/LanguageContext';
import { useNotifications } from '../context/NotificationContext';
import ConfirmModal from './ConfirmModal';

const ListingDetailModal = ({ listing, isOpen, onClose, onAction }) => {
  const { t } = useLanguage();
  const { addNotification } = useNotifications();
  const [loading, setLoading] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const currentUserId = Number(localStorage.getItem('userId'));

  useEffect(() => {
    const checkFavorite = async () => {
      if (!listing || isOwner) return;
      try {
        const favs = await api.getFavorites();
        setIsFavorited(favs.some(f => f.id === listing.id));
      } catch (err) {
        console.error(err);
      }
    };
    if (isOpen) checkFavorite();
  }, [listing, isOpen]);

  if (!listing) return null;

  const isOwner = listing.author_id === currentUserId;

  const handleToggleFavorite = async () => {
    try {
      await api.toggleFavorite(listing.id);
      setIsFavorited(!isFavorited);
      onAction?.(); // Trigger refresh if in Favorites page
    } catch (err) {
      console.error(err);
    }
  };

  const handleSold = async () => {
    setLoading(true);
    try {
      await api.markAsSold(listing.id);
      addNotification({
        titleKey: 'notif.profileUpdated', // Or a dedicated 'listing.markedSold'
        messageKey: 'action.sold',
        type: 'system',
        userId: currentUserId
      });
      onAction?.();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await api.deleteListing(listing.id);
      addNotification({
        titleKey: 'action.delete',
        messageKey: 'notif.profileUpdatedDesc',
        type: 'system',
        userId: currentUserId
      });
      onAction?.();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleContact = async () => {
    try {
      await api.sendMessage({
        receiver_id: listing.author_id,
        listing_id: listing.id,
        content: t('action.msgHi', { title: listing.title })
      });
      addNotification({
        titleKey: 'notif.newRequest',
        messageKey: 'action.requestSent',
        type: 'message',
        userId: currentUserId
      });
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-inverse-surface/40 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-2xl bg-app-bg rounded-3xl shadow-2xl flex flex-col md:flex-row h-auto max-h-[90vh] overflow-hidden"
          >
            <button 
              onClick={onClose} 
              className="absolute top-4 right-4 z-50 p-2 bg-background/80 backdrop-blur-md hover:bg-background rounded-full shadow-lg transition-all active:scale-95"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <div className="w-full md:w-1/2 aspect-square md:aspect-auto bg-surface-muted shrink-0 md:h-auto h-[300px] relative">
              <img 
                src={listing.image_url?.startsWith('http') ? listing.image_url : `http://localhost:8000/static/images/${listing.image_url || 'demo.jpg'}`} 
                alt={listing.title} 
                className="w-full h-full object-cover"
              />
              {!isOwner && (
                <button 
                  onClick={handleToggleFavorite}
                  className="absolute bottom-4 right-4 z-50 p-3 bg-background/80 backdrop-blur-md hover:bg-background rounded-full shadow-lg transition-all active:scale-95 text-primary"
                >
                  <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: isFavorited ? "'FILL' 1" : "'FILL' 0" }}>
                    {isFavorited ? 'favorite' : 'favorite_border'}
                  </span>
                </button>
              )}
            </div>
            <div className="w-full md:w-1/2 p-xl pb-10 flex flex-col min-h-0 bg-surface-card overflow-y-auto custom-scrollbar">
              <div className="flex justify-between items-start mb-md">
                <div>
                  <span className="font-label-caps text-label-caps text-primary uppercase tracking-widest bg-primary/10 px-2 py-1 rounded">
                    {t(`cat.${listing.category?.toLowerCase()}`)}
                  </span>
                  <h2 className="font-headline-md text-headline-md text-on-background mt-2">{listing.title}</h2>
                </div>
              </div>

              <div className="flex items-center gap-sm mb-lg">
                <span className="font-display-lg-mobile text-display-lg-mobile text-primary">₺{listing.selected_price}</span>
                <span className="font-body-sm text-body-sm text-text-secondary border-l border-border-subtle pl-sm capitalize">
                  {['new', 'good', 'fair', 'like-new'].includes(listing.condition?.toLowerCase()) 
                    ? t(`action.${listing.condition.toLowerCase().replace('-', '')}`) 
                    : (listing.condition ? t(`action.${listing.condition.toLowerCase()}`) : '')}
                </span>
              </div>

              <div className="mb-lg pr-2">
                <h4 className="font-title-card text-title-card text-on-surface mb-xs">{t('listing.descriptionLabel')}</h4>
                <p className="font-body-main text-body-main text-on-surface-variant leading-relaxed mb-md break-words whitespace-pre-line">
                  {listing.description}
                </p>

                {listing.attributes && Object.keys(listing.attributes).length > 0 && (
                  <div className="grid grid-cols-2 gap-sm p-sm bg-surface-muted rounded-xl mb-md border border-border-subtle">
                    {Object.entries(listing.attributes).map(([key, value]) => (
                      <div key={key} className="flex flex-col">
                        <span className="font-label-caps text-[10px] text-text-secondary uppercase tracking-widest">{t(`action.${key.toLowerCase()}`)}</span>
                        <span className="font-title-card text-sm text-on-surface">
                          {['new', 'good', 'fair', 'like-new', 'yes', 'no', 'expired'].includes(String(value).toLowerCase()) 
                            ? t(`action.${String(value).toLowerCase().replace('-', '')}`) 
                            : value}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="mt-lg pt-lg border-t border-border-subtle flex items-center gap-md">
                  <div className="w-12 h-12 rounded-full bg-surface-muted flex items-center justify-center font-title-card text-on-surface-variant">
                    {listing.author?.name?.substring(0, 2).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className="font-title-card text-title-card text-on-surface">{listing.author?.name || t('listing.seller')}</p>
                    <p className="font-body-sm text-body-sm text-text-secondary">{listing.author?.location || t('listing.location')}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-md pt-md border-t border-border-subtle mt-auto shrink-0">
                {isOwner ? (
                  <>
                    <button 
                      onClick={handleSold}
                      disabled={loading}
                      className="flex-1 bg-status-success text-white py-3 rounded-xl font-title-card text-title-card hover:opacity-90 transition-opacity"
                    >
                      {loading ? '...' : t('action.sold')}
                    </button>
                    <button 
                      onClick={handleDelete}
                      disabled={loading}
                      className="flex-1 bg-status-error/10 text-status-error border border-status-error/20 py-3 rounded-xl font-title-card text-title-card hover:bg-status-error hover:text-white transition-all"
                    >
                      {t('action.delete')}
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={handleContact}
                    className="w-full bg-primary text-on-primary py-4 rounded-xl font-title-card text-title-card flex items-center justify-center gap-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[20px]">chat</span>
                    {t('action.contact')}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ListingDetailModal;
