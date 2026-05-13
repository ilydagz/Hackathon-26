import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

const Feed = () => {
  const { t } = useLanguage();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const data = await api.getListings();
        setListings(data);
      } catch (error) {
        console.error('Error fetching listings:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchListings();
  }, []);

  const filteredListings = listings.filter(l => 
    l.title.toLowerCase().includes(search.toLowerCase()) || 
    l.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-full px-margin-mobile md:px-margin-desktop py-xl md:py-24 max-w-7xl mx-auto flex flex-col min-h-screen">
      {/* Search & Filter Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-lg mb-xl">
        <div className="max-w-xl w-full">
          <h1 className="font-display-lg-mobile text-display-lg-mobile md:font-display-lg md:text-display-lg text-on-background mb-sm">{t('feed.title')}</h1>
          <div className="relative group">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors">search</span>
            <input 
              type="text" 
              placeholder={t('feed.search')}
              className="w-full bg-surface-card border border-border-subtle rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-body-main text-body-main text-on-surface outline-none shadow-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex gap-md w-full md:w-auto">
          <button className="flex-1 md:flex-none flex items-center justify-center gap-xs bg-surface-card border border-border-subtle px-md py-sm rounded-xl font-title-card text-title-card text-on-surface hover:bg-surface-muted transition-all shadow-sm">
            <span className="material-symbols-outlined text-[20px]">filter_list</span> {t('feed.filter')}
          </button>
          <div className="hidden lg:flex items-center gap-sm px-md py-sm bg-primary-container/10 rounded-xl border border-primary-container/20">
            <span className="material-symbols-outlined text-primary">trending_up</span>
            <div>
              <p className="font-label-caps text-label-caps text-primary/80 uppercase tracking-wider">{t('feed.popular')}</p>
              <p className="font-body-sm text-body-sm font-bold text-on-background">iPhone 13 Pro</p>
            </div>
          </div>
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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-md md:gap-lg">
          {filteredListings.map((listing, index) => (
            <motion.div 
              key={listing.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="bg-surface-card rounded-xl border border-border-subtle overflow-hidden hover:shadow-lg transition-shadow duration-300 group flex flex-col"
            >
              <div className="relative aspect-square w-full bg-surface-muted overflow-hidden">
                <img 
                  src={`http://localhost:8000/static/images/${listing.image_url}`} 
                  alt={listing.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-sm right-sm bg-white/80 backdrop-blur-sm p-2 rounded-full cursor-pointer hover:bg-white transition-colors">
                  <span className="material-symbols-outlined text-secondary text-[20px]">favorite_border</span>
                </div>
              </div>
              <div className="p-sm md:p-md flex flex-col flex-grow">
                <div className="font-headline-md text-headline-md text-on-background mb-xs">₺{listing.selected_price}</div>
                <h3 className="font-body-main text-body-main text-on-surface-variant truncate mb-xs">{listing.title}</h3>
                <div className="flex items-center gap-xs mt-auto pt-sm border-t border-border-subtle">
                  <span className="material-symbols-outlined text-outline text-[16px]">location_on</span>
                  <span className="font-body-sm text-body-sm text-text-secondary truncate">{t('feed.seller')}: @{listing.author ? listing.author.name : 'Unknown'}</span>
                </div>
              </div>
            </motion.div>
          ))}
          
          {filteredListings.length === 0 && (
            <div className="col-span-full text-center py-xl bg-surface-card rounded-xl border border-dashed border-border-subtle flex flex-col items-center">
              <div className="w-16 h-16 bg-surface-muted rounded-full flex items-center justify-center mb-md text-text-secondary">
                <span className="material-symbols-outlined text-3xl">search_off</span>
              </div>
              <p className="font-headline-md text-headline-md text-on-background mb-xs">{t('feed.noResults')}</p>
              <p className="font-body-main text-body-main text-text-secondary">{t('feed.noResultsDesc')}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Feed;
