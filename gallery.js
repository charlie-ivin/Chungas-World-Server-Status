// Photo gallery for the home page (new-home.html).
// Add photos by putting the image files in a /gallery/ folder in this repo and adding a line below.
// Remove a photo by deleting its line. Leave the list empty and the whole GALLERY section hides itself.
window.CWGallery = (() => {
  const photos = [
    // { src: "gallery/coasters-park.jpg", alt: "Coasters Park", caption: "Coasters Park" },
    // { src: "gallery/polmanter.png",     alt: "Polmanter",     caption: "Polmanter Recreation" },
  ];

  function render(root) {
    if (!root) return;
    const section = root.closest("section");
    root.innerHTML = "";
    if (!photos.length) { if (section) section.hidden = true; return; }
    if (section) section.hidden = false;
    photos.forEach(p => {
      const fig = document.createElement("figure");
      fig.className = "cw-photo";
      const img = document.createElement("img");
      img.src = p.src; img.alt = p.alt || p.caption || ""; img.loading = "lazy";
      img.onerror = () => fig.remove();            // a missing image never breaks the page
      fig.appendChild(img);
      if (p.caption) { const c = document.createElement("figcaption"); c.textContent = p.caption; fig.appendChild(c); }
      root.appendChild(fig);
    });
  }
  return { photos, render };
})();
