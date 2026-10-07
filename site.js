// Theme switch for the whole site: Licht (light), Donker (dark) or Systeem (follow the device).
// Loaded in <head> before the stylesheet, so the theme is right on the first paint (no flash).
// The games don't load this script: they keep their own theme.
(function () {
  "use strict";

  const KEY = "minor-theme";
  const THEMES = ["light", "dark", "system"];
  const root = document.documentElement;

  function stored() {
    try {
      const v = localStorage.getItem(KEY);
      return THEMES.includes(v) ? v : "system";
    } catch {
      return "system"; // storage blocked: just follow the system
    }
  }

  function apply(theme) {
    root.dataset.theme = theme;
  }

  apply(stored());

  /* ---------- the switch in the top bar ---------- */
  const ICONS = {
    light: '<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><circle cx="10" cy="10" r="3.6" stroke="currentColor" stroke-width="1.7"/><path d="M10 1.8v2M10 16.2v2M1.8 10h2M16.2 10h2M4.2 4.2l1.4 1.4M14.4 14.4l1.4 1.4M4.2 15.8l1.4-1.4M14.4 5.6l1.4-1.4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
    dark: '<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M16.5 12.2A6.8 6.8 0 0 1 7.8 3.5a6.8 6.8 0 1 0 8.7 8.7z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>',
    system: '<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><rect x="2.5" y="3.5" width="15" height="10" rx="1.8" stroke="currentColor" stroke-width="1.7"/><path d="M7 17h6M10 13.5V17" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>'
  };
  const LABELS = { light: "Licht", dark: "Donker", system: "Systeem" };
  let syncSwitch = () => {};

  function buildSwitch() {
    const bar = document.querySelector(".topbar");
    if (!bar || bar.querySelector(".theme-switch")) return;
    const group = document.createElement("div");
    group.className = "theme-switch";
    group.setAttribute("role", "radiogroup");
    group.setAttribute("aria-label", "Thema");
    group.innerHTML = THEMES.map((t) =>
      `<button type="button" role="radio" data-theme-choice="${t}" aria-label="${LABELS[t]}" title="${LABELS[t]}">${ICONS[t]}</button>`).join("");
    const cta = bar.querySelector(".pill-cta");
    bar.insertBefore(group, cta || null);

    const buttons = [...group.querySelectorAll("button")];
    const sync = syncSwitch = () => {
      const current = root.dataset.theme;
      buttons.forEach((b) => {
        const on = b.dataset.themeChoice === current;
        b.setAttribute("aria-checked", String(on));
        b.tabIndex = on ? 0 : -1; // one tab stop for the group; arrow keys move within it
      });
    };
    const choose = (theme, focus) => {
      apply(theme);
      try { localStorage.setItem(KEY, theme); } catch { /* not remembered, still applied */ }
      sync();
      if (focus) group.querySelector(`[data-theme-choice="${theme}"]`).focus();
    };
    group.addEventListener("click", (e) => {
      const b = e.target.closest("[data-theme-choice]");
      if (b) choose(b.dataset.themeChoice, false);
    });
    group.addEventListener("keydown", (e) => {
      const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
      if (!step) return;
      e.preventDefault();
      const i = THEMES.indexOf(root.dataset.theme);
      choose(THEMES[(i + step + THEMES.length) % THEMES.length], true);
    });
    sync();
  }

  // Follow a change made in another tab.
  window.addEventListener("storage", (e) => {
    if (e.key !== KEY) return;
    apply(THEMES.includes(e.newValue) ? e.newValue : "system");
    syncSwitch();
  });

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", buildSwitch);
  else buildSwitch();
})();
