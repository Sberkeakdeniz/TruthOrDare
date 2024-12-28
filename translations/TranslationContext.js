import React, { createContext, useState, useContext, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { en } from './en';
import { tr } from './tr';
import { es } from './es';
import { fr } from './fr';

const translations = { en, tr, es, fr };

const TranslationContext = createContext();

export const TranslationProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');
  const [strings, setStrings] = useState(translations.en);

  useEffect(() => {
    loadLanguagePreference();
  }, []);

  const loadLanguagePreference = async () => {
    try {
      const savedLanguage = await SecureStore.getItemAsync('language');
      if (savedLanguage) {
        setLanguage(savedLanguage);
        setStrings(translations[savedLanguage]);
      }
    } catch (error) {
      console.log('Error loading language preference:', error);
    }
  };

  const changeLanguage = async (lang) => {
    try {
      await SecureStore.setItemAsync('language', lang);
      setLanguage(lang);
      setStrings(translations[lang]);
    } catch (error) {
      console.log('Error saving language preference:', error);
    }
  };

  return (
    <TranslationContext.Provider value={{ strings, language, changeLanguage }}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
}; 