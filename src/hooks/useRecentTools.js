import useLocalStorage from './useLocalStorage';
import { KEYS } from '../utils/storage';

const MAX_RECENT = 8;

// Tracks the most recently visited/used tool slugs, most recent first.
export default function useRecentTools() {
  const [recent, setRecent] = useLocalStorage(KEYS.RECENT_TOOLS, []);

  const addRecent = (slug) => {
    setRecent((prev) => {
      const withoutSlug = prev.filter((s) => s !== slug);
      return [slug, ...withoutSlug].slice(0, MAX_RECENT);
    });
  };

  return { recent, addRecent };
}
