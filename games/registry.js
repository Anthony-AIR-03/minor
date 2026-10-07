// Game register: loads games/games.json (schemaVersion 1) and checks it, the same rules as the course's basisskilltree.
// Invalid entries are left out and reported, so one typo doesn't take every game offline.
//
// {
//   "schemaVersion": 1,
//   "games": [
//     { "id": "...", "title": "...", "learningGoal": "... (optional)", "path": "/games/.../",
//       "requires": [ { "gameId": "...", "type": "completed" } | { "gameId": "...", "type": "minPercent", "value": 80 } ] }
//   ]
// }
window.GameRegistry = (() => {
  const GAME_FIELDS = ["id", "title", "learningGoal", "path", "requires"];
  const validId = (v) => typeof v === "string" && v.length >= 1 && v.length <= 80 && /^[a-z0-9][a-z0-9-]*$/.test(v);

  function check(data) {
    const errors = [];
    if (!data || typeof data !== "object" || Array.isArray(data)) return { games: [], errors: ["games.json is not a JSON object."] };
    if (data.schemaVersion !== 1) errors.push("schemaVersion must be 1.");
    if (!Array.isArray(data.games)) return { games: [], errors: [...errors, "games must be a list."] };

    // 1. Each entry on its own.
    const seen = new Set();
    let games = [];
    data.games.forEach((g, i) => {
      const where = `game ${i + 1}${g && typeof g.id === "string" ? ` (${g.id})` : ""}`;
      const problems = [];
      if (!g || typeof g !== "object" || Array.isArray(g)) { errors.push(`${where}: geen object.`); return; }
      const extra = Object.keys(g).filter((k) => !GAME_FIELDS.includes(k));
      if (extra.length) problems.push(`onbekend veld ${extra.join(", ")}`);
      if (!validId(g.id)) problems.push("id mag alleen kleine letters, cijfers en streepjes bevatten");
      else if (seen.has(g.id)) problems.push("id wordt twee keer gebruikt");
      if (typeof g.title !== "string" || !g.title.trim()) problems.push("title ontbreekt");
      if (g.learningGoal !== undefined && typeof g.learningGoal !== "string") problems.push("learningGoal moet tekst zijn");
      if (typeof g.path !== "string" || !g.path.startsWith("/")) problems.push("path moet met / beginnen");
      if (!Array.isArray(g.requires)) problems.push("requires moet een lijst zijn");
      if (problems.length) { errors.push(`${where}: ${problems.join("; ")}.`); return; }
      seen.add(g.id);
      games.push({ id: g.id, title: g.title.trim(), learningGoal: g.learningGoal || "", path: g.path, requires: g.requires });
    });

    // 2. Conditions: only known ids, not itself, a known type.
    const ids = new Set(games.map((g) => g.id));
    games = games.filter((g) => {
      const problems = [];
      const refs = new Set();
      g.requires = g.requires.map((r) => {
        if (!r || typeof r !== "object") { problems.push("een voorwaarde is geen object"); return null; }
        const extra = Object.keys(r).filter((k) => !["gameId", "type", "value"].includes(k));
        if (extra.length) problems.push(`onbekend veld ${extra.join(", ")} in een voorwaarde`);
        if (r.gameId === g.id) problems.push("hij vereist zichzelf");
        else if (!ids.has(r.gameId)) problems.push(`hij vereist onbekende game "${r.gameId}"`);
        else if (refs.has(r.gameId)) problems.push(`"${r.gameId}" staat er twee keer in`);
        refs.add(r.gameId);
        if (r.type === "completed") return { gameId: r.gameId, type: "completed" };
        if (r.type === "minPercent") {
          if (!Number.isInteger(r.value) || r.value < 1 || r.value > 100) problems.push("minPercent heeft een geheel getal van 1 tot 100 nodig");
          return { gameId: r.gameId, type: "minPercent", value: r.value };
        }
        problems.push(`onbekend type voorwaarde "${r.type}"`);
        return null;
      });
      if (problems.length) { errors.push(`${g.id}: ${problems.join("; ")}.`); ids.delete(g.id); return false; }
      return true;
    });

    // 3. No circles (and nothing that depends on a removed game).
    let changed = true;
    while (changed) {
      changed = false;
      games = games.filter((g) => {
        const broken = g.requires.find((r) => !ids.has(r.gameId));
        if (broken) { errors.push(`${g.id}: hangt af van "${broken.gameId}", en daarin zit een fout.`); ids.delete(g.id); changed = true; return false; }
        return true;
      });
    }
    const byId = new Map(games.map((g) => [g.id, g]));
    const state = new Map();   // 1 = visiting, 2 = done
    const inCycle = new Set();
    const visit = (id, path) => {
      if (state.get(id) === 2) return;
      if (state.get(id) === 1) { path.slice(path.indexOf(id)).forEach((x) => inCycle.add(x)); return; }
      state.set(id, 1);
      for (const r of byId.get(id).requires) visit(r.gameId, [...path, id]);
      state.set(id, 2);
    };
    games.forEach((g) => visit(g.id, []));
    if (inCycle.size) {
      errors.push(`Deze games vereisen elkaar in een cirkel: ${[...inCycle].join(", ")}.`);
      games = games.filter((g) => !inCycle.has(g.id) && !g.requires.some((r) => inCycle.has(r.gameId)));
    }
    return { games, errors };
  }

  async function load(url) {
    try {
      const res = await fetch(url, { cache: "no-cache" });
      if (!res.ok) return { games: [], errors: [`games.json kon niet worden geladen (HTTP ${res.status}).`] };
      return check(await res.json());
    } catch {
      return { games: [], errors: ["games.json is geen geldige JSON of kon niet worden geladen."] };
    }
  }

  // Is a condition met by the stored results ({ gameId: { bestScore, maxScore } })?
  function met(req, results) {
    const r = results[req.gameId];
    if (!r) return false;
    if (req.type === "completed") return true;
    return r.maxScore > 0 && (r.bestScore / r.maxScore) * 100 >= req.value;
  }

  return { load, check, met };
})();
