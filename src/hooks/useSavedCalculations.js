import useLocalStorage from './useLocalStorage';
import { KEYS } from '../utils/storage';

// Saved calculations are stored as one object keyed by tool slug, each
// holding an array of { id, savedAt, data } entries so every tool can
// save/load its own results independently.
export default function useSavedCalculations(toolSlug) {
  const [all, setAll] = useLocalStorage(KEYS.SAVED_CALCULATIONS, {});
  const entries = all[toolSlug] || [];

  const save = (data) => {
    const entry = { id: Date.now().toString(), savedAt: new Date().toISOString(), data };
    setAll((prev) => ({
      ...prev,
      [toolSlug]: [entry, ...(prev[toolSlug] || [])].slice(0, 20),
    }));
    return entry;
  };

  const remove = (id) => {
    setAll((prev) => ({
      ...prev,
      [toolSlug]: (prev[toolSlug] || []).filter((e) => e.id !== id),
    }));
  };

  return { entries, save, remove };
}
