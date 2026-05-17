import { useState, useEffect, useRef } from 'react';
import { api } from '../api';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import ListingDetailModal from '../components/ListingDetailModal';
import FilterMenu from '../components/FilterMenu';
import { useSettings } from '../context/SettingsContext';

const Feed = () => {
  const { t } = useLanguage();
  const { viewMode } = useSettings();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedListing, setSelectedListing] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [favorites, setFavorites] = useState(new Set());
  const [feedInsights, setFeedInsights] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const searchTimerRef = useRef(null);
  const sentImpressionsRef = useRef(new Set());

  const categories = [
    { id: 'all', label: 'All', icon: 'grid_view' },
    { id: 'furniture', label: 'Furniture', icon: 'chair' },
    { id: 'electronics', label: 'Electronics', icon: 'devices' },
    { id: 'clothing', label: 'Clothing', icon: 'apparel' },
    { id: 'decor', label: 'Decor', icon: 'auto_awesome_motion' },
    { id: 'other', label: 'Other', icon: 'more_horiz' }
  ];

  const getAvatarSrc = (avatarUrl) => {
    if (!avatarUrl) return '';
    return avatarUrl.startsWith('http') ? avatarUrl : `http://localhost:8000/static/${avatarUrl}`;
  };

  const fetchFavorites = async () => {
    try {
      const data = await api.getFavorites();
      setFavorites(new Set(data.map(l => l.id)));
    } catch (err) {
      console.error('Error fetching favorites:', err);
    }
  };

  useEffect(() => {
    const fetchFeed = async () => {
      setLoading(true);
      try {
        const data = await api.getFeed(selectedCategory, search);
        const items = Array.isArray(data.items) ? data.items : [];
        setListings(items);
        setFeedInsights(data.insights || null);

        const freshIds = items.slice(0, 8)
          .map(item => item.id)
          .filter(id => !sentImpressionsRef.current.has(id));
        freshIds.forEach(id => sentImpressionsRef.current.add(id));
        freshIds.forEach((id) => {
          const item = items.find(row => row.id === id);
          void api.recordFeedEvent({
            event_type: 'impression',
            listing_id: id,
            category: item?.category || selectedCategory,
            metadata: { source: 'feed', rank: items.findIndex(row => row.id === id) }
          });
        });
      } catch (error) {
        console.error('Error fetching feed:', error);
        try {
          const data = await api.getListings(selectedCategory, search);
          setListings(data);
          setFeedInsights(null);
        } catch (fallbackError) {
          console.error('Fallback feed load failed:', fallbackError);
        }
      } finally {
        setLoading(false);
      }
    };

    void fetchFeed();
  }, [selectedCategory, search, refreshKey]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchFavorites();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      if (search.trim()) {
        void api.recordFeedEvent({
          event_type: 'search',
          query: search,
          category: selectedCategory,
          metadata: { source: 'feed_search' }
        });
      }
    }, 450);

    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    };
  }, [search, selectedCategory]);

  const handleCategorySelect = (cat) => {
    setSelectedCategory(cat);
    void api.recordFeedEvent({
      event_type: 'category',
      category: cat,
      query: search || '',
      metadata: { source: 'feed_chip' }
    });
  };

  const handleToggleFavorite = async (e, listing) => {
    e.stopPropagation();
    try {
      await api.toggleFavorite(listing.id);
      setFavorites(prev => {
        const next = new Set(prev);
        if (next.has(listing.id)) next.delete(listing.id);
        else next.add(listing.id);
        return next;
      });
      void api.recordFeedEvent({
        event_type: 'favorite',
        listing_id: listing.id,
        category: listing.category,
        metadata: { source: 'feed_card' }
      });
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  };

  const handleOpenListing = (listing) => {
    setSelectedListing(listing);
    setIsDetailOpen(true);
    void api.recordFeedEvent({
      event_type: 'open',
      listing_id: listing.id,
      category: listing.category,
      metadata: { source: 'feed_card' }
    });
  };

  const forYouListings = listings.slice(0, 5);
  const remainingListings = listings.slice(5);
  const rankedListings = remainingListings.length > 0 ? remainingListings : listings.slice(5);
  const topCategory = feedInsights?.top_categories?.[0];
  const priceRange = feedInsights?.preferred_price_range;

  const renderFeedCard = (listing, index, compact = false) => (
    <motion.div
      key={listing.id}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.2) }}
      onClick={() => handleOpenListing(listing)}
      className={`bg-surface-card rounded-xl border border-border-subtle overflow-hidden hover:shadow-lg transition-shadow duration-300 group cursor-pointer flex ${
        compact ? 'flex-row min-w-[260px] max-w-[340px] h-36' : viewMode === 'grid' ? 'flex-col' : 'flex-row h-40 md:h-48'
      }`}
    >
      <div className={`relative bg-surface-muted overflow-hidden shrink-0 ${compact ? 'w-28 h-full' : viewMode === 'grid' ? 'aspect-square w-full' : 'w-40 md:w-48 h-full'}`}>
        <img
          src={`http://localhost:8000/static/images/${listing.image_url}`}
          alt={listing.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-sm left-sm flex flex-col gap-1">
          {listing.feed_badge && (
            <span className="bg-primary text-on-primary text-[10px] font-black uppercase tracking-[0.18em] px-2 py-1 rounded-full shadow-sm">
              {listing.feed_badge}
            </span>
          )}
          {favorites.has(Number(listing.id)) && (
            <span className="bg-white/85 text-primary text-[10px] font-black uppercase tracking-[0.18em] px-2 py-1 rounded-full shadow-sm">
              {t('nav.favorites') || 'Saved'}
            </span>
          )}
        </div>
        <button
          className="absolute top-sm right-sm bg-white/80 backdrop-blur-sm p-2 rounded-full cursor-pointer hover:bg-white transition-all shadow-md"
          onClick={(e) => handleToggleFavorite(e, listing)}
        >
          <span
            className="material-symbols-outlined text-primary text-[20px] transition-all"
            style={{ fontVariationSettings: favorites.has(Number(listing.id)) ? "'FILL' 1" : "'FILL' 0" }}
          >
            {favorites.has(Number(listing.id)) ? 'favorite' : 'favorite_border'}
          </span>
        </button>
      </div>
      <div className={`p-sm md:p-md flex flex-col flex-grow justify-between ${viewMode === 'list' ? 'py-4 pr-6' : ''}`}>
        <div>
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="font-headline-md text-headline-md text-on-background">₺{listing.selected_price}</div>
            <span className="text-[10px] font-black uppercase tracking-[0.18em] text-primary/70">
              {Math.round((listing.feed_score || 0) * 10) / 10}
            </span>
          </div>
          <h3 className="font-title-card text-title-card text-on-surface-variant truncate mb-2">{listing.title}</h3>
          {listing.feed_reason && (
            <p className="text-xs text-text-secondary leading-relaxed mb-2 line-clamp-2">
              {listing.feed_reason}
            </p>
          )}
          {compact && topCategory && (
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-text-secondary">
              {topCategory.name}
            </p>
          )}
          {!compact && viewMode === 'list' && (
            <p className="font-body-sm text-body-sm text-text-secondary line-clamp-2 mb-2 hidden md:block">
              {listing.description || 'Quality product from a verified seller.'}
            </p>
          )}
        </div>
        <div className="flex items-center justify-between pt-sm border-t border-border-subtle mt-auto">
          <div className="flex items-center gap-xs">
            <div className="w-5 h-5 rounded-full overflow-hidden bg-surface-muted flex items-center justify-center text-[10px] font-bold text-on-surface-variant">
              {getAvatarSrc(listing.author?.avatar_url) ? (
                <img src={getAvatarSrc(listing.author?.avatar_url)} alt={listing.author?.name || 'Seller'} className="w-full h-full object-cover" />
              ) : (
                (listing.author ? listing.author.name : 'U').substring(0, 1).toUpperCase()
              )}
            </div>
            <span className="material-symbols-outlined text-primary text-[16px]">verified</span>
            <span className="font-body-sm text-body-sm text-text-secondary truncate">@{listing.author ? listing.author.name : 'Unknown'}</span>
          </div>
          {viewMode === 'list' && (
            <span className="font-label-caps text-label-caps text-primary uppercase font-bold flex items-center gap-1">
              {t('action.details')} <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="w-full px-margin-mobile md:px-margin-desktop py-xl md:py-24 max-w-7xl mx-auto flex flex-col min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-lg mb-xl">
        <div className="max-w-xl w-full flex gap-md">
          <div className="relative group flex-grow">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors">search</span>
            <input
              type="text"
              placeholder={t('feed.search')}
              className="w-full bg-surface-card border border-border-subtle rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-body-main text-body-main text-on-surface outline-none shadow-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            onClick={() => setIsFilterOpen(true)}
            className="flex items-center gap-xs bg-primary text-on-primary px-lg py-3 rounded-xl font-title-card text-title-card shadow-md hover:scale-105 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined">filter_list</span>
            {t('feed.filter')}
          </button>
        </div>

        <div className="hidden lg:flex items-center gap-sm px-md py-sm bg-primary-container/10 rounded-xl border border-primary-container/20 shrink-0 min-w-[280px]">
          <span className="material-symbols-outlined text-primary">psychology</span>
          <div className="min-w-0">
            <p className="font-label-caps text-label-caps text-primary/80 uppercase tracking-wider">
              {t('feed.forYou') || 'For you'}
            </p>
            <motion.p
              key={feedInsights?.summary || 'default'}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-body-sm text-body-sm font-bold text-on-background truncate max-w-[220px]"
            >
              {feedInsights?.summary || 'Fresh items first, then what you actually engage with.'}
            </motion.p>
            {priceRange && (
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-primary/70 mt-1">
                ₺{priceRange.min} - ₺{priceRange.max}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex overflow-x-auto gap-sm pb-lg no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleCategorySelect(cat.id)}
            className={`flex items-center gap-xs px-lg py-3 rounded-full font-title-card text-title-card transition-all whitespace-nowrap shadow-sm border ${
              selectedCategory === cat.id ? 'bg-primary text-on-primary border-primary' : 'bg-surface-card text-on-surface border-border-subtle hover:bg-surface-muted'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">{cat.icon}</span>
            {t(`cat.${cat.id}`)}
          </button>
        ))}
      </div>

      {forYouListings.length > 0 && (
        <section className="mb-xl">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <p className="font-label-caps text-label-caps text-primary/80 uppercase tracking-widest">{t('feed.forYou') || 'For you'}</p>
              <h2 className="font-headline-md text-headline-md text-on-background">{t('feed.relevantFirst') || 'Most relevant first'}</h2>
            </div>
            {topCategory && (
              <span className="text-[10px] font-black uppercase tracking-[0.18em] text-primary/70 bg-primary/10 px-3 py-2 rounded-full">
                {topCategory.name}
              </span>
            )}
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
            {forYouListings.map((listing, index) => renderFeedCard(listing, index, true))}
          </div>
        </section>
      )}

      {loading ? (
        <div className="flex flex-col justify-center items-center h-80">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 border-4 border-surface-container-high border-t-primary rounded-full"
          />
          <p className="font-label-caps text-label-caps text-text-secondary uppercase tracking-widest mt-md">{t('feed.loading')}</p>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-md md:gap-lg' : 'flex flex-col gap-md'}>
          {Array.isArray(rankedListings) && rankedListings.map((listing, index) => renderFeedCard(listing, index + 5))}
          {rankedListings.length === 0 && (
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

      <ListingDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        listing={selectedListing}
        onAction={() => {
          setRefreshKey((value) => value + 1);
          fetchFavorites();
        }}
      />

      <FilterMenu
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        currentCategory={selectedCategory}
        onSelect={(cat) => handleCategorySelect(cat)}
      />
    </div>
  );
};

export default Feed;
