import React, { useState, useEffect } from 'react';
import { Sun, Moon, MonitorSmartphone } from 'lucide-react';
import { useTheme, Theme } from '../context/ThemeContext';

const ThemeSwitcher = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else if (theme === 'system') {
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [theme]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        if (mediaQuery.matches) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  if (!mounted) return null;

  const cycleTheme = () => {
    const modes: Theme[] = ['light', 'dark', 'system'];
    const currentIndex = modes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % modes.length;
    const newTheme = modes[nextIndex];
    setTheme(newTheme);
  };

  return (
    <button
      onClick={cycleTheme}
      className="fixed right-8 top-8 z-50 flex h-10 w-10 items-center justify-center rounded-full
      bg-white/70 dark:bg-gray-900/70 shadow-lg backdrop-blur transition-all duration-300
      hover:bg-white/90 dark:hover:bg-gray-900/90"
      aria-label="Toggle theme"
      style={{ border: 'none' }}
    >
      {theme === 'light' && (
        <Sun className="h-5 w-5 text-gray-800 transition-all duration-500 hover:rotate-90 hover:text-indigo-600" />
      )}
      {theme === 'dark' && (
        <Moon className="h-5 w-5 text-indigo-300 transition-all duration-500 hover:rotate-180 hover:text-white" />
      )}
      {theme === 'system' && (
        <MonitorSmartphone className="h-5 w-5 text-gray-500 transition-all duration-500 hover:scale-110 hover:text-indigo-600" />
      )}
    </button>
  );
};

export default ThemeSwitcher;

