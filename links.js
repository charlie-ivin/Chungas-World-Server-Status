// The "EXPLORE CHUNGAS WORLD" buttons. Shared by the home page and /admin.
// The live list is stored in data.json under "links" and edited on the /admin page.
// The list below is only the FALLBACK, used when data.json has no "links" yet (or fails to load).
window.CWLinks = (() => {
  const OLD = "https://www.chungasworld.co.uk";

  const featured = {
    label: "From Real Life to Redstone: Read the Story Behind Chungas World's Polmanter Recreation",
    href: OLD + "/blog/the-story-behind-the-polmanter-recreation"
  };

  const groups = [
    { title: "Home", links: [
      ["Chungas World Home", "/home"]
    ] },
    { title: "Parks & Attractions", links: [
      ["Coasters Park", "/coasters-park"],
      ["Adventure Park", "/adventure-park"],
      ["Sky Studio Centre", "/sky-studio-filming-centre"],
      ["Minecraft Polmanter Recreation", "/polmanter-recreation"],
      ["The Eclipse Club", "/the-eclipse-club"],
      ["Tours Attraction", "/tours-attraction"],
      ["Minecraft Karens Diner", "/m-karens-diner"],
      ["Minecraft Tretho Lounge", "/tretho-lounge"],
      ["Minecraft PDC Darts", "/minecraft-pdc-darts"],
      ["Fun.co Games Hub", "/fun-co-games-hub"],
      ["Chungas Building Hire", "/building-hire"]
    ] },
    { title: "Education", links: [
      ["Main School", "/education/main-school"],
      ["Redstone College", "/education/redstone-college"]
    ] },
    { title: "Info & Community", links: [
      ["World Access / How To Join", "/info/world-access"],
      ["About Chungas World", "/info/about-chungas-world"],
      ["Chungas World Jobs", "/info/jobs-at-chungas-world"],
      ["Chungas World News", "/info/news-hub"],
      ["Chungas World Blogs", "/blog"],
      ["Frequently Asked Questions", "/info/faq-hub"],
      ["World Map", "/world-map"],
      ["Meet The Team", "/meet-the-team"]
    ] },
    { title: "Online Info", links: [
      ["CW Discord Access & Parents Info", "/online-info/discord-access"],
      ["Server Outages", "/online-info/server-outages"],
      ["Website Copyright", "/online-info/website-copyright"]
    ] },
    { title: "Government", links: [
      ["Planning Request", "/gov/planning-request"],
      ["Building Materials", "/gov/building-materials"],
      ["Chungas World EBill", "/gov/ebill"],
      ["World Fire Tests", "/gov/fire-tests"],
      ["GOVERNMENT PARK OFFICE", "/gov/gov-park"]
    ] },
    { title: "Contact & Policies", links: [
      ["Contact Us", "/contact"],
      ["All Chungas World Policies", "/policies"]
    ] }
  ];

  const clone = o => JSON.parse(JSON.stringify(o));

  // The original list in the shape stored in data.json.
  const defaults = () => ({
    featured: clone(featured),
    groups: groups.map(g => ({ title: g.title, links: g.links.map(([label, path]) => ({ label, path })) }))
  });

  // Turns whatever is in data.json into a safe, complete list (falls back to the original if there's nothing usable).
  function normalize(c) {
    if (!c || !Array.isArray(c.groups)) return defaults();
    const f = "featured" in c ? c.featured : defaults().featured;
    return {
      featured: f && typeof f === "object" ? { label: String(f.label || ""), href: String(f.href || "") } : null,
      groups: c.groups.map(g => ({
        title: String((g && g.title) || ""),
        links: Array.isArray(g && g.links) ? g.links.map(l => ({ label: String((l && l.label) || ""), path: String((l && l.path) || "") })) : []
      }))
    };
  }

  // "/coasters-park" → the old site; "https://…" is used as written.
  const hrefFor = p => {
    p = String(p || "").trim();
    if (/^https?:\/\//i.test(p)) return p;
    return OLD + (p.startsWith("/") ? "" : "/") + p;
  };

  const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text) n.textContent = text; return n; };

  // Fills `root` with the buttons. opts.links → the list from data.json (omit to use the original list).
  // opts.newTab → open links in a new tab (used on /admin so a login isn't lost).
  function render(root, opts) {
    opts = opts || {};
    const cfg = normalize(opts.links);
    root.innerHTML = "";
    const tab = a => { if (opts.newTab) { a.target = "_blank"; a.rel = "noopener"; } return a; };
    if (cfg.featured && cfg.featured.label) {
      const f = tab(el("a", "cw-feature")); f.href = hrefFor(cfg.featured.href);
      f.appendChild(el("span", "cw-feature-tag", "NEW"));
      f.appendChild(el("span", "", cfg.featured.label));
      root.appendChild(f);
    }
    cfg.groups.forEach(g => {
      const links = g.links.filter(l => l.label.trim());
      if (!links.length) return;                       // empty sections are hidden
      const sec = el("section", "cw-group");
      if (g.title.trim()) sec.appendChild(el("h3", "cw-group-title pixel-heading", g.title.toUpperCase()));
      const grid = el("div", "cw-btns");
      links.forEach(l => { const a = tab(el("a", "cw-btn", l.label)); a.href = hrefFor(l.path); grid.appendChild(a); });
      sec.appendChild(grid); root.appendChild(sec);
    });
  }
  return { OLD, defaults, normalize, hrefFor, render };
})();
