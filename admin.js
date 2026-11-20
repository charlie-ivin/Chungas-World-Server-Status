(() => {
  const CFG = CW_CONFIG, API = `https://api.github.com/repos/${CFG.githubOwner}/${CFG.githubRepo}`;
  let token = null, data = { attractions: [] };
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
      data = await CW.load(); render();
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
      <p><small>Embed on your website: <code>&lt;iframe src="https://YOUR-SITE/attractions?embed=1&amp;id=${CW.esc(a.id)}" style="border:0;width:100%;height:140px"&gt;&lt;/iframe&gt;</code></small></p>
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

  $("addBtn").onclick = () => {
    const n = prompt("Attraction name?"); if (!n) return;
    let id = CW.slug(n) || "attraction", k = 2; while (data.attractions.some(a => a.id === id)) id = CW.slug(n) + "-" + k++;
    data.attractions.push({ id, name: n, icon: CW.slug(n), description: "", status: "open", allDay: false, open: "10:00", close: "18:00", note: "", reopensAt: "" });
    render();
  };

  const b64 = s => btoa(String.fromCharCode(...new TextEncoder().encode(s)));
  $("saveBtn").onclick = async () => {
    $("saveBtn").disabled = true;
    try {
      const url = `${API}/contents/${CFG.dataPath}`, h = { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" };
      const cur = await fetch(`${url}?ref=${CFG.githubBranch}`, { headers: h }); const sha = cur.ok ? (await cur.json()).sha : undefined;
      const r = await fetch(url, { method: "PUT", headers: h, body: JSON.stringify({ message: "Update attractions via admin", content: b64(JSON.stringify(data, null, 2) + "\n"), branch: CFG.githubBranch, sha }) });
      const b = await r.json().catch(() => ({}));
      r.ok ? msg($("saveMsg"), "Saved! The site updates in about a minute.", true) : msg($("saveMsg"), `Save failed (${r.status}): ${b.message || ""}`);
    } catch (e) { msg($("saveMsg"), "Network error while saving."); }
    $("saveBtn").disabled = false;
  };
})();
