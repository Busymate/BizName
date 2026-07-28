import useLocalStorage from './useLocalStorage';
import { KEYS } from '../utils/storage';

// Starred tool slugs, most-recently-starred first. Lives in localStorage
// like useRecentTools — a browser-level preference, not business data,
// so it doesn't need its own Supabase table/RLS policy.
export default function useFavoriteTools() {
  const [favorites, setFavorites] = useLocalStorage(KEYS.FAVORITE_TOOLS, []);

  const isFavorite = (slug) => favorites.includes(slug);

  const toggleFavorite = (slug) => {
    setFavorites((prev) => (prev.includes(slug) ? prev.filter((s) => s !== slug) : [slug, ...prev]));
  };

  return { favorites, isFavorite, toggleFavorite };
}
