import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  actualTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  colors: typeof lightColors;
}

const lightColors = {
  background: '#FFFFFF',
  surface: '#F5F5F5',
  card: '#FFFFFF',
  text: '#000000',
  textSecondary: '#666666',
  primary: '#3B82F6',
  primaryLight: '#DBEAFE',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  critical: '#DC2626',
  border: '#E5E7EB',
  shadow: '#00000020',
};

const darkColors = {
  background: '#0F172A',
  surface: '#1E293B',
  card: '#334155',
  text: '#FFFFFF',
  textSecondary: '#94A3B8',
  primary: '#60A5FA',
  primaryLight: '#1E3A8A',
  success: '#34D399',
  warning: '#FBBF24',
  error: '#F87171',
  critical: '#EF4444',
  border: '#475569',
  shadow: '#00000040',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemTheme = useColorScheme() || 'light';
  const [theme, setThemeState] = useState<Theme>('system');
  
  const actualTheme = theme === 'system' ? systemTheme : theme;
  const colors = actualTheme === 'dark' ? darkColors : lightColors;

  useEffect(() => {
    // Load saved theme preference
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme) {
        setThemeState(savedTheme as Theme);
      }
    } catch (error) {
      console.error('Failed to load theme:', error);
    }
  };

  const setTheme = async (newTheme: Theme) => {
    try {
      setThemeState(newTheme);
      await AsyncStorage.setItem('theme', newTheme);
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, actualTheme, setTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
