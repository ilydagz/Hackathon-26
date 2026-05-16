import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import categoriesData from '../data/categories.json';
import { useLanguage } from '../context/LanguageContext';

const FilterMenu = ({ isOpen, onClose, onSelect, currentCategory }) => {
  const [expandedCategory, setExpandedCategory] = useState(null);
  const { t } = useLanguage();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-sm z-[180]"
          />
          
          {/* Menu Drawer */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 h-full w-full max-w-[320px] bg-app-bg shadow-2xl z-[190] flex flex-col"
          >
            <div className="p-lg border-b border-border-subtle flex justify-between items-center bg-surface-card">
              <h2 className="font-headline-md text-headline-md text-on-background">{t('feed.filter')}</h2>
              <button onClick={onClose} className="p-2 hover:bg-surface-muted rounded-full">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="flex-grow overflow-y-auto p-md space-y-sm">
              <button
                onClick={() => { onSelect('all'); onClose(); }}
                className={`w-full flex items-center gap-md p-md rounded-xl transition-all ${currentCategory === 'all' ? 'bg-primary text-on-primary shadow-md' : 'hover:bg-surface-muted border border-transparent'}`}
              >
                <span className="material-symbols-outlined">grid_view</span>
                <span className="font-title-card text-title-card">{t('cat.all')}</span>
              </button>
              
              {categoriesData.map((cat) => (
                <div key={cat.id} className="space-y-xs">
                  <button
                    onClick={() => setExpandedCategory(expandedCategory === cat.id ? null : cat.id)}
                    className={`w-full flex items-center justify-between p-md rounded-xl transition-all ${currentCategory === cat.id || expandedCategory === cat.id ? 'bg-primary/10 border border-primary/20' : 'hover:bg-surface-muted border border-transparent'}`}
                  >
                    <div className="flex items-center gap-md">
                      <span className={`material-symbols-outlined ${expandedCategory === cat.id ? 'text-primary' : 'text-on-surface-variant'}`}>{cat.icon}</span>
                      <span className="font-title-card text-title-card text-on-surface">{t(`cat.${cat.id}`)}</span>
                    </div>
                    <span className={`material-symbols-outlined transition-transform ${expandedCategory === cat.id ? 'rotate-180 text-primary' : 'text-on-surface-variant'}`}>expand_more</span>
                  </button>
                  
                  <AnimatePresence>
                    {expandedCategory === cat.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden pl-12 space-y-xs"
                      >
                        <button
                          onClick={() => { onSelect(cat.id); onClose(); }}
                          className="w-full text-left py-2 font-body-main text-body-main text-on-surface-variant hover:text-primary transition-colors"
                        >
                          {t('cat.viewAll')} {t(`cat.${cat.id}`)}
                        </button>
                        {cat.subcategories.map(sub => (
                          <button
                            key={sub.id}
                            onClick={() => { onSelect(sub.id); onClose(); }}
                            className="w-full text-left py-2 font-body-main text-body-main text-on-surface-variant hover:text-primary transition-colors border-l border-border-subtle pl-4"
                          >
                            {t(`cat.${sub.id}`)}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default FilterMenu;
