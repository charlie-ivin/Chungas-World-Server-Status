// Renders ONE attraction as a card. Used by /embed/<id>.html and by 404.html (so
// newly added attractions work immediately, without creating a page).
// Id comes from: <body data-id="..."> → ?id=... → last part of the URL path.
(() => {
  const q = new URLSearchParams(location.search);
  const fromPath = decodeURIComponent(location.pathname.split("/").filter(Boolean).pop() || "").replace(/\.html$/, "");
  const id = document.body.dataset.id || q.get("id") || fromPath;
  const root = document.getElementById("card");
  let data;

  // Tell a parent page how tall we are, so its iframe can auto-resize (optional on the host site).
  const sendHeight = () => {
    const h = Math.ceil(document.documentElement.scrollHeight);
    try { parent.postMessage({ type: "cw-embed-height", id, height: h }, "*"); } catch (e) {}
  };

  function render() {
    const a = data.attractions.find(x => x.id === id);
    if (!a) { root.innerHTML = '<div class="att-empty">Attraction not found.</div>'; return sendHeight(); }
    document.title = `${a.name} — Chungas World`;
    const s = CW.status(a);
    root.innerHTML = "";
    const card = document.createElement("div"); card.className = "att-card"; card.id = a.id;
    card.appendChild(CW.icon(a));
    const d = document.createElement("div");
    d.innerHTML = `<div class="att-name">${CW.esc(a.name)}</div>
      <span class="att-pill ${s.state}">${CW.esc(s.label)}</span>
      <div class="att-hours">${CW.esc(s.hours)}</div>
      ${a.description ? `<div class="att-desc">${CW.esc(a.description)}</div>` : ""}
      ${s.note ? `<div class="att-note">${CW.esc(s.note)}</div>` : ""}`;
    card.appendChild(d); root.appendChild(card);
    sendHeight();
  }

  const refresh = () => CW.load().then(d => { data = d; render(); });
  refresh().then(() => { setInterval(() => data && render(), 30000); setInterval(refresh, 60000); })
    .catch(() => { root.innerHTML = '<div class="att-empty">Couldn’t load.</div>'; sendHeight(); });
  addEventListener("load", sendHeight);
  addEventListener("resize", sendHeight);
})();
