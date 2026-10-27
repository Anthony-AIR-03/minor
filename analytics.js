// Telumera analytics for the whole site: page views, plus custom events for downloads and podcasts.
// Loaded (deferred) right after collect.telumera.nl/telumera.js. If that script is blocked or down,
// everything here becomes a no-op and the site keeps working.
// Downloads: give the link data-track="<event name>" (optionally data-track-format="pdf").
// Podcasts: player.js calls window.minorTrack() once enough of an episode has been listened to.
(function () {
  "use strict";

  let client = null;
  try {
    if (window.telumera) {
      client = window.telumera.init({
        siteToken: "T4dtUjdHXX3KJwJ36E_U9MoeepI0Gfu0vns-7_s-HPQ",
        endpoint: "https://collect.telumera.nl/v1/events",
        environment: "production"
      });
    }
  } catch {
    client = null; // analytics must never break the page
  }

  window.minorTrack = function (name, properties) {
    if (!client) return;
    try {
      client.track(name, properties || {});
    } catch {
      /* ignore */
    }
  };

  document.addEventListener("click", (e) => {
    const link = e.target.closest("a[data-track]");
    if (!link || !link.getAttribute("href")) return; // no href = file not available (yet)
    const props = { path: location.pathname };
    if (link.dataset.trackFormat) props.format = link.dataset.trackFormat;
    window.minorTrack(link.dataset.track, props);
  });
})();
