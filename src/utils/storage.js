// Central localStorage helpers. Every read/write in the app goes through
// these so key names stay consistent and JSON parse errors never crash the UI.

const KEYS = {
  RECENT_TOOLS: 'bizname_recent_tools',
  FAVORITE_TOOLS: 'bizname_favorite_tools',
  NOTIFICATIONS_SEEN_VERSION: 'bizname_notifications_seen_version',
  DARK_MODE: 'bizname_dark_mode',
  NEWSLETTER_SUBSCRIBED: 'bizname_newsletter_subscribed',
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
