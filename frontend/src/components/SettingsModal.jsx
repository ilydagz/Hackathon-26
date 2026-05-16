import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettings } from '../context/SettingsContext';
import { useLanguage } from '../context/LanguageContext';

const SettingsModal = ({ isOpen, onClose }) => {
  const { theme, setTheme, textSize, setTextSize, viewMode, setViewMode, accessibility, setAccessibility } = useSettings();
  const { t } = useLanguage();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
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
          className="relative w-full max-w-md bg-surface-card rounded-3xl shadow-2xl border border-border-subtle overflow-hidden"
        >
          <div className="p-lg border-b border-border-subtle flex justify-between items-center bg-surface-muted/30">
            <h2 className="font-headline-md text-headline-md text-on-background flex items-center gap-2">
              <span className="material-symbols-outlined">settings</span> {t('settings.title')}
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-surface-muted rounded-full transition-colors">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          
          <div className="p-lg space-y-xl overflow-y-auto max-h-[70vh] no-scrollbar">
            {/* Appearance & Display */}
            <section className="space-y-md">
              <h3 className="font-label-caps text-label-caps uppercase tracking-widest text-text-secondary">{t('settings.appearance')}</h3>
              
              <div className="space-y-sm">
                <p className="font-title-card text-sm text-on-surface">{t('settings.theme')}</p>
                <div className="grid grid-cols-2 gap-sm">
                  <button 
                    onClick={() => setTheme('light')}
                    className={`p-lg rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${theme === 'light' ? 'border-primary bg-primary/5' : 'border-border-subtle hover:border-primary/30'}`}
                  >
                    <span className="material-symbols-outlined text-primary">light_mode</span>
                    <span className="font-body-sm font-bold">{t('settings.light')}</span>
                  </button>
                  <button 
                    onClick={() => setTheme('dark')}
                    className={`p-lg rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${theme === 'dark' ? 'border-primary bg-primary/5' : 'border-border-subtle hover:border-primary/30'}`}
                  >
                    <span className="material-symbols-outlined text-primary">dark_mode</span>
                    <span className="font-body-sm font-bold">{t('settings.dark')}</span>
                  </button>
                </div>
              </div>

              <div className="space-y-sm">
                <p className="font-title-card text-sm text-on-surface">{t('settings.textSize')}</p>
                <div className="flex bg-surface-muted rounded-xl p-1 gap-1">
                  {['small', 'medium', 'large'].map(size => (
                    <button
                      key={size}
                      onClick={() => setTextSize(size)}
                      className={`flex-grow py-2 rounded-lg font-body-sm capitalize transition-all ${textSize === size ? 'bg-surface-card shadow-sm text-primary font-bold' : 'text-text-secondary hover:text-on-surface'}`}
                    >
                      {t(`settings.${size}`)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-sm">
                <p className="font-title-card text-sm text-on-surface">{t('settings.layout')}</p>
                <div className="grid grid-cols-2 gap-sm">
                  <button 
                    onClick={() => setViewMode('grid')}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${viewMode === 'grid' ? 'border-primary bg-primary/5 text-primary' : 'border-border-subtle hover:bg-surface-muted'}`}
                  >
                    <span className="material-symbols-outlined">grid_view</span>
                    <span className="font-body-sm font-bold">{t('settings.grid')}</span>
                  </button>
                  <button 
                    onClick={() => setViewMode('list')}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${viewMode === 'list' ? 'border-primary bg-primary/5 text-primary' : 'border-border-subtle hover:bg-surface-muted'}`}
                  >
                    <span className="material-symbols-outlined">view_list</span>
                    <span className="font-body-sm font-bold">{t('settings.list')}</span>
                  </button>
                </div>
              </div>
            </section>

            {/* Accessibility */}
            <section className="space-y-md">
              <h3 className="font-label-caps text-label-caps uppercase tracking-widest text-text-secondary">{t('settings.accessibility')}</h3>
              
              <div className="flex items-center justify-between p-4 bg-surface-muted rounded-2xl">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">contrast</span>
                  <div>
                    <p className="font-body-main font-bold text-on-surface">{t('settings.highContrast')}</p>
                    <p className="font-body-sm text-[10px] text-text-secondary">{t('settings.highContrastDesc')}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setAccessibility({...accessibility, highContrast: !accessibility.highContrast})}
                  className={`w-12 h-6 rounded-full relative transition-colors ${accessibility.highContrast ? 'bg-primary' : 'bg-outline-variant'}`}
                >
                  <motion.div 
                    animate={{ x: accessibility.highContrast ? 24 : 4 }}
                    className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
                  />
                </button>
              </div>

              <div className="space-y-sm">
                <p className="font-title-card text-sm text-on-surface">{t('settings.colorBlind')}</p>
                <select 
                  value={accessibility.colorBlind}
                  onChange={(e) => setAccessibility({...accessibility, colorBlind: e.target.value})}
                  className="w-full bg-surface-muted border border-border-subtle rounded-xl py-3 px-4 font-body-sm text-on-surface focus:border-primary outline-none"
                >
                  <option value="none">{t('settings.cbNone')}</option>
                  <option value="protanopia">{t('settings.cbProtanopia')}</option>
                  <option value="deuteranopia">{t('settings.cbDeuteranopia')}</option>
                  <option value="tritanopia">{t('settings.cbTritanopia')}</option>
                </select>
              </div>
            </section>
          </div>

          <div className="p-lg bg-surface-muted/30 border-t border-border-subtle flex justify-end">
            <button 
              onClick={onClose}
              className="bg-primary text-on-primary px-lg py-sm rounded-xl font-title-card text-title-card shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              {t('settings.done')}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default SettingsModal;
