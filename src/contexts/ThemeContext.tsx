import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'togglr-light' | 'togglr-dark' | 'dark' | 'cozy' | 'forest';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem('togglr_theme') as Theme;
    return stored || 'togglr-light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('togglr-light', 'togglr-dark', 'dark', 'cozy', 'forest');
    root.classList.add(theme);
    localStorage.setItem('togglr_theme', theme);
  }, [theme]);

  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme: handleSetTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
