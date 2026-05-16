import React, { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext();

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }) => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [textSize, setTextSize] = useState(localStorage.getItem('textSize') || 'medium');
  const [viewMode, setViewMode] = useState(localStorage.getItem('viewMode') || 'grid');
  const [accessibility, setAccessibility] = useState(JSON.parse(localStorage.getItem('accessibility')) || {
    highContrast: false,
    colorBlind: 'none' // 'none', 'protanopia', 'deuteranopia', 'tritanopia'
  });

  useEffect(() => {
    localStorage.setItem('theme', theme);
    localStorage.setItem('textSize', textSize);
    localStorage.setItem('viewMode', viewMode);
    localStorage.setItem('accessibility', JSON.stringify(accessibility));

    // Apply theme and accessibility to document
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    root.setAttribute('data-text-size', textSize);
    root.setAttribute('data-high-contrast', accessibility.highContrast);
    root.setAttribute('data-color-blind', accessibility.colorBlind);

    if (theme === 'dark') {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [theme, textSize, viewMode, accessibility]);

  return (
    <SettingsContext.Provider value={{
      theme, setTheme,
      textSize, setTextSize,
      viewMode, setViewMode,
      accessibility, setAccessibility
    }}>
      {children}
    </SettingsContext.Provider>
  );
};
