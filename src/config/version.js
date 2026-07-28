// Centralized version info — every place in the app that shows a version
// number (Footer, Settings → About, What's New, the browser tab title)
// imports from here instead of hardcoding a string. Bump APP_VERSION (and
// add a RELEASE_HISTORY entry) when you ship something, and it updates
// everywhere automatically.
//
// Uses semantic versioning (MAJOR.MINOR.PATCH):
//   PATCH (1.0.x) — bug fixes
//   MINOR (1.x.0) — new features, backwards compatible
//   MAJOR (x.0.0) — redesigns, breaking changes, big AI upgrades

export const APP_NAME = 'BizName';
export const APP_VERSION = '1.1.0';
export const BUILD_DATE = '2026-06-26';
// Increments with every deploy, independent of the semantic version —
// useful for "which exact build is live right now" when debugging a
// report, separate from "which release" the version number tells you.
export const BUILD_NUMBER = 12;
export const RELEASE_NAME = 'AI Assistant & Dashboard';
export const RELEASE_NOTES = [
  'AI Assistant added',
  'Signup added',
  'Dashboard added',
];

// One entry per shipped version, newest first. The What's New page and
// the release banner both read this — RELEASE_HISTORY[0] should always
// match APP_VERSION/RELEASE_NAME/BUILD_DATE/RELEASE_NOTES above.
export const RELEASE_HISTORY = [
  {
    version: '1.1.0',
    name: RELEASE_NAME,
    date: BUILD_DATE,
    notes: RELEASE_NOTES,
  },
  {
    version: '1.0.0',
    name: 'Public Launch',
    date: '2026-06-17',
    notes: ['Public Launch'],
  },
];
