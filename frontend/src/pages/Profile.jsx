import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../api';

const Profile = () => {
  const { t } = useLanguage();
  const [userData, setUserData] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    location: 'İstanbul, Türkiye',
    bio: 'Sürdürülebilir moda tutkunu ve teknoloji meraklısı.'
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await api.getMe();
        setUserData(prev => ({
          ...prev,
          name: data.name,
          email: data.email
        }));
      } catch (err) {
        console.error("Failed to load user data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.updateMe({ name: userData.name, email: userData.email });
      alert("Profile updated successfully!");
    } catch (err) {
      alert("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-xl text-center">Loading Profile...</div>;
  }

  return (
    <div className="w-full px-margin-mobile md:px-margin-desktop py-xl md:py-24 max-w-5xl mx-auto flex flex-col min-h-[calc(100vh-80px)]">
      <div className="flex flex-col md:flex-row gap-lg">
        {/* Sidebar */}
        <aside className="w-full md:w-80 shrink-0">
          <div className="bg-surface-card rounded-2xl p-lg shadow-sm border border-border-subtle text-center sticky top-24">
            <div className="relative w-32 h-32 mx-auto mb-md">
              <div className="w-full h-full rounded-full bg-surface-muted flex items-center justify-center font-display-lg-mobile text-display-lg-mobile text-on-surface-variant border-4 border-surface-card shadow-sm">
                JD
              </div>
              <button className="absolute bottom-0 right-0 bg-primary text-on-primary p-2 rounded-full shadow-md border-4 border-surface-card hover:scale-105 active:scale-95 transition-all">
                <span className="material-symbols-outlined text-[20px]">photo_camera</span>
              </button>
            </div>
            <h2 className="font-headline-md text-headline-md text-on-background mb-1">{userData.name}</h2>
            <p className="font-body-sm text-body-sm text-text-secondary mb-lg">{userData.email}</p>
            
            <nav className="space-y-sm text-left">
              <button className="w-full flex items-center justify-between p-sm bg-primary-container/20 text-primary rounded-xl font-title-card text-title-card transition-all">
                <div className="flex items-center gap-sm">
                  <span className="material-symbols-outlined text-[20px]">person</span> {t('profile.info')}
                </div>
                <span className="material-symbols-outlined text-[20px]">chevron_right</span>
              </button>
            </nav>

            <div className="mt-lg pt-lg border-t border-border-subtle">
              <button className="w-full flex items-center justify-center gap-xs p-sm bg-status-error/10 text-status-error rounded-xl font-label-caps text-label-caps uppercase tracking-wider hover:bg-status-error hover:text-on-error transition-all">
                <span className="material-symbols-outlined text-[20px]">delete</span> {t('profile.delete')}
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-grow">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-surface-card rounded-2xl p-lg shadow-sm border border-border-subtle"
          >
            <h3 className="font-headline-md text-headline-md text-on-background mb-lg">{t('profile.title')}</h3>
            
            <form className="space-y-md" onSubmit={handleSave}>
              <div className="grid md:grid-cols-2 gap-md">
                <div className="space-y-1">
                  <label className="font-label-caps text-label-caps uppercase tracking-wider text-text-secondary ml-2">{t('profile.name')}</label>
                  <input 
                    type="text" 
                    value={userData.name}
                    onChange={(e) => setUserData({...userData, name: e.target.value})}
                    className="w-full bg-surface-muted border border-border-subtle rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-body-main text-body-main text-on-surface"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-label-caps text-label-caps uppercase tracking-wider text-text-secondary ml-2">{t('profile.email')}</label>
                  <input 
                    type="email" 
                    value={userData.email}
                    disabled
                    className="w-full bg-surface-container-high/50 border border-border-subtle rounded-xl py-3 px-4 font-body-main text-body-main text-text-secondary cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-label-caps text-label-caps uppercase tracking-wider text-text-secondary ml-2">{t('profile.location')}</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary">location_on</span>
                  <input 
                    type="text" 
                    value={userData.location}
                    onChange={(e) => setUserData({...userData, location: e.target.value})}
                    className="w-full bg-surface-muted border border-border-subtle rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-body-main text-body-main text-on-surface"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-label-caps text-label-caps uppercase tracking-wider text-text-secondary ml-2">{t('profile.bio')}</label>
                <textarea 
                  rows="4"
                  value={userData.bio}
                  onChange={(e) => setUserData({...userData, bio: e.target.value})}
                  className="w-full bg-surface-muted border border-border-subtle rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-body-main text-body-main text-on-surface resize-none"
                />
              </div>

              <div className="pt-lg border-t border-border-subtle flex justify-end">
                <button 
                  type="submit"
                  disabled={saving}
                  className="bg-primary text-on-primary px-lg py-sm rounded-xl font-title-card text-title-card shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {saving ? 'Saving...' : t('profile.save')}
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
