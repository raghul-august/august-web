'use client';

import React, { createContext, useContext, useState } from 'react';

const LanguageStringsContext = createContext();

export function LanguageStringsProvider({ children }) {
  const [languageStrings, setLanguageStrings] = useState({});

  const updateLanguageStrings = (lang, strings) => {
    setLanguageStrings(prev => ({
      ...prev,
      [lang]: strings
    }));
  };

  return (
    <LanguageStringsContext.Provider value={{ languageStrings, updateLanguageStrings }}>
      {children}
    </LanguageStringsContext.Provider>
  );
}

export function useLanguageStrings() {
  const context = useContext(LanguageStringsContext);
  if (!context) {
    throw new Error('useLanguageStrings must be used within a LanguageStringsProvider');
  }
  return context;
}
