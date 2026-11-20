// Shared logic for attractions.html and admin.html. Times use UK time.
const CW = (() => {
  const CFG = window.CW_CONFIG;
  const LABELS = { open: "Open", closed: "Closed", engineering: "Closed — Engineering Work", temp_shut: "Temporarily Shut", private_event: "Private Event" };

  async function load() {
    const r = await fetch("./data.json?_=" + Date.now());
    if (!r.ok) throw new Error("Could not load data.json");
    const d = await r.json();
    d.attractions = d.attractions || [];
    return d;
  }
  function ukMinutes() {
    let h = 0, m = 0;
    new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", hour: "2-digit", minute: "2-digit", hour12: false })
      .formatToParts(new Date()).forEach(p => { if (p.type === "hour") h = +p.value % 24; if (p.type === "minute") m = +p.value; });
    return h * 60 + m;
  }
  const toMin = s => { if (!s) return null; const [h, m] = s.split(":").map(Number); return isNaN(h) || isNaN(m) ? null : h * 60 + m; };
  function fmt(s) { const t = toMin(s); if (t === null) return "—"; const h = Math.floor(t / 60), ap = h >= 12 ? "PM" : "AM"; return `${h % 12 || 12}:${String(t % 60).padStart(2, "0")} ${ap}`; }
  const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const slug = s => String(s).toLowerCase().replace(/['’]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  // → { state: open|soon|closed|engineering|temp_shut|private_event, label, hours, note }
  function status(a) {
    const hours = a.allDay ? "Open all day" : `${fmt(a.open)} – ${fmt(a.close)}`;
    if (a.status && a.status !== "open") {
      const label = a.status === "closed" && a.reopensAt ? `Reopening · ${a.reopensAt}` : LABELS[a.status] || "Closed";
      return { state: a.status, label, hours, note: a.note };
    }
    if (a.allDay) return { state: "open", label: "Open", hours, note: a.note };
    const o = toMin(a.open), c = toMin(a.close), now = ukMinutes();
    if (o === null || c === null) return { state: "open", label: "Open", hours, note: a.note };
    const inWin = c > o ? now >= o && now < c : now >= o || now < c;
    if (inWin) {
      const left = c > o ? c - now : now < c ? c - now : c + 1440 - now;
      return { state: "open", label: left <= 30 ? `Closing Soon · ${fmt(a.close)}` : `Open · until ${fmt(a.close)}`, hours, note: a.note };
    }
    if (c > o && now < o) return { state: "soon", label: `Opening Soon · ${fmt(a.open)}`, hours, note: a.note };
    return { state: "closed", label: "Closed for today", hours: hours + " · opens tomorrow", note: a.note };
  }

  // Tries icon.png → .webp → .jpg, then falls back to the first letter.
  function icon(a) {
    const box = document.createElement("div"); box.className = "att-ico";
    const base = a.icon || slug(a.name), exts = CFG.iconExt, img = new Image(); let i = 0;
    const direct = /^(https?:)?\/\//.test(base) || /\.(png|webp|jpe?g|gif|svg)$/i.test(base);
    const src = () => direct ? base : `${CFG.iconBase}${base}.${exts[i]}`;
    img.alt = ""; img.onerror = () => { i++; if (!direct && i < exts.length) img.src = src(); else { img.remove(); box.textContent = a.name.charAt(0); } };
    box.appendChild(img); img.src = src(); return box;
  }
  return { CFG, LABELS, load, status, icon, esc, slug, fmt };
})();
