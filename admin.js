(() => {
  const CFG = CW_CONFIG, API = `https://api.github.com/repos/${CFG.githubOwner}/${CFG.githubRepo}`;
  let token = null, data = { attractions: [], links: null };
  const $ = id => document.getElementById(id);
  $("repoLabel").textContent = `${CFG.githubOwner}/${CFG.githubRepo}`; $("dataPathLabel").textContent = CFG.dataPath;
  const msg = (el, t, ok) => el.innerHTML = `<div class="msg ${ok ? "ok" : "error"}">${CW.esc(t)}</div>`;

  $("loginBtn").onclick = async () => {
    const v = $("tokenInput").value.trim(); if (!v) return;
    try {
      const r = await fetch(API, { headers: { Authorization: `Bearer ${v}` } }), b = await r.json().catch(() => ({}));
      if (!r.ok) return msg($("loginMsg"), `GitHub said ${r.status}: ${b.message || "no message"}. Check the repo name in config.js and the token.`);
      if (!b.permissions || !b.permissions.push) return msg($("loginMsg"), "Token works but has no write access to this repo.");
      token = v; $("tokenInput").value = ""; $("loginPanel").style.display = "none"; $("adminMain").style.display = "block";
      $("loginState").textContent = "Logged in"; $("loginState").classList.add("extended");
      data = await CW.load(); data.home = CWHome.withDefaults(data.home); data.links = CWLinks.normalize(data.links); bindHome(); render(); renderLinks();
    } catch (e) { msg($("loginMsg"), "Network error contacting GitHub."); }
  };

  const STATUS = [["open", "Open (follows hours)"], ["closed", "Closed"], ["engineering", "Closed — Engineering Work"], ["temp_shut", "Temporarily Shut"], ["private_event", "Private Event"]];
  function field(label, html) { return `<div class="field"><label>${label}</label>${html}</div>`; }

  function render() {
    const list = $("list"); list.innerHTML = "";
    data.attractions.forEach((a, i) => {
      const el = document.createElement("div"); el.className = "att-admin";
      el.innerHTML = `<h3>${CW.esc(a.name || "New attraction")}</h3>
      <div class="field-row">
        ${field("Name", `<input data-k="name" value="${CW.esc(a.name)}">`)}
        ${field("Icon <small>(file name, no extension)</small>", `<input data-k="icon" value="${CW.esc(a.icon)}" placeholder="${CW.slug(a.name || "name")}">`)}
        ${field("Status", `<select data-k="status">${STATUS.map(s => `<option value="${s[0]}" ${a.status === s[0] ? "selected" : ""}>${s[1]}</option>`).join("")}</select>`)}
      </div>
      <div class="field-row">
        ${field("Opens", `<input type="time" data-k="open" value="${a.open || ""}">`)}
        ${field("Closes", `<input type="time" data-k="close" value="${a.close || ""}">`)}
        <div class="field"><label><input type="checkbox" data-k="allDay" ${a.allDay ? "checked" : ""}> Open all day (24h)</label></div>
        ${field("Reopens <small>(when closed, e.g. 3:00 PM)</small>", `<input data-k="reopensAt" value="${CW.esc(a.reopensAt)}">`)}
      </div>
      <div class="field-row">
        ${field("Description", `<input data-k="description" value="${CW.esc(a.description)}" style="width:320px">`)}
        ${field("Note <small>(shown on the card)</small>", `<input data-k="note" value="${CW.esc(a.note)}" style="width:260px">`)}
      </div>
      <p><small>Embed on your website: <code>&lt;iframe src="https://attractions.chungasworld.co.uk/embed/${CW.esc(a.id)}" style="border:0;width:100%;height:140px"&gt;&lt;/iframe&gt;</code></small></p>
      <div class="field-row"><button class="secondary" data-act="up">↑</button><button class="secondary" data-act="down">↓</button><button class="danger" data-act="del">Delete</button></div>`;
      el.querySelectorAll("[data-k]").forEach(inp => inp.onchange = () => { a[inp.dataset.k] = inp.type === "checkbox" ? inp.checked : inp.value; if (inp.dataset.k === "name") el.querySelector("h3").textContent = a.name; });
      el.querySelectorAll("[data-act]").forEach(b => b.onclick = () => {
        const act = b.dataset.act, L = data.attractions;
        if (act === "del") { if (!confirm(`Delete ${a.name}?`)) return; L.splice(i, 1); }
        else { const j = act === "up" ? i - 1 : i + 1; if (j < 0 || j >= L.length) return; [L[i], L[j]] = [L[j], L[i]]; }
        render();
      });
      list.appendChild(el);
    });
  }


  // ── "Explore Chungas World" links (saved inside data.json under "links") ──
  const ea = (s) => CW.esc(s);                       // escape for HTML attributes
  const refreshPreview = () => CWLinks.render($("cwLinks"), { newTab: true, links: data.links });
  const move = (arr, i, d) => { const j = i + d; if (j < 0 || j >= arr.length) return false; [arr[i], arr[j]] = [arr[j], arr[i]]; return true; };

  function renderLinks() {
    const L = data.links, root = $("linksEditor"); root.innerHTML = "";

    // NEW banner
    const fe = document.createElement("div"); fe.className = "att-admin";
    const f = L.featured;
    fe.innerHTML = `<h3>NEW banner (the gold bar at the top)</h3>
      <div class="field-row"><div class="field"><label><input type="checkbox" data-f="on" ${f ? "checked" : ""}> Show the banner</label></div></div>
      ${f ? `<div class="field-row">
        ${field("Banner text", `<input data-f="label" value="${ea(f.label)}" style="width:440px;max-width:100%">`)}
        ${field("Link <small>(full https:// address)</small>", `<input data-f="href" value="${ea(f.href)}" style="width:440px;max-width:100%">`)}
      </div>` : ""}`;
    fe.querySelector('[data-f="on"]').onchange = e => { L.featured = e.target.checked ? (L._f || { label: "", href: "" }) : (L._f = L.featured, null); renderLinks(); refreshPreview(); };
    fe.querySelectorAll('[data-f="label"],[data-f="href"]').forEach(inp => inp.oninput = () => { L.featured[inp.dataset.f === "href" ? "href" : "label"] = inp.value; refreshPreview(); });
    root.appendChild(fe);

    // Sections
    L.groups.forEach((g, gi) => {
      const el = document.createElement("div"); el.className = "att-admin";
      el.innerHTML = `<h3>${CW.esc(g.title || "New section")}</h3>
        <div class="field-row">
          ${field("Section title", `<input data-g="title" value="${ea(g.title)}">`)}
          <button class="secondary" data-gact="up">↑</button><button class="secondary" data-gact="down">↓</button><button class="danger" data-gact="del">Delete section</button>
        </div>
        <div class="lk-list"></div>
        <div class="field-row"><button data-gact="add">+ Add link</button></div>`;
      el.querySelector('[data-g="title"]').oninput = e => { g.title = e.target.value; el.querySelector("h3").textContent = g.title || "New section"; refreshPreview(); };
      el.querySelectorAll("[data-gact]").forEach(b => b.onclick = () => {
        const act = b.dataset.gact;
        if (act === "del") { if (!confirm(`Delete the section "${g.title}" and its ${g.links.length} link(s)?`)) return; L.groups.splice(gi, 1); }
        else if (act === "add") g.links.push({ label: "", path: "" });
        else if (!move(L.groups, gi, act === "up" ? -1 : 1)) return;
        renderLinks(); refreshPreview();
      });
      const lk = el.querySelector(".lk-list");
      g.links.forEach((l, li) => {
        const row = document.createElement("div"); row.className = "field-row";
        row.innerHTML = `${field("Button text", `<input data-l="label" value="${ea(l.label)}" style="width:250px;max-width:100%">`)}
          ${field("Link <small>(/page or https://…)</small>", `<input data-l="path" value="${ea(l.path)}" style="width:300px;max-width:100%">`)}
          <button class="secondary" data-lact="up">↑</button><button class="secondary" data-lact="down">↓</button><button class="danger" data-lact="del">✕</button>`;
        row.querySelectorAll("[data-l]").forEach(inp => inp.oninput = () => { l[inp.dataset.l] = inp.value; refreshPreview(); });
        row.querySelectorAll("[data-lact]").forEach(b => b.onclick = () => {
          const act = b.dataset.lact;
          if (act === "del") g.links.splice(li, 1);
          else if (!move(g.links, li, act === "up" ? -1 : 1)) return;
          renderLinks(); refreshPreview();
        });
        lk.appendChild(row);
      });
      root.appendChild(el);
    });
    refreshPreview();
  }

  $("addGroupBtn").onclick = () => { const t = prompt("Section title?"); if (!t) return; data.links.groups.push({ title: t, links: [{ label: "", path: "" }] }); renderLinks(); };
  $("resetLinksBtn").onclick = () => { if (!confirm("Replace ALL links with the original list? (Nothing is saved until you press Save.)")) return; data.links = CWLinks.defaults(); renderLinks(); };

  $("addBtn").onclick = () => {
    const n = prompt("Attraction name?"); if (!n) return;
    let id = CW.slug(n) || "attraction", k = 2; while (data.attractions.some(a => a.id === id)) id = CW.slug(n) + "-" + k++;
    data.attractions.push({ id, name: n, icon: CW.slug(n), description: "", status: "open", allDay: false, open: "10:00", close: "18:00", note: "", reopensAt: "" });
    render();
  };

  // Home page settings (saved inside data.json under "home")
  function bindHome() {
    const H = data.home, map = { homeTitle: "title", homeSub: "subtitle", homeYt: "youtube", homeDim: "dim" };
    const check = () => { const raw = H.youtube, id = CWHome.ytId(raw);
      $("homeYtCheck").textContent = !raw ? "No video set — the page shows a plain dark background." : id ? `Video found (${id}). Make sure the video allows embedding.` : "That doesn't look like a YouTube link."; };
    Object.entries(map).forEach(([elId, key]) => {
      const el = $(elId); el.value = H[key] ?? "";
      el.oninput = () => { H[key] = key === "dim" ? Math.min(90, Math.max(0, +el.value || 0)) : el.value; if (key === "youtube") check(); };
    });
    check();
  }

  const b64 = s => btoa(String.fromCharCode(...new TextEncoder().encode(s)));

  // Standalone embed page for one attraction (same as the files in /embed).
  const embedPage = a => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex" />
<base href="/" />
<title>${CW.esc(a.name)} — Chungas World</title>
<link rel="icon" type="image/png" href="favicon.png" />
<link rel="stylesheet" href="style.css?v=1" />
<link rel="stylesheet" href="embed.css?v=1" />
</head>
<body data-id="${CW.esc(a.id)}">
<div id="card"></div>
<script src="config.js?v=1"></script>
<script src="core.js?v=1"></script>
<script src="embed.js?v=1"></script>
</body>
</html>
`;

  // Creates embed/<id>.html for every attraction that doesn't have one yet. Returns the ids it created.
  async function ensureEmbedPages(h) {
    const made = [];
    for (const a of data.attractions) {
      if (!a.id) continue;
      const url = `${API}/contents/embed/${encodeURIComponent(a.id)}.html`;
      const exists = await fetch(`${url}?ref=${CFG.githubBranch}`, { headers: h });
      if (exists.ok) continue;                                   // already there – leave it alone
      if (exists.status !== 404) throw new Error(`Checking embed page for ${a.name} failed (${exists.status})`);
      const r = await fetch(url, { method: "PUT", headers: h, body: JSON.stringify({ message: `Add embed page for ${a.name}`, content: b64(embedPage(a)), branch: CFG.githubBranch }) });
      if (!r.ok) { const b = await r.json().catch(() => ({})); throw new Error(`Creating embed page for ${a.name} failed (${r.status}): ${b.message || ""}`); }
      made.push(a.id);
    }
    return made;
  }

  $("saveBtn").onclick = async () => {
    $("saveBtn").disabled = true;
    try {
      const url = `${API}/contents/${CFG.dataPath}`, h = { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" };
      const cur = await fetch(`${url}?ref=${CFG.githubBranch}`, { headers: h }); const sha = cur.ok ? (await cur.json()).sha : undefined;
      const r = await fetch(url, { method: "PUT", headers: h, body: JSON.stringify({ message: "Update attractions via admin", content: b64(JSON.stringify(data, (k, v) => k === "_f" ? undefined : v, 2) + "\n"), branch: CFG.githubBranch, sha }) });
      const b = await r.json().catch(() => ({}));
      if (!r.ok) { msg($("saveMsg"), `Save failed (${r.status}): ${b.message || ""}`); }
      else {
        try {
          const made = await ensureEmbedPages(h);
          msg($("saveMsg"), "Saved! The site updates in about a minute." + (made.length ? ` Created embed page${made.length > 1 ? "s" : ""}: ${made.map(i => "/embed/" + i).join(", ")}` : ""), true);
        } catch (e) { msg($("saveMsg"), `Attractions saved, but: ${e.message}`); }
      }
    } catch (e) { msg($("saveMsg"), "Network error while saving."); }
    $("saveBtn").disabled = false;
  };
})();
