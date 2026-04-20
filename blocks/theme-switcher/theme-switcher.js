import { loadCSS } from '../../scripts/aem.js';

const STORAGE_KEY = 'selected-theme';
const THEMES_MANIFEST = `${window.hlx.codeBasePath}/styles/themes/themes-manifest.json`;

/**
 * Fetches the list of available themes from the themes manifest JSON.
 * Returns an empty array if the manifest is missing or malformed.
 *
 * @returns {Promise<string[]>} array of theme names, e.g. ['forest', 'ocean', 'sunset']
 */
async function fetchAvailableThemes() {
  try {
    const resp = await fetch(THEMES_MANIFEST);
    if (!resp.ok) return [];
    const data = await resp.json();
    return Array.isArray(data) ? data.filter((t) => typeof t === 'string' && t.trim()) : [];
  } catch {
    return [];
  }
}

/**
 * Applies a theme by:
 * 1. Removing any existing theme-* class from <body>
 * 2. Adding the new theme class
 * 3. Dynamically loading the theme CSS file
 * 4. Persisting the selection to localStorage
 *
 * @param {string} themeName - e.g. 'ocean', 'forest', 'sunset'
 */
async function applyTheme(themeName) {
  // Remove all existing theme-* classes
  [...document.body.classList]
    .filter((cls) => cls.startsWith('theme-'))
    .forEach((cls) => document.body.classList.remove(cls));

  if (!themeName) {
    localStorage.removeItem(STORAGE_KEY);
    return;
  }

  const themeClass = `theme-${themeName}`;
  document.body.classList.add(themeClass);

  // Dynamically load the theme CSS
  await loadCSS(`${window.hlx.codeBasePath}/styles/themes/${themeClass}.css`);

  // Persist the user's choice
  localStorage.setItem(STORAGE_KEY, themeName);
}

/**
 * Updates button active states to reflect the current theme.
 * @param {HTMLElement} wrapper - the block wrapper element
 * @param {string} activeTheme - the currently active theme name (e.g. 'ocean')
 */
function updateActiveButton(wrapper, activeTheme) {
  wrapper.querySelectorAll('.theme-switcher-btn').forEach((btn) => {
    const isActive = btn.dataset.theme === activeTheme;
    btn.classList.toggle('theme-switcher-btn--active', isActive);
    btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
  });
}

/**
 * Reads the currently active theme name from <body> classes.
 * @returns {string|null} theme name without the 'theme-' prefix, or null
 */
function getActiveTheme() {
  const cls = [...document.body.classList].find((c) => c.startsWith('theme-'));
  return cls ? cls.replace('theme-', '') : null;
}

/**
 * Decorates the Theme Switcher block.
 *
 * Theme options are driven entirely by the themes manifest file at:
 *   styles/themes/themes-manifest.json
 *
 * Adding a theme:  create the CSS file + add its name to the manifest.
 * Removing a theme: delete the CSS file + remove its name from the manifest.
 *
 * @param {HTMLElement} block - the block element
 */
export default async function decorate(block) {
  // Fetch available themes from the manifest
  const themes = await fetchAvailableThemes();

  // Build the switcher UI
  const nav = document.createElement('div');
  nav.className = 'theme-switcher-nav';
  nav.setAttribute('role', 'group');
  nav.setAttribute('aria-label', 'Choose a theme');

  const label = document.createElement('span');
  label.className = 'theme-switcher-label';
  label.textContent = 'Theme:';
  nav.append(label);

  themes.forEach((theme) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'theme-switcher-btn';
    btn.dataset.theme = theme;
    btn.textContent = theme.charAt(0).toUpperCase() + theme.slice(1);
    btn.setAttribute('aria-pressed', 'false');

    btn.addEventListener('click', async () => {
      await applyTheme(theme);
      updateActiveButton(nav, theme);
    });

    nav.append(btn);
  });

  // Replace block content with the built UI
  block.replaceChildren(nav);

  // Set initial active state based on current body class
  const currentTheme = getActiveTheme();
  if (currentTheme) {
    updateActiveButton(nav, currentTheme);
  }
}
