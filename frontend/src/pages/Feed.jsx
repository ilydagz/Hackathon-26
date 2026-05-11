import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Loader2, Search, Filter, Sparkles, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

const Feed = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const response = await api.get('/api/listings');
        setListings(response.data);
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
    <div className="container mx-auto px-6 py-12 pb-32">
      {/* Search & Filter Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16">
        <div className="max-w-xl w-full">
          <h1 className="text-5xl font-black tracking-tighter text-secondary mb-8">Pazaryerini Keşfet</h1>
          <div className="relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Eşya, marka veya kategori ara..."
              className="w-full bg-white border-2 border-border/50 rounded-2xl py-5 pl-16 pr-6 focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium text-lg outline-none shadow-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex gap-4 w-full md:w-auto">
          <button className="flex-1 md:flex-none flex items-center justify-center gap-3 bg-white border-2 border-border/50 px-8 py-5 rounded-2xl font-bold hover:bg-muted transition-all">
            <Filter size={18} /> Filtrele
          </button>
          <div className="hidden lg:flex items-center gap-4 px-6 py-4 bg-primary/5 rounded-2xl border border-primary/10">
            <TrendingUp size={20} className="text-primary" />
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-primary/60">Popüler</p>
              <p className="font-bold text-sm text-secondary">iPhone 13 Pro</p>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col justify-center items-center h-80">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Loader2 className="text-primary" size={48} />
          </motion.div>
          <p className="text-muted-foreground font-black tracking-[0.2em] uppercase text-[10px] mt-6">Eşyalar Listeleniyor...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
          {filteredListings.map((listing, index) => (
            <motion.div 
              key={listing.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className="group cursor-pointer"
            >
              <div className="relative aspect-square rounded-[2.5rem] overflow-hidden bg-white shadow-xl shadow-black/5 border border-border/20">
                <img 
                  src={`http://localhost:8000/static/images/${listing.image_url}`} 
                  alt={listing.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-6 right-6 bg-white/95 backdrop-blur-xl px-5 py-3 rounded-[1.25rem] font-black text-xl shadow-xl border border-black/5">
                  ₺{listing.selected_price}
                </div>
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                   <button className="bg-white text-secondary px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transform translate-y-4 group-hover:translate-y-0 transition-transform">
                     Detayları Gör
                   </button>
                </div>
              </div>
              <div className="mt-6 px-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-black text-xl tracking-tight leading-tight group-hover:text-primary transition-colors">{listing.title}</h3>
                </div>
                <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed font-medium">{listing.description}</p>
                <div className="mt-4 flex items-center gap-3">
                   <div className="w-8 h-8 rounded-full bg-muted border border-border" />
                   <p className="text-[10px] font-black uppercase tracking-widest text-secondary/60">Satıcı: @johndoe</p>
                </div>
              </div>
            </motion.div>
          ))}
          
          {filteredListings.length === 0 && (
            <div className="col-span-full text-center py-32 bg-white/50 rounded-[4rem] border-2 border-dashed border-border/50">
              <div className="w-24 h-24 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-8 text-muted-foreground">
                <Search size={48} />
              </div>
              <p className="text-secondary font-black text-2xl tracking-tighter mb-3">Sonuç Bulunamadı</p>
              <p className="text-muted-foreground text-sm font-medium">Farklı bir arama terimi deneyin veya kategori seçin.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Feed;
