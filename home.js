// Shared by index.html and admin.html: defaults + YouTube link parsing for the home page.
window.CWHome = (() => {
  const defaults = {
    title: "Welcome to the\nChungas World Website",
    subtitle: "\"Chungas World is a ultimate destination for all things fun, interactive, and engaging! Dive into a world of games, stories, and more. Join a community of fans and explore endless entertainment!\"",
    video: "background.mp4",   // a video file in this repo (plays directly, no YouTube). Empty = use the YouTube link instead
    youtube: "",   // any YouTube link (or the 11-character video id)
    dim: 25        // % darkening over the video so the text stays readable
  };
  const withDefaults = h => Object.assign({}, defaults, h || {});
  function ytId(s) {
    s = String(s || "").trim();
    if (/^[\w-]{11}$/.test(s)) return s;
    const m = s.match(/(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/|v\/))([\w-]{11})/);
    return m ? m[1] : "";
  }
  return { defaults, withDefaults, ytId };
})();
