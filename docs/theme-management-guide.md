# Theme Management Guide

## Overview

This project implements a **manifest-driven, file-based theme system** for Adobe Edge Delivery Services (EDS). Themes are defined as individual CSS files that override design tokens. The set of themes available in the UI is controlled entirely by a single JSON manifest file — no code changes required to add or remove themes.

---

## How It Works

### Token Cascade

```
styles/styles.css          ← base design tokens defined on :root
       ↓
styles/themes/theme-X.css  ← theme overrides tokens on body.theme-X
       ↓
blocks/**/*.css            ← blocks consume tokens via var(--token-name)
```

When a theme is active, the `<body>` element gets a class like `theme-ocean`. Theme CSS files are scoped to that body class selector, so all block styles pick up the new values automatically through CSS custom property inheritance — **no block JS or HTML changes needed**.

---

## Files Involved

### 1. `styles/themes/themes-manifest.json` ← **The only file you edit to add/remove themes**

```json
["forest", "ocean", "sunset"]
```

- Each string must match the name portion of a theme CSS file (`theme-{name}.css`)
- This is the single source of truth for what appears in the Theme Switcher UI
- Add a name here → button appears in the switcher
- Remove a name here → button disappears from the switcher
- Pushing this file as part of your EDS code deploy is all that is needed to update available themes

---

### 2. `styles/themes/theme-{name}.css` ← **One file per theme**

Each theme file contains CSS custom property overrides scoped to a body class. Example structure:

```css
/* styles/themes/theme-ocean.css */
body.theme-ocean {
  /* Base colors */
  --background-color: #b8e8f8;
  --light-color: #7dd6f5;
  --dark-color: #0077b6;
  --text-color: #02344f;
  --link-color: #00b4d8;
  --link-hover-color: #0077b6;

  /* Block tokens — cards */
  --card-border-color: #00b4d8;
  --card-bg-color: #e8f8fd;
  --card-radius: 12px;
  --card-shadow: 0 4px 16px rgba(0, 180, 216, 0.25);
  --card-shadow-hover: 0 8px 28px rgba(0, 180, 216, 0.45);

  /* Block tokens — hero */
  --hero-text-color: #ffffff;
  --hero-bg-color: #0077b6;
  --hero-overlay-color: rgba(0, 50, 90, 0.65);

  /* Block tokens — columns */
  --columns-divider-color: #00b4d8;
  --columns-gap: 32px;

  /* Block tokens — stats */
  --stats-bg-color: #023e8a;
  --stats-accent-color: #48cae4;
  --stats-text-color: #ffffff;
  --stats-label-color: rgba(255, 255, 255, 0.85);
  --stats-border-color: rgba(72, 202, 228, 0.4);

  /* Buttons */
  --button-primary-bg: #0096c7;
  --button-primary-border: #0096c7;
  --button-primary-color: #ffffff;
  --button-primary-hover-bg: #0077b6;
  --button-primary-hover-border: #0077b6;
}
```

All token names must match what the blocks reference — see `styles/styles.css` for the full token list defined at `:root`.

---

### 3. `blocks/theme-switcher/theme-switcher.js` ← **Block that renders theme buttons**

This block fetches `themes-manifest.json` at runtime and renders one button per theme. It is fully decoupled from authored document content.

**Key responsibilities:**

- `fetchAvailableThemes()` — fetches the manifest; returns `[]` on any error so the switcher fails silently
- `applyTheme(name)` — removes old `theme-*` class from `<body>`, adds new one, dynamically loads the CSS, persists choice to `localStorage`
- `updateActiveButton()` — keeps button highlight in sync with active theme
- `decorate(block)` — async entry point; builds the entire UI from manifest data

**The authored document block table no longer needs theme name rows.** A bare `| Theme Switcher |` block is sufficient.

---

### 4. `blocks/theme-switcher/theme-switcher.css` ← **Switcher widget styling**

Styles the pill-shaped theme buttons. Uses theme tokens (`var(--link-color)`, `var(--background-color)`) so the switcher itself re-styles when a theme is active.

No changes needed here when adding themes.

---

### 5. `scripts/scripts.js` — `resolveAndLoadTheme()` ← **Restores persisted theme on page load**

Called during `loadEager()`. Checks:

1. If `decorateTemplateAndTheme()` already applied a `theme-*` class from page metadata → loads that theme's CSS
2. Otherwise checks `localStorage` for a user-persisted preference → applies the class and loads the CSS

This means:

- **Page-level default theme**: set the `Theme` field in DA Page Metadata to `theme-ocean` (or any theme name)
- **User preference**: the last theme the visitor picked is restored automatically on their next visit

---

## Adding a New Theme

1. Create `styles/themes/theme-{name}.css` following the token structure above
2. Add `"{name}"` to `styles/themes/themes-manifest.json`
3. Deploy both files

The new theme button will appear in the Theme Switcher automatically on the next page load.

**Example — adding a "Midnight" theme:**

```
styles/themes/theme-midnight.css    ← create this file
styles/themes/themes-manifest.json  ← change to ["forest", "ocean", "sunset", "midnight"]
```

---

## Removing a Theme

1. Remove `"{name}"` from `styles/themes/themes-manifest.json`
2. Optionally delete `styles/themes/theme-{name}.css`
3. Deploy

The button disappears from the switcher immediately. If a user had that theme persisted in `localStorage`, `resolveAndLoadTheme()` will attempt to load the missing CSS — the `loadCSS` call will silently fail and the page will render with base tokens.

---

## Required Token Reference

Every theme CSS file should define all of the following tokens to ensure full coverage across all blocks:

| Token                           | Used By                   |
| ------------------------------- | ------------------------- |
| `--background-color`            | global, buttons, switcher |
| `--light-color`                 | global                    |
| `--dark-color`                  | global                    |
| `--text-color`                  | global, switcher label    |
| `--link-color`                  | global, switcher buttons  |
| `--link-hover-color`            | global, switcher buttons  |
| `--card-border-color`           | cards block               |
| `--card-bg-color`               | cards block               |
| `--card-radius`                 | cards block               |
| `--card-shadow`                 | cards block               |
| `--card-shadow-hover`           | cards block               |
| `--hero-text-color`             | hero block                |
| `--hero-bg-color`               | hero block                |
| `--hero-overlay-color`          | hero block                |
| `--columns-divider-color`       | columns block             |
| `--columns-gap`                 | columns block             |
| `--stats-bg-color`              | stats block               |
| `--stats-accent-color`          | stats block               |
| `--stats-text-color`            | stats block               |
| `--stats-label-color`           | stats block               |
| `--stats-border-color`          | stats block               |
| `--button-primary-bg`           | buttons                   |
| `--button-primary-border`       | buttons                   |
| `--button-primary-color`        | buttons                   |
| `--button-primary-hover-bg`     | buttons                   |
| `--button-primary-hover-border` | buttons                   |

Tokens not defined in a theme file fall back to the `:root` values in `styles/styles.css`.

---

## File Change Summary

| File                                      | Change Needed When                                                  |
| ----------------------------------------- | ------------------------------------------------------------------- |
| `styles/themes/themes-manifest.json`      | Adding or removing any theme                                        |
| `styles/themes/theme-{name}.css`          | Creating or modifying a specific theme                              |
| `blocks/theme-switcher/theme-switcher.js` | Changing switcher behaviour (not for theme content)                 |
| `scripts/scripts.js`                      | Changing theme resolution/persistence logic (not for theme content) |

---

## Deployment Notes

All files in `styles/themes/` are served as static assets from the EDS code repository. When deploying updates:

- Changes to `themes-manifest.json` take effect on the next page load (the manifest is fetched fresh each time — it is not cached by the block)
- Theme CSS files are loaded on demand and cached by the browser; a hard refresh or cache-busting deploy clears them
- No server-side changes, build steps, or redeployment of HTML pages is required — only the files in `styles/themes/` need to change
