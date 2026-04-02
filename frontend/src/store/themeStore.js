import { create } from 'zustand';

export const useThemeStore = create((set) => ({
  isDark: false,

  // Initialize theme from localStorage on app load
  initTheme: () => {
    const savedTheme = localStorage.getItem('tech_mates_theme');
    const isDark = savedTheme ? JSON.parse(savedTheme) : false;
    
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    set({ isDark });
  },

  // Toggle dark mode
  toggleDarkMode: () => {
    set((state) => {
      const newIsDark = !state.isDark;
      
      // Update DOM
      if (newIsDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      
      // Persist to localStorage
      localStorage.setItem('tech_mates_theme', JSON.stringify(newIsDark));
      
      return { isDark: newIsDark };
    });
  },

  // Set theme explicitly
  setTheme: (isDark) => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    localStorage.setItem('tech_mates_theme', JSON.stringify(isDark));
    set({ isDark });
  },
}));
