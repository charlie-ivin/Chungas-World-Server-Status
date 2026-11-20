// The navigation buttons from the old site (www.chungasworld.co.uk), shared by the home page,
// /admin and the attractions gallery. Edit the list here and every page updates.
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

  const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text) n.textContent = text; return n; };

  // Fills `root` with the old-site buttons. opts.newTab → open links in a new tab (used on /admin so a login isn't lost).
  function render(root, opts) {
    opts = opts || {};
    root.innerHTML = "";
    const link = (cls, label, path) => {
      const a = el("a", cls, label); a.href = OLD + path;
      if (opts.newTab) { a.target = "_blank"; a.rel = "noopener"; }
      return a;
    };
    const f = el("a", "cw-feature"); f.href = featured.href;
    if (opts.newTab) { f.target = "_blank"; f.rel = "noopener"; }
    f.appendChild(el("span", "cw-feature-tag", "NEW"));
    f.appendChild(el("span", "", featured.label));
    root.appendChild(f);
    groups.forEach(g => {
      const sec = el("section", "cw-group");
      sec.appendChild(el("h3", "cw-group-title pixel-heading", g.title.toUpperCase()));
      const grid = el("div", "cw-btns");
      g.links.forEach(([label, path]) => grid.appendChild(link("cw-btn", label, path)));
      sec.appendChild(grid); root.appendChild(sec);
    });
  }
  return { OLD, featured, groups, render };
})();
