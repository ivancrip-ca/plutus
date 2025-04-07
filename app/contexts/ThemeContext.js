'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

// Create the context with a default value
const ThemeContext = createContext({
  darkMode: false,
  toggleDarkMode: () => {},
});

// Create the provider component with better client-side handling
export function ThemeProvider({ children }) {
  // Initialize with null to avoid hydration mismatch
  const [darkMode, setDarkMode] = useState(null);
  const [mounted, setMounted] = useState(false);

  // Only run on client-side to avoid hydration issues
  useEffect(() => {
    setMounted(true);
    
    const savedTheme = localStorage.getItem('darkMode');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme !== null) {
      setDarkMode(savedTheme === 'true');
    } else if (prefersDark) {
      setDarkMode(true);
    } else {
      setDarkMode(false);
    }
  }, []);

  // Apply dark mode class to HTML
  useEffect(() => {
    if (mounted && darkMode !== null) {
      if (darkMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('darkMode', 'true');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('darkMode', 'false');
      }
    }
  }, [darkMode, mounted]);

  // Toggle function with explicit debugging
  const toggleDarkMode = () => {
    console.log('Toggle dark mode, current:', darkMode);
    setDarkMode(prev => !prev);
  };

  // Provide a consistent value during SSR
  const value = {
    darkMode: darkMode === null ? false : darkMode,
    toggleDarkMode
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// Create and export the hook
export function useTheme() {
  return useContext(ThemeContext);
}
