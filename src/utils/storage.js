// Central localStorage helpers. Every read/write in the app goes through
// these so key names stay consistent and JSON parse errors never crash the UI.

const KEYS = {
  FAVORITES: 'bizname_favorites',
  RECENT_TOOLS: 'bizname_recent_tools',
  DARK_MODE: 'bizname_dark_mode',
  SAVED_CALCULATIONS: 'bizname_saved_calculations',
  BOOKMARKED_TEMPLATES: 'bizname_bookmarked_templates',
};

export function getItem(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function setItem(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full or unavailable — fail silently, app still works in-memory
  }
}

export function removeItem(key) {
  try {
    localStorage.removeItem(key);
  } catch {
    /* noop */
  }
}

export { KEYS };
