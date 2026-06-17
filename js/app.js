/* 無口君 爐石戰場 排組對策站 — 前端邏輯 (vanilla JS, GitHub Pages friendly) */

const RANK_COLORS = {
  "S+": "#f2c14e",
  "S":  "#ef8e5b",
  "A":  "#7dd87d",
  "B":  "#6db3f2",
  "C":  "#9aa7b4"
};

const ytId = (url) => {
  const m = String(url).match(/[?&]v=([^&]+)/);
  return m ? m[1] : null;
};

const esc = (s) => String(s ?? "")
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function statusClass(key) {
  return key === "active" ? "status-active"
       : key === "warning" ? "status-warning"
       : key === "nerf" ? "status-nerf" : "";
}

function chips(arr, cls) {
  return (arr || []).map(r => `<span class="chip ${cls}">${esc(r)}</span>`).join("");
}

function tipsList(tips) {
  if (!tips || !tips.length) return "";
  return `<ul class="tips">${tips.map(t => `<li>${esc(t)}</li>`).join("")}</ul>`;
}

function ytButton(url) {
  if (!url) return "";
  return `<a class="yt-btn" href="${esc(url)}" target="_blank" rel="noopener">看無口君影片</a>`;
}

function buildCard(b) {
  const color = RANK_COLORS[b.rank] || "#888";
  const dim = b.currentVersion === false ? " dim" : "";
  return `
  <article class="build-card${dim}" style="--rank-color:${color}" data-current="${b.currentVersion !== false}">
    <div class="bc-top">
      <div class="rank-badge">${esc(b.rank)}</div>
      <div class="bc-title">
        <div class="bc-id">${esc(b.id)}</div>
        <h3>${esc(b.name)}</h3>
      </div>
    </div>
    <div class="meta-row">
      <span class="chip ${statusClass(b.statusKey)}">${esc(b.status)}</span>
      <span class="chip diff">難度：${esc(b.difficulty)}</span>
      ${b.hsVersion ? `<span class="chip">版本：${esc(b.hsVersion)}</span>` : ""}
    </div>
    <div class="meta-row">${chips(b.races, "race")}</div>
    <div>
      <div class="section-label">核心卡牌</div>
      <div class="cards-line core">${esc((b.coreCards || []).join("、"))}</div>
    </div>
    ${b.supportCards && b.supportCards.length ? `
    <div>
      <div class="section-label">搭配卡牌</div>
      <div class="cards-line">${esc(b.supportCards.join("、"))}</div>
    </div>` : ""}
    <div>
      <div class="section-label">運作邏輯</div>
      <div class="logic">${esc(b.logic)}</div>
    </div>
    <div>
      <div class="section-label">Tips</div>
      ${tipsList(b.tips)}
    </div>
    ${ytButton(b.source)}
    ${b.notes ? `<div class="notes-line">${esc(b.notes)}</div>` : ""}
  </article>`;
}

function counterCard(c) {
  const color = RANK_COLORS[c.rank] || "#888";
  return `
  <article class="build-card" style="--rank-color:${color}">
    <div class="bc-top">
      <div class="rank-badge">${esc(c.rank)}</div>
      <div class="bc-title">
        <div class="bc-id">${esc(c.id)}</div>
        <h3>${esc(c.name)}</h3>
      </div>
    </div>
    ${c.question ? `<div class="q-line">❓ ${esc(c.question)}</div>` : ""}
    <div class="meta-row">
      <span class="chip ${statusClass(c.statusKey)}">${esc(c.status)}</span>
      <span class="chip diff">難度：${esc(c.difficulty)}</span>
    </div>
    ${c.against ? `<div><div class="section-label">針對</div><div class="cards-line">${esc(c.against)}</div></div>` : ""}
    <div>
      <div class="section-label">核心卡牌</div>
      <div class="cards-line core">${esc((c.coreCards || []).join("、"))}</div>
    </div>
    ${c.supportCards && c.supportCards.length ? `
    <div><div class="section-label">搭配卡牌</div><div class="cards-line">${esc(c.supportCards.join("、"))}</div></div>` : ""}
    <div>
      <div class="section-label">運作邏輯</div>
      <div class="logic">${esc(c.logic)}</div>
    </div>
    ${c.positioning ? `<div><div class="section-label">站位</div><div class="positioning">${esc(c.positioning)}</div></div>` : ""}
    <div><div class="section-label">Tips</div>${tipsList(c.tips)}</div>
    ${ytButton(c.source)}
    ${c.notes ? `<div class="notes-line">${esc(c.notes)}</div>` : ""}
  </article>`;
}

function duoCard(t) {
  return `<article class="duo-card"><h3>${esc(t.title)}</h3><p>${esc(t.detail)}</p></article>`;
}

function applyVersionFilter(show) {
  document.querySelectorAll("#tierList .build-card").forEach(el => {
    const current = el.getAttribute("data-current") === "true";
    el.style.display = (current || show) ? "" : "none";
  });
}

function setupTabs() {
  const tabs = document.querySelectorAll(".tab");
  tabs.forEach(tab => tab.addEventListener("click", () => {
    tabs.forEach(t => t.classList.remove("is-active"));
    tab.classList.add("is-active");
    document.querySelectorAll(".tabpanel").forEach(p => p.classList.remove("is-active"));
    document.getElementById("tab-" + tab.dataset.tab).classList.add("is-active");
  }));
}

async function init() {
  setupTabs();
  let data;
  try {
    const res = await fetch("data/builds.json", { cache: "no-store" });
    data = await res.json();
  } catch (e) {
    document.getElementById("tierList").innerHTML =
      `<p class="note">⚠️ 無法載入資料：${esc(e.message)}（請以 HTTP 伺服器或 GitHub Pages 開啟，勿直接 file:// 開啟）</p>`;
    return;
  }

  // meta
  const m = data.meta || {};
  if (m.source) { const a = document.getElementById("sourceLink"); a.href = m.source; }
  document.getElementById("hsVersion").textContent = m.hsVersion || "[?]";
  document.getElementById("lastUpdated").textContent = m.lastUpdated || "—";

  // tier
  document.getElementById("tierList").innerHTML =
    (data.scalingBuilds || []).map(buildCard).join("");
  const hasOld = (data.scalingBuilds || []).some(b => b.currentVersion === false);
  document.getElementById("tierVersionNote").textContent = hasOld
    ? "部分排組使用非當前版本卡牌，已預設隱藏。勾選右上方可顯示。搭配卡仍可用者會加註說明。"
    : "目前所有排組皆使用當前版本可用卡牌。";

  // counters
  document.getElementById("counterList").innerHTML =
    (data.counters || []).map(counterCard).join("");

  // duo
  const duo = data.duo || {};
  document.getElementById("duoIntro").textContent = duo.intro || "";
  document.getElementById("duoList").innerHTML =
    (duo.tips || []).map(duoCard).join("");

  // version toggle
  const toggle = document.getElementById("showOldVersion");
  toggle.addEventListener("change", () => applyVersionFilter(toggle.checked));
  applyVersionFilter(false);
}

document.addEventListener("DOMContentLoaded", init);
