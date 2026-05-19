import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import ListingDetailModal from '../components/ListingDetailModal';
import { useSettings } from '../context/SettingsContext';
import { buildStaticUrl } from '../utils/backendUrl';

const MyListings = () => {
  const { t } = useLanguage();
  const { viewMode } = useSettings();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedListing, setSelectedListing] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const fetchMyListings = async () => {
    setLoading(true);
    try {
      const data = await api.getMyListings();
      setListings(data);
    } catch (error) {
      console.error('Error fetching my listings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyListings();
  }, []);

  return (
    <div className="w-full px-margin-mobile md:px-margin-desktop py-xl md:py-24 max-w-7xl mx-auto flex flex-col min-h-screen pb-32">
      <div className="flex justify-between items-center mb-xl">
        <h1 className="font-display-lg-mobile md:font-display-lg text-on-background tracking-tight">
          {t('nav.myPosts') || 'My Posts'}
        </h1>
        <div className="bg-primary/10 px-lg py-2 rounded-full border border-primary/20">
          <p className="font-title-card text-primary">{listings.length} {t('listing.itemsCount')}</p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col justify-center items-center h-80">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-surface-container-high border-t-primary rounded-full"
          />
          <p className="font-label-caps text-label-caps text-text-secondary uppercase tracking-widest mt-md">{t('feed.loading')}</p>
        </div>
      ) : (
        <div className={viewMode === 'grid' 
          ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-md md:gap-lg" 
          : "flex flex-col gap-md"
        }>
          {listings.map((listing, index) => (
            <motion.div 
              key={listing.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              onClick={() => {
                setSelectedListing(listing);
                setIsDetailOpen(true);
              }}
              className={`bg-surface-card rounded-xl border border-border-subtle overflow-hidden hover:shadow-lg transition-shadow duration-300 group cursor-pointer flex ${viewMode === 'grid' ? 'flex-col' : 'flex-row h-40 md:h-48'}`}
            >
              <div className={`relative bg-surface-muted overflow-hidden shrink-0 ${viewMode === 'grid' ? 'aspect-square w-full' : 'w-40 md:w-48 h-full'}`}>
                <img 
                  src={buildStaticUrl(`images/${listing.image_url}`)} 
                  alt={listing.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className={`absolute top-2 left-2 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${listing.status === 'sold' ? 'bg-status-success text-white' : (listing.status === 'draft' ? 'bg-status-warning text-on-surface' : 'bg-primary text-white')}`}>
                  {t(`status.${listing.status}`)}
                </div>
              </div>
              <div className={`p-sm md:p-md flex flex-col flex-grow justify-between ${viewMode === 'list' ? 'py-4 pr-6' : ''}`}>
                <div>
                  <div className="font-headline-md text-headline-md text-on-background mb-1">₺{listing.selected_price}</div>
                  <h3 className="font-title-card text-title-card text-on-surface-variant truncate mb-2">{listing.title}</h3>
                </div>
                <div className="flex items-center justify-between pt-sm border-t border-border-subtle mt-auto">
                   <span className="font-body-sm text-body-sm text-text-secondary truncate">{new Date(listing.created_at).toLocaleDateString()}</span>
                   <span className="material-symbols-outlined text-primary text-[20px]">chevron_right</span>
                </div>
              </div>
            </motion.div>
          ))}
          
          {listings.length === 0 && (
            <div className="col-span-full text-center py-xl bg-surface-card rounded-xl border border-dashed border-border-subtle flex flex-col items-center">
              <div className="w-16 h-16 bg-surface-muted rounded-full flex items-center justify-center mb-md text-text-secondary">
                <span className="material-symbols-outlined text-3xl">post_add</span>
              </div>
              <p className="font-headline-md text-headline-md text-on-background mb-xs">{t('feed.noResults')}</p>
              <p className="font-body-main text-body-main text-text-secondary">You haven't posted anything yet.</p>
            </div>
          )}
        </div>
      )}

      <ListingDetailModal 
        isOpen={isDetailOpen} 
        onClose={() => setIsDetailOpen(false)} 
        listing={selectedListing}
        onAction={fetchMyListings}
      />
    </div>
  );
};

export default MyListings;
