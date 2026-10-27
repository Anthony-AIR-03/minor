// ON AIR audio player: wraps an <audio> inside .player with play, seek, speed and download.
// Once playback has started and the player scrolls out of view, a compact copy of the controls
// appears top right (.player-mini). Buttons with data-seek="<seconds>" (transcript timestamps)
// jump to that moment and start playing.
// The audio file itself is delivered later (.mp4 or .wav): until it exists, the player says so.
(function () {
  "use strict";

  const player = document.querySelector(".player");
  if (!player) return;
  const audio = player.querySelector("audio");
  const playBtn = player.querySelector(".player-play");
  const seek = player.querySelector(".player-seek");
  const timeNow = player.querySelector(".player-now");
  const timeTotal = player.querySelector(".player-total");
  const speedBtn = player.querySelector(".player-speed");
  const download = player.querySelector(".player-download");
  const status = player.querySelector(".player-status");
  const title = player.dataset.title || document.title;

  const SPEEDS = [1, 1.25, 1.5, 1.75, 2, 0.75];
  const ICON_PLAY = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l11-6.5z" fill="currentColor"/></svg>';
  const ICON_PAUSE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" fill="currentColor"/></svg>';

  function fmt(s) {
    if (!isFinite(s)) return "--:--";
    s = Math.floor(s);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = String(s % 60).padStart(2, "0");
    return h ? `${h}:${String(m).padStart(2, "0")}:${sec}` : `${m}:${sec}`;
  }

  /* ---------- compact controls, top right ---------- */
  const mini = document.createElement("div");
  mini.className = "player-mini";
  mini.setAttribute("role", "region");
  mini.setAttribute("aria-label", "Speler");
  mini.hidden = true;
  mini.innerHTML =
    '<button type="button" class="player-play player-play--mini"></button>' +
    '<button type="button" class="player-mini-back" aria-label="15 seconden terug">−15</button>' +
    '<span class="player-mini-text"><span class="player-mini-title"></span>' +
    '<span class="player-mini-time"></span></span>' +
    '<span class="player-mini-bar" aria-hidden="true"><span></span></span>';
  mini.querySelector(".player-mini-title").textContent = title;
  document.body.appendChild(mini);
  const miniPlay = mini.querySelector(".player-play");
  const miniTime = mini.querySelector(".player-mini-time");
  const miniFill = mini.querySelector(".player-mini-bar span");
  mini.querySelector(".player-mini-back").addEventListener("click", () => {
    audio.currentTime = Math.max(0, audio.currentTime - 15);
  });

  let started = false;
  let inView = true;

  function syncMini() {
    mini.hidden = !(started && !audio.ended && !inView);
  }

  new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    syncMini();
  }).observe(player);

  /* ---------- state ---------- */
  function syncPlay() {
    const playing = !audio.paused;
    for (const b of [playBtn, miniPlay]) {
      b.innerHTML = playing ? ICON_PAUSE : ICON_PLAY;
      b.setAttribute("aria-label", playing ? "Pauzeren" : "Afspelen");
    }
    player.classList.toggle("is-playing", playing);
  }

  function syncTime() {
    const d = audio.duration;
    const t = audio.currentTime;
    if (!seek.matches(":active")) seek.value = d ? (t / d) * 1000 : 0;
    seek.style.setProperty("--p", d ? (t / d) * 100 + "%" : "0%");
    seek.setAttribute("aria-valuetext", `${fmt(t)} van ${fmt(d)}`);
    timeNow.textContent = fmt(t);
    miniTime.textContent = `${fmt(t)} / ${fmt(d)}`;
    miniFill.style.width = d ? (t / d) * 100 + "%" : "0%";
    markTranscript(t);
  }

  function toggle() {
    if (audio.paused) audio.play().catch(() => {});
    else audio.pause();
  }

  playBtn.addEventListener("click", toggle);
  miniPlay.addEventListener("click", toggle);
  audio.addEventListener("play", () => {
    started = true;
    syncPlay();
    syncTime();
    syncMini();
  });
  audio.addEventListener("pause", syncPlay);
  audio.addEventListener("ended", () => {
    syncPlay();
    syncMini();
  });
  audio.addEventListener("timeupdate", syncTime);

  /* ---------- analytics: one "played" event once 10% has actually been listened to ---------- */
  // Counts audio that really played (small timeupdate steps), so seeking ahead doesn't count.
  const trackId = player.dataset.trackId;
  const LISTEN_SHARE = 0.1;
  let listened = 0;
  let lastT = null;
  let reported = false;
  audio.addEventListener("timeupdate", () => {
    if (!trackId || reported) return;
    const t = audio.currentTime;
    if (lastT !== null && !audio.paused && !audio.seeking) {
      const step = t - lastT;
      if (step > 0 && step < 2) listened += step;
    }
    lastT = t;
    if (audio.duration && listened >= audio.duration * LISTEN_SHARE) {
      reported = true;
      window.minorTrack?.(`played_${trackId}`, { path: location.pathname, share: LISTEN_SHARE });
    }
  });
  audio.addEventListener("seeking", () => {
    lastT = null;
  });
  audio.addEventListener("loadedmetadata", () => {
    timeTotal.textContent = fmt(audio.duration);
    player.classList.add("is-ready");
    if (download && audio.currentSrc) download.href = audio.currentSrc;
    syncTime();
  });

  seek.addEventListener("input", () => {
    if (audio.duration) audio.currentTime = (seek.value / 1000) * audio.duration;
  });

  speedBtn.addEventListener("click", () => {
    const next = SPEEDS[(SPEEDS.indexOf(audio.playbackRate) + 1) % SPEEDS.length];
    audio.playbackRate = next;
    speedBtn.textContent = String(next).replace(".", ",") + "×";
  });

  // No playable file yet (or it failed): say so instead of showing dead controls.
  const sources = audio.querySelectorAll("source");
  const last = sources[sources.length - 1];
  function unavailable() {
    player.classList.add("is-missing");
    status.hidden = false;
    for (const el of [playBtn, seek, speedBtn]) el.disabled = true;
    if (download) {
      download.removeAttribute("href");
      download.setAttribute("aria-disabled", "true");
    }
  }
  (last || audio).addEventListener("error", unavailable);
  // NETWORK_NO_SOURCE also means "not started yet" (iOS Safari doesn't preload until a tap), so it
  // is no proof the file is missing: restart source selection and let the error event decide.
  if (audio.error) unavailable();
  else if (audio.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) audio.load();

  /* ---------- transcript: click a timestamp to jump, highlight what's playing ---------- */
  const marks = [...document.querySelectorAll("[data-seek]")].map((el) => ({
    el,
    t: Number(el.dataset.seek),
    row: el.closest("[data-line]") || el
  }));
  let current = null;
  function markTranscript(t) {
    let hit = null;
    for (const m of marks) if (m.t <= t + 0.25) hit = m;
    if (hit === current) return;
    current?.row.classList.remove("is-current");
    hit?.row.classList.add("is-current");
    current = hit;
  }
  for (const m of marks) {
    m.el.addEventListener("click", () => {
      if (player.classList.contains("is-missing")) return;
      audio.currentTime = m.t;
      audio.play().catch(() => {});
    });
  }

  /* ---------- lock screen / headphone buttons ---------- */
  if ("mediaSession" in navigator) {
    const art = player.dataset.artwork;
    navigator.mediaSession.metadata = new MediaMetadata({
      title,
      artist: "ON AIR",
      album: "ON AIR podcast",
      artwork: art ? [{ src: art, type: "image/jpeg" }] : []
    });
    navigator.mediaSession.setActionHandler("seekbackward", () => {
      audio.currentTime = Math.max(0, audio.currentTime - 15);
    });
    navigator.mediaSession.setActionHandler("seekforward", () => {
      audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + 15);
    });
  }

  syncPlay();
})();
