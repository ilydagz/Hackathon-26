import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LocationSelector = ({ value, onChange, options, placeholder, label, icon, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef(null);

  const filteredOptions = options.filter(opt => 
    opt.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (opt) => {
    onChange(opt);
    setSearch('');
    setIsOpen(false);
  };

  return (
    <div className="space-y-1 relative" ref={containerRef}>
      <label className="font-label-caps text-label-caps uppercase tracking-wider text-text-secondary ml-2">
        {label}
      </label>
      
      <div 
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full bg-surface-muted border border-border-subtle rounded-xl py-3 px-4 flex items-center justify-between cursor-pointer transition-all hover:border-primary/50 ${isOpen ? 'ring-2 ring-primary/20 border-primary' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary/70">{icon}</span>
          <span className={`font-body-main text-body-main ${value ? 'text-on-surface' : 'text-text-secondary'}`}>
            {value || placeholder}
          </span>
        </div>
        <span className={`material-symbols-outlined transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
          expand_more
        </span>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 5, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute z-50 w-full bg-surface-card border border-border-subtle rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl bg-surface-card/95"
          >
            <div className="p-3 border-b border-border-subtle bg-surface-muted/50">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary text-[20px]">search</span>
                <input 
                  autoFocus
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Type to search..."
                  className="w-full bg-surface-card border border-border-subtle rounded-lg py-2 pl-10 pr-4 font-body-sm text-body-sm focus:outline-none focus:border-primary transition-all"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
            
            <div className="max-h-60 overflow-y-auto p-2 no-scrollbar">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelect(opt);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-lg font-body-main text-body-main transition-colors flex items-center justify-between group ${value === opt ? 'bg-primary text-on-primary' : 'hover:bg-primary-container/10 text-on-surface'}`}
                  >
                    {opt}
                    {value === opt && <span className="material-symbols-outlined text-[18px]">check</span>}
                    {value !== opt && <span className="material-symbols-outlined text-[18px] opacity-0 group-hover:opacity-100 transition-opacity text-primary">arrow_forward</span>}
                  </button>
                ))
              ) : (
                <div className="p-4 text-center text-text-secondary font-body-sm">
                  No results found
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LocationSelector;
