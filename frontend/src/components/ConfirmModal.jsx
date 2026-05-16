import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  const { t } = useLanguage();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
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
            className="relative w-full max-w-sm bg-surface-card rounded-3xl p-lg shadow-2xl border border-border-subtle"
          >
            <h3 className="font-headline-md text-headline-md text-on-background mb-sm">{title}</h3>
            <p className="font-body-main text-body-main text-on-surface-variant mb-lg max-h-60 overflow-y-auto custom-scrollbar pr-2">{message}</p>
            
            <div className="flex gap-md">
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-xl font-title-card text-title-card text-on-surface-variant hover:bg-surface-muted transition-colors"
              >
                {t('action.no')}
              </button>
              <button
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className="flex-1 bg-status-error text-white py-3 rounded-xl font-title-card text-title-card hover:opacity-90 transition-opacity"
              >
                {t('action.yes')}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmModal;
