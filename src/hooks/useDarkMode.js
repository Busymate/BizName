import { useEffect } from 'react';
import useLocalStorage from './useLocalStorage';
import { KEYS } from '../utils/storage';

export default function useDarkMode() {
  const [darkMode, setDarkMode] = useLocalStorage(KEYS.DARK_MODE, false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  return { darkMode, toggleDarkMode };
}
