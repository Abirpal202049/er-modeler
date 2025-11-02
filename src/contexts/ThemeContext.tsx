import { createContext, useContext, useState, type ReactNode } from 'react';

export type Theme = 'light' | 'dark';

export interface ThemeColors {
  background: string;
  foreground: string;
  primary: string;
  secondary: string;
  accent: string;
  border: string;
  nodeBg: string;
  nodeText: string;
  nodeBorder: string;
  edgeColor: string;
  gridColor: string;
}

const lightTheme: ThemeColors = {
  background: '#ffffff',
  foreground: '#000000',
  primary: '#3b82f6',
  secondary: '#6b7280',
  accent: '#8b5cf6',
  border: '#e5e7eb',
  nodeBg: '#ffffff',
  nodeText: '#1f2937',
  nodeBorder: '#3b82f6',
  edgeColor: '#6b7280',
  gridColor: '#aaaaaa',
};

const darkTheme: ThemeColors = {
  background: '#1a1a1a',
  foreground: '#ffffff',
  primary: '#60a5fa',
  secondary: '#9ca3af',
  accent: '#a78bfa',
  border: '#374151',
  nodeBg: '#2d2d2d',
  nodeText: '#e5e7eb',
  nodeBorder: '#60a5fa',
  edgeColor: '#9ca3af',
  gridColor: '#444444',
};

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  colors: ThemeColors;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark');

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const colors = theme === 'light' ? lightTheme : darkTheme;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
