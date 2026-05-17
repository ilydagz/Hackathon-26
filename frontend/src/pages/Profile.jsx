import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Camera, Loader2, Trash2, Upload, UserRound, BadgeCheck, Mail, MapPin } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useNotifications } from '../context/NotificationContext';
import { api } from '../api';
import LocationSelector from '../components/LocationSelector';
import ConfirmModal from '../components/ConfirmModal';

const Profile = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { addNotification, resetNotifications } = useNotifications();
  const fileInputRef = useRef(null);
  const avatarObjectUrlRef = useRef(null);

  const [userData, setUserData] = useState({
    name: '',
    email: '',
    location: '',
    bio: '',
    avatar_url: null
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [allCountries, setAllCountries] = useState({});
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarSaving, setAvatarSaving] = useState(false);
  const [avatarDeleting, setAvatarDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const avatarSrc = useMemo(() => {
    if (avatarPreview) return avatarPreview;
    if (userData.avatar_url) {
      return userData.avatar_url.startsWith('http')
        ? userData.avatar_url
        : `http://localhost:8000/static/${userData.avatar_url}`;
    }
    return '';
  }, [avatarPreview, userData.avatar_url]);

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
          name: data.name || '',
          email: data.email || '',
          location: data.location || '',
          bio: data.bio || '',
          avatar_url: data.avatar_url || null
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
        console.error('Failed to load profile data', err);
      } finally {
        setLoading(false);
      }
    };

    initProfile();
  }, []);

  useEffect(() => {
    return () => {
      if (avatarObjectUrlRef.current) {
        URL.revokeObjectURL(avatarObjectUrlRef.current);
      }
    };
  }, []);

  const syncAvatarPreview = (file) => {
    if (avatarObjectUrlRef.current) {
      URL.revokeObjectURL(avatarObjectUrlRef.current);
    }
    const nextUrl = URL.createObjectURL(file);
    avatarObjectUrlRef.current = nextUrl;
    setAvatarPreview(nextUrl);
  };

  const handleAvatarPick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      addNotification({
        titleKey: 'profile.avatarError',
        messageKey: 'profile.avatarImageOnly',
        type: 'system',
        userId: Number(localStorage.getItem('userId'))
      });
      return;
    }

    setAvatarFile(file);
    syncAvatarPreview(file);

    try {
      setAvatarSaving(true);
      const updated = await api.updateMeAvatar(file);
      setUserData(prev => ({ ...prev, avatar_url: updated.avatar_url }));
      setAvatarFile(null);
      addNotification({
        titleKey: 'profile.avatarUpdated',
        messageKey: 'profile.avatarUpdatedDesc',
        type: 'system',
        userId: Number(localStorage.getItem('userId'))
      });
    } catch (err) {
      console.error(err);
      addNotification({
        titleKey: 'profile.avatarError',
        messageKey: 'profile.avatarErrorDesc',
        type: 'system',
        userId: Number(localStorage.getItem('userId'))
      });
    } finally {
      setAvatarSaving(false);
      e.target.value = '';
    }
  };

  const handleRemoveAvatar = async () => {
    try {
      setAvatarDeleting(true);
      await api.deleteMeAvatar();
      setUserData(prev => ({ ...prev, avatar_url: null }));
      setAvatarFile(null);
      if (avatarObjectUrlRef.current) {
        URL.revokeObjectURL(avatarObjectUrlRef.current);
        avatarObjectUrlRef.current = null;
      }
      setAvatarPreview('');
      addNotification({
        titleKey: 'profile.avatarRemoved',
        messageKey: 'profile.avatarRemovedDesc',
        type: 'system',
        userId: Number(localStorage.getItem('userId'))
      });
    } catch (err) {
      console.error(err);
      addNotification({
        titleKey: 'profile.avatarError',
        messageKey: 'profile.avatarErrorDesc',
        type: 'system',
        userId: Number(localStorage.getItem('userId'))
      });
    } finally {
      setAvatarDeleting(false);
    }
  };

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

      setUserData(prev => ({ ...prev, location: locationStr }));
      addNotification({
        titleKey: 'notif.profileUpdated',
        messageKey: 'notif.profileUpdatedDesc',
        type: 'system',
        userId: Number(localStorage.getItem('userId'))
      });
    } catch (err) {
      console.error(err);
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

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-margin-mobile">
        <div className="flex flex-col items-center gap-4 text-text-secondary">
          <Loader2 className="animate-spin" size={28} />
          <p className="font-body-main">{t('profile.loading')}</p>
        </div>
      </div>
    );
  }

  const initials = userData.name ? userData.name.substring(0, 2).toUpperCase() : '??';

  return (
    <div className="w-full px-margin-mobile md:px-margin-desktop py-xl md:py-24 pb-32 max-w-6xl mx-auto">
      <div className="grid gap-lg lg:grid-cols-[360px_minmax(0,1fr)] items-start">
        <aside className="lg:sticky lg:top-24">
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-[2rem] border border-border-subtle bg-surface-card shadow-sm"
          >
            <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-primary-container/35 to-transparent" />
            <div className="relative p-lg pt-xl text-center">
              <div className="mx-auto mb-lg relative w-36 h-36">
                <div className="absolute inset-0 rounded-full bg-primary/10 blur-2xl" />
                <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-surface-card shadow-[0_12px_30px_rgba(22,26,50,0.12)] bg-surface-muted flex items-center justify-center">
                  {avatarSrc ? (
                    <img src={avatarSrc} alt={userData.name || 'Profile'} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-container to-surface-muted text-primary font-headline-md text-[2rem]">
                      {initials}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleAvatarPick}
                  className="absolute bottom-1 right-1 w-11 h-11 rounded-full bg-primary text-on-primary shadow-lg flex items-center justify-center border-4 border-surface-card hover:scale-105 active:scale-95 transition-transform"
                  aria-label={t('profile.changePhoto')}
                >
                  <Camera size={18} />
                </button>
              </div>

              <h2 className="font-headline-md text-headline-md text-on-background">{userData.name || t('profile.emptyName')}</h2>
              <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-border-subtle bg-surface-muted px-3 py-1 text-xs font-semibold text-text-secondary">
                <BadgeCheck size={14} className="text-status-success" />
                {t('profile.member')}
              </div>

              <div className="mt-lg space-y-3 text-left">
                <div className="flex items-center gap-3 rounded-2xl bg-surface-muted px-4 py-3">
                  <Mail size={16} className="text-primary shrink-0" />
                  <span className="min-w-0 truncate font-body-sm text-body-sm text-text-secondary">{userData.email}</span>
                </div>
                <div className="flex items-center gap-3 rounded-2xl bg-surface-muted px-4 py-3">
                  <MapPin size={16} className="text-primary shrink-0" />
                  <span className="min-w-0 truncate font-body-sm text-body-sm text-text-secondary">
                    {userData.location || t('profile.locationEmpty')}
                  </span>
                </div>
              </div>

              <div className="mt-lg grid gap-2">
                <button
                  type="button"
                  onClick={handleAvatarPick}
                  disabled={avatarSaving}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 font-title-card text-title-card text-on-primary shadow-sm hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {avatarSaving ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
                  {avatarSrc ? t('profile.replacePhoto') : t('profile.addPhoto')}
                </button>
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  disabled={!avatarSrc || avatarDeleting}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border-subtle bg-surface-card px-4 py-3 font-title-card text-title-card text-status-error hover:bg-status-error/5 active:scale-[0.98] transition-all disabled:opacity-40"
                >
                  {avatarDeleting ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
                  {t('profile.removePhoto')}
                </button>
                <p className="px-1 text-left text-xs leading-5 text-text-secondary">
                  {t('profile.photoHint')}
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>
          </motion.section>
        </aside>

        <motion.section
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="rounded-[2rem] border border-border-subtle bg-surface-card shadow-sm overflow-hidden"
        >
          <div className="border-b border-border-subtle px-lg py-md bg-surface-muted/40">
            <h3 className="font-headline-md text-headline-md text-on-background">{t('profile.title')}</h3>
            <p className="mt-1 font-body-sm text-body-sm text-text-secondary">{t('profile.subtitle')}</p>
          </div>

          <form className="space-y-8 px-lg py-lg" onSubmit={handleSave}>
            <div className="grid gap-md md:grid-cols-2">
              <div className="space-y-2">
                <label className="font-label-caps text-label-caps uppercase tracking-wider text-text-secondary ml-2">{t('profile.name')}</label>
                <input
                  type="text"
                  value={userData.name}
                  onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                  className="w-full rounded-2xl border border-border-subtle bg-surface-muted px-4 py-3 font-body-main text-body-main text-on-surface transition-all focus:border-primary focus:ring-2 focus:ring-primary/15"
                />
              </div>
              <div className="space-y-2">
                <label className="font-label-caps text-label-caps uppercase tracking-wider text-text-secondary ml-2">{t('profile.email')}</label>
                <input
                  type="email"
                  value={userData.email}
                  disabled
                  className="w-full cursor-not-allowed rounded-2xl border border-border-subtle bg-surface-container-high/60 px-4 py-3 font-body-main text-body-main text-text-secondary"
                />
              </div>
            </div>

            <div className="grid gap-md md:grid-cols-2">
              <LocationSelector
                label={t('profile.country')}
                icon="public"
                placeholder={t('profile.countryPlaceholder')}
                value={selectedCountry}
                options={Object.keys(allCountries)}
                onChange={(val) => {
                  setSelectedCountry(val);
                  setSelectedCity('');
                }}
              />

              <LocationSelector
                label={t('profile.city')}
                icon="location_city"
                placeholder={selectedCountry ? t('profile.cityPlaceholder') : t('profile.cityLocked')}
                value={selectedCity}
                options={selectedCountry ? (allCountries[selectedCountry] || []) : []}
                onChange={(val) => setSelectedCity(val)}
                disabled={!selectedCountry}
              />
            </div>

            <div className="space-y-2">
              <label className="font-label-caps text-label-caps uppercase tracking-wider text-text-secondary ml-2">{t('profile.bio')}</label>
              <textarea
                rows="5"
                value={userData.bio}
                onChange={(e) => setUserData({ ...userData, bio: e.target.value })}
                className="w-full resize-none rounded-2xl border border-border-subtle bg-surface-muted px-4 py-3 font-body-main text-body-main text-on-surface transition-all focus:border-primary focus:ring-2 focus:ring-primary/15"
              />
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-border-subtle pt-lg sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="inline-flex items-center justify-center rounded-2xl border border-transparent px-4 py-3 font-title-card text-title-card text-status-error transition-all hover:border-status-error/20 hover:bg-status-error/10"
              >
                {t('profile.delete')}
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3 font-title-card text-title-card text-on-primary shadow-sm hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {saving ? <Loader2 className="animate-spin" size={16} /> : null}
                {saving ? t('profile.saving') : t('profile.save')}
              </button>
            </div>
          </form>
        </motion.section>
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
