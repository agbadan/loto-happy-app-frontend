import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner@2.0.3';

type Theme = 'light' | 'dark' | 'auto';
type ActualTheme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  actualTheme: ActualTheme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Récupérer le thème sauvegardé ou utiliser 'dark' par défaut
    const savedTheme = localStorage.getItem('loto-happy-theme') as Theme;
    return savedTheme || 'dark';
  });

  const [actualTheme, setActualTheme] = useState<ActualTheme>('dark');

  // Détecter le thème du système
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const updateActualTheme = () => {
      if (theme === 'auto') {
        setActualTheme(mediaQuery.matches ? 'dark' : 'light');
      } else {
        setActualTheme(theme as ActualTheme);
      }
    };

    updateActualTheme();

    // Écouter les changements de préférence système
    mediaQuery.addEventListener('change', updateActualTheme);
    return () => mediaQuery.removeEventListener('change', updateActualTheme);
  }, [theme]);

  // Appliquer le thème au body
  useEffect(() => {
    if (actualTheme === 'light') {
      document.body.classList.add('theme-light');
    } else {
      document.body.classList.remove('theme-light');
    }
  }, [actualTheme]);

  // Sauvegarder dans localStorage
  useEffect(() => {
    localStorage.setItem('loto-happy-theme', theme);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    
    // Toast de confirmation
    if (newTheme === 'light') {
      toast.success('Thème Clair activé', {
        description: 'Parfait pour une utilisation en journée',
        duration: 2000,
      });
    } else if (newTheme === 'dark') {
      toast.success('Thème Sombre activé', {
        description: 'Confort optimal pour vos yeux',
        duration: 2000,
      });
    } else {
      toast.success('Thème Automatique activé', {
        description: 'Le thème s\'adapte à vos préférences système',
        duration: 2000,
      });
    }
  };

  const toggleTheme = () => {
    // Toggle entre light et dark uniquement
    if (actualTheme === 'light') {
      setTheme('dark');
    } else {
      setTheme('light');
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, actualTheme, toggleTheme, setTheme }}>
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
