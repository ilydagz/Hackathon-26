import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Bell, Shield, Trash2, Camera, MapPin, ChevronRight } from 'lucide-react';

const Profile = () => {
  const [userData, setUserData] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    location: 'İstanbul, Türkiye',
    bio: 'Sürdürülebilir moda tutkunu ve teknoloji meraklısı.'
  });

  return (
    <div className="container mx-auto px-6 py-16 max-w-5xl pb-32">
      <div className="flex flex-col md:flex-row gap-16">
        {/* Sidebar */}
        <aside className="w-full md:w-80 shrink-0">
          <div className="bg-white rounded-[3rem] p-10 shadow-2xl shadow-black/5 border border-border/20 text-center sticky top-28">
            <div className="relative w-32 h-32 mx-auto mb-6">
              <div className="w-full h-full rounded-[2.5rem] bg-muted flex items-center justify-center text-4xl font-black text-secondary border-4 border-white shadow-xl">
                JD
              </div>
              <button className="absolute -bottom-2 -right-2 bg-primary text-white p-3 rounded-2xl shadow-lg border-4 border-white active:scale-90 transition-all">
                <Camera size={18} />
              </button>
            </div>
            <h2 className="text-2xl font-black tracking-tighter text-secondary mb-1">{userData.name}</h2>
            <p className="text-muted-foreground text-sm font-medium mb-8">{userData.email}</p>
            
            <nav className="space-y-2 text-left">
              <button className="w-full flex items-center justify-between p-4 bg-primary/5 text-primary rounded-2xl font-bold transition-all">
                <div className="flex items-center gap-3">
                  <User size={18} /> Profil Bilgileri
                </div>
                <ChevronRight size={16} />
              </button>
              <button className="w-full flex items-center justify-between p-4 hover:bg-muted text-muted-foreground rounded-2xl font-bold transition-all">
                <div className="flex items-center gap-3">
                  <Bell size={18} /> Bildirimler
                </div>
                <ChevronRight size={16} />
              </button>
              <button className="w-full flex items-center justify-between p-4 hover:bg-muted text-muted-foreground rounded-2xl font-bold transition-all">
                <div className="flex items-center gap-3">
                  <Shield size={18} /> Güvenlik
                </div>
                <ChevronRight size={16} />
              </button>
            </nav>

            <div className="mt-12 pt-10 border-t border-border">
              <button className="w-full flex items-center justify-center gap-3 p-4 bg-destructive/10 text-destructive rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-destructive hover:text-white transition-all">
                <Trash2 size={18} /> Hesabı Sil
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-grow">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-[3rem] p-12 shadow-2xl shadow-black/5 border border-border/20"
          >
            <h3 className="text-3xl font-black tracking-tighter text-secondary mb-10">Profil Ayarları</h3>
            
            <form className="space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-secondary/60 ml-4">Ad Soyad</label>
                  <input 
                    type="text" 
                    value={userData.name}
                    onChange={(e) => setUserData({...userData, name: e.target.value})}
                    className="w-full bg-muted/30 border-none rounded-2xl py-5 px-6 focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-secondary/60 ml-4">E-Posta</label>
                  <input 
                    type="email" 
                    value={userData.email}
                    disabled
                    className="w-full bg-muted/10 border-none rounded-2xl py-5 px-6 font-medium text-muted-foreground cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-secondary/60 ml-4">Konum</label>
                <div className="relative">
                  <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  <input 
                    type="text" 
                    value={userData.location}
                    onChange={(e) => setUserData({...userData, location: e.target.value})}
                    className="w-full bg-muted/30 border-none rounded-2xl py-5 pl-14 pr-6 focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-secondary/60 ml-4">Hakkında</label>
                <textarea 
                  rows="4"
                  value={userData.bio}
                  onChange={(e) => setUserData({...userData, bio: e.target.value})}
                  className="w-full bg-muted/30 border-none rounded-[2rem] py-5 px-6 focus:ring-2 focus:ring-primary/20 transition-all font-medium resize-none"
                />
              </div>

              <div className="pt-6 border-t border-border flex justify-end">
                <button 
                  type="button"
                  className="bg-primary text-white px-12 py-5 rounded-2xl font-black text-lg shadow-xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all"
                >
                  Değişiklikleri Kaydet
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
