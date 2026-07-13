import useLocalStorage from './useLocalStorage';
import { KEYS } from '../utils/storage';

// Manages the list of favorited tool/template slugs app-wide.
export default function useFavorites() {
  const [favorites, setFavorites] = useLocalStorage(KEYS.FAVORITES, []);

  const isFavorite = (slug) => favorites.includes(slug);

  const toggleFavorite = (slug) => {
    setFavorites((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };

  return { favorites, isFavorite, toggleFavorite };
}
