import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { useNotifications } from '../context/NotificationContext';
import { api } from '../api';
import LocationSelector from '../components/LocationSelector';
import ConfirmModal from '../components/ConfirmModal';

const Profile = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { addNotification, resetNotifications } = useNotifications();
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    location: '',
    bio: ''
  });

  const [allCountries, setAllCountries] = useState({});
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const initProfile = async () => {
      try {
        const geoRes = await fetch('https://countriesnow.space/api/v0.1/countries');
        const geoData = await geoRes.json();
        const countriesMap = {};
        geoData.data.forEach(item => {
          countriesMap[item.country] = item.cities;
        });
        setAllCountries(countriesMap);

        const data = await api.getMe();
        setUserData({
          name: data.name,
          email: data.email,
          location: data.location || '',
          bio: data.bio || ''
        });

        if (data.location) {
          const parts = data.location.split(', ');
          if (parts.length === 2) {
            const [city, country] = parts;
            setSelectedCountry(country);
            setSelectedCity(city);
          }
        }
      } catch (err) {
        console.error("Failed to load profile data", err);
      } finally {
        setLoading(false);
      }
    };
    initProfile();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const locationStr = selectedCountry ? `${selectedCity}, ${selectedCountry}` : '';
    try {
      await api.updateMe({ 
        name: userData.name, 
        email: userData.email,
        location: locationStr,
        bio: userData.bio
      });
      addNotification({
        titleKey: 'notif.profileUpdated',
        messageKey: 'notif.profileUpdatedDesc',
        type: 'system',
        userId: Number(localStorage.getItem('userId'))
      });
    } catch (err) {
      addNotification({
        titleKey: 'profile.error',
        messageKey: 'profile.error',
        type: 'system',
        userId: Number(localStorage.getItem('userId'))
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await api.deleteUser(Number(localStorage.getItem('userId')));
      localStorage.clear();
      resetNotifications();
      window.dispatchEvent(new Event('auth-change'));
      navigate('/');
    } catch (err) {
      addNotification({
        titleKey: 'profile.error',
        messageKey: 'profile.error',
        type: 'system',
        userId: Number(localStorage.getItem('userId'))
      });
    }
  };

  if (loading) return <div className="p-xl text-center">Loading Profile...</div>;

  return (
    <div className="w-full px-margin-mobile md:px-margin-desktop py-xl md:py-24 pb-32 max-w-5xl mx-auto flex flex-col min-h-[calc(100vh-80px)]">
      <div className="flex flex-col md:flex-row gap-lg">
        {/* Sidebar */}
        <aside className="w-full md:w-80 shrink-0">
          <div className="bg-surface-card rounded-2xl p-lg shadow-sm border border-border-subtle text-center sticky top-24">
            <div className="relative w-32 h-32 mx-auto mb-md">
              <div className="w-full h-full rounded-full bg-surface-muted flex items-center justify-center font-display-lg-mobile text-display-lg-mobile text-on-surface-variant border-4 border-surface-card shadow-sm">
                {userData.name ? userData.name.substring(0, 2).toUpperCase() : '??'}
              </div>
            </div>
            <h2 className="font-headline-md text-headline-md text-on-background mb-1">{userData.name}</h2>
            <p className="font-body-sm text-body-sm text-text-secondary mb-lg">{userData.email}</p>

            <nav className="space-y-sm text-left">
              <button className="w-full flex items-center justify-between p-sm bg-primary-container/10 text-primary rounded-xl font-title-card text-title-card transition-all">
                <div className="flex items-center gap-sm">
                  <span className="material-symbols-outlined text-[20px]">person</span> {t('profile.info')}
                </div>
              </button>
            </nav>
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
                    onChange={(e) => setUserData({ ...userData, name: e.target.value })}
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

              <div className="grid md:grid-cols-2 gap-md">
                <LocationSelector 
                  label="Country"
                  icon="public"
                  placeholder="Select your country"
                  value={selectedCountry}
                  options={Object.keys(allCountries)}
                  onChange={(val) => {
                    setSelectedCountry(val);
                    setSelectedCity('');
                  }}
                />

                <LocationSelector 
                  label="City"
                  icon="location_city"
                  placeholder={selectedCountry ? "Select your city" : "Select country first"}
                  value={selectedCity}
                  options={selectedCountry ? (allCountries[selectedCountry] || []) : []}
                  onChange={(val) => setSelectedCity(val)}
                  disabled={!selectedCountry}
                />
              </div>

              <div className="space-y-1">
                <label className="font-label-caps text-label-caps uppercase tracking-wider text-text-secondary ml-2">{t('profile.bio')}</label>
                <textarea
                  rows="4"
                  value={userData.bio}
                  onChange={(e) => setUserData({ ...userData, bio: e.target.value })}
                  className="w-full bg-surface-muted border border-border-subtle rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-body-main text-body-main text-on-surface resize-none"
                />
              </div>

              <div className="pt-lg border-t border-border-subtle flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="text-status-error hover:bg-status-error/10 px-lg py-sm rounded-xl font-title-card text-title-card transition-all border border-transparent hover:border-status-error/20"
                >
                  {t('profile.delete')}
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-primary text-on-primary px-lg py-sm rounded-xl font-title-card text-title-card shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {saving ? t('ai.publishing') : t('profile.save')}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>

      <ConfirmModal 
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteAccount}
        title={t('profile.delete')}
        message={t('profile.deleteDesc')}
      />
    </div>
  );
};

export default Profile;
