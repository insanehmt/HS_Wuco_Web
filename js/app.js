/* 無口君 爐石戰場 排組對策站 — themed after hs-bg-web tier-list */

const esc = (s) => String(s ?? "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");

let ART = "https://art.hearthstonejson.com/v1/256x/";
// art oval if id resolved; onerror → show card name text inside the oval
function artOval(name, id, cls, size) {
  const n = esc(name);
  if (!id) return `<div class="card-oval ${cls} ${size}" title="${n}">${n}</div>`;
  return `<div class="card-oval ${cls} ${size}" title="${n}">`
       + `<img src="${ART}${esc(id)}.jpg" alt="${n}" loading="lazy"`
       + ` onerror="this.parentNode.textContent='${n.replace(/'/g,"\\'")}'"></div>`;
}

// rank (S+/S/A/B/C) → tier group used for sorting & badge class
const TIER_ORDER = ["S", "A", "B", "C"];
const tierOf = (rank) => {
  const r = String(rank).toUpperCase();
  if (r.startsWith("S")) return "S";
  if (r.startsWith("A")) return "A";
  if (r.startsWith("B")) return "B";
  return "C";
};
const TIER_LABEL = {
  S: "🔥 頂級 — 當前賽季最強",
  A: "💪 強勢 — 穩定上分",
  B: "⚖️ 中庸 — 看局勢",
  C: "🧪 實驗 — 娛樂/特定局",
};

// Chinese race string → race code (matches reference race-pill classes)
const RACE_MAP = [
  ["龍", "DRAGON"], ["納迦", "NAGA"], ["惡魔", "DEMON"], ["海盜", "PIRATE"],
  ["機械", "MECHANICAL"], ["魚人", "MURLOC"], ["野豬", "QUILBOAR"],
  ["不死", "UNDEAD"], ["亡靈", "UNDEAD"], ["元素", "ELEMENTAL"],
  ["野獸", "BEAST"], ["中立", "ALL"],
];
const RACE_ZH = {
  DRAGON:"龍族", NAGA:"納迦", DEMON:"惡魔", PIRATE:"海盜", MECHANICAL:"機械",
  MURLOC:"魚人", QUILBOAR:"野豬人", UNDEAD:"亡靈", ELEMENTAL:"元素",
  BEAST:"野獸", ALL:"中立",
};
function raceCodes(races) {
  const out = [];
  (races || []).forEach((zh) => {
    for (const [key, code] of RACE_MAP) {
      if (zh.includes(key) && !out.includes(code)) { out.push(code); break; }
    }
  });
  return out;
}

// difficulty 高/中/低 → easy/medium/hard
const diffKey = (d) => (d || "").includes("高") ? "hard" : (d || "").includes("低") ? "easy" : "medium";
const diffLabel = (d) => ({hard:"🔴 困難", medium:"🟡 中等", easy:"🟢 簡單"})[diffKey(d)];

function rowHTML(b, kind) {
  const tier = tierOf(b.rank);
  const races = raceCodes(b.races);
  const dk = diffKey(b.difficulty);
  const archived = b.currentVersion === false;
  const coreIds = b.coreIds || [], addonIds = b.addonIds || [];
  // card with art id → oval; otherwise text chip
  const coreChips = (b.coreCards || []).map((c, i) =>
    coreIds[i] ? artOval(c, coreIds[i], "core", "sm") : `<span class="card-chip core">${esc(c)}</span>`).join("");
  const addonChips = (b.supportCards || []).map((c, i) =>
    addonIds[i] ? artOval(c, addonIds[i], "addon", "xs") : `<span class="card-chip addon">${esc(c)}</span>`).join("");
  const racePills = races.map(r => `<span class="race-pill race-${r}">${esc(RACE_ZH[r]||r)}</span>`).join("");
  const qtag = b.question ? `<span class="q-tag">❓ ${esc(b.question)}</span>` : "";
  return `
  <div class="comp-row tier-${tier}-row ${archived ? "rotated" : ""}" data-id="${esc(b.id)}" data-kind="${kind}" tabindex="0">
    <div class="tier-badge tier-${tier} row-badge">${esc(b.rank)}</div>
    <span class="row-name">${esc(b.name)}</span>
    ${archived ? `<span class="archive-tag" title="使用非當前版本卡牌">🗃️ 歸檔</span>` : ""}
    ${qtag}
    ${racePills}
    <span class="diff-${dk}">${diffLabel(b.difficulty)}</span>
    <div class="vdiv"></div>
    ${coreChips}
    ${addonChips ? `<div class="vdiv"></div>${addonChips}` : ""}
    <span class="arrow">›</span>
  </div>`;
}

function renderTierGroups(el, items, kind) {
  let html = "";
  for (const tier of TIER_ORDER) {
    const group = items.filter(b => tierOf(b.rank) === tier);
    if (!group.length) continue;
    html += `<div class="tier-sep"><div class="tier-badge tier-${tier}">${tier}</div><div class="line"></div><span>${TIER_LABEL[tier]}</span></div>`;
    html += `<div class="comp-list">${group.map(b => rowHTML(b, kind)).join("")}</div>`;
  }
  el.innerHTML = html || `<p class="note">（無資料）</p>`;
}

function ovalSlot(name, id, cls) {
  const n = esc(name);
  const inner = id
    ? `<img src="${ART}${esc(id)}.jpg" alt="${n}" style="width:100%;height:100%;object-fit:cover;object-position:center 15%;border-radius:inherit" onerror="this.parentNode.textContent='${n.replace(/'/g,"\\'")}'">`
    : n;
  return `<div class="cslot"><div class="oval ${cls}">${inner}</div>`
       + `<div class="cname" style="font-size:.6rem;color:#b8a8d0;text-align:center;max-width:80px;line-height:1.2">${n}</div>`
       + (cls==="core"?'<div class="tag">CORE</div>':'') + `</div>`;
}

function openModal(b) {
  const tier = tierOf(b.rank);
  const races = raceCodes(b.races);
  const dk = diffKey(b.difficulty);
  const racePills = races.map(r => `<span class="race-pill race-${r}">${esc(RACE_ZH[r]||r)}</span>`).join("");
  const coreIds = b.coreIds || [], addonIds = b.addonIds || [];
  const core = (b.coreCards || []).map((c, i) => ovalSlot(c, coreIds[i], "core")).join("");
  const addon = (b.supportCards || []).map((c, i) => ovalSlot(c, addonIds[i], "addon")).join("");
  const tips = (b.tips || []).map(t => `<div class="tip-item"><span class="b">▸</span><span>${esc(t)}</span></div>`).join("");
  const box = document.getElementById("modalBox");
  box.innerHTML = `
    <div class="modal-header">
      <div class="modal-htop">
        <div class="tier-badge tier-${tier}" style="width:44px;height:44px;border-radius:10px;font-size:1.3rem">${esc(b.rank)}</div>
        <div>
          <div class="modal-title">${esc(b.name)}</div>
          <div style="display:flex;gap:6px;margin-top:4px;flex-wrap:wrap">
            ${racePills}<span class="diff-${dk}">${diffLabel(b.difficulty)}</span>
            <span style="font-size:.66rem;color:#6a5a7a;align-self:center">${esc(b.status||"")}</span>
          </div>
        </div>
        <button class="modal-close" id="modalClose">✕</button>
      </div>
    </div>
    <div class="modal-body">
      ${b.question ? `<div class="strategy-box" style="border-color:#205060;color:#9bd6e6;margin-bottom:4px">❓ ${esc(b.question)}${b.against?`<br><span style="color:#6a5a7a;font-size:.78rem">針對：${esc(b.against)}</span>`:""}</div>` : ""}
      <div class="section-title">🔑 核心卡牌 Core Cards</div>
      <div class="cslot-row">${core}</div>
      ${addon ? `<div class="section-title">🔧 搭配卡牌 Addon Cards</div><div class="cslot-row">${addon}</div>` : ""}
      <div class="section-title">📖 排組說明</div>
      <div class="strategy-box">${esc(b.logic)}</div>
      ${b.positioning ? `<div class="section-title">📍 站位</div><div class="strategy-box" style="font-family:monospace;font-size:.78rem">${esc(b.positioning)}</div>` : ""}
      ${tips ? `<div class="section-title">💡 注意事項 Tips</div>${tips}` : ""}
      ${b.source ? `<div class="yt-line">${b.episode?`<span class="ep-tag">${esc(b.episode)}</span>`:""}<a class="yt-btn" href="${esc(b.source)}" target="_blank" rel="noopener">看無口君影片</a></div>` : ""}
      ${b.notes ? `<div class="notes-line">${esc(b.notes)}</div>` : ""}
    </div>`;
  document.getElementById("modal").classList.add("open");
  document.getElementById("modalClose").addEventListener("click", closeModal);
}
function closeModal() { document.getElementById("modal").classList.remove("open"); }

let DATA = null;
function bindRows(el) {
  el.querySelectorAll(".comp-row").forEach(row => {
    const open = () => {
      const kind = row.dataset.kind, id = row.dataset.id;
      const pool = kind === "counter" ? DATA.counters : DATA.scalingBuilds;
      const b = (pool || []).find(x => x.id === id);
      if (b) openModal(b);
    };
    row.addEventListener("click", open);
    row.addEventListener("keydown", e => { if (e.key === "Enter") open(); });
  });
}

const RACE_ORDER = ["DRAGON","NAGA","DEMON","PIRATE","MECHANICAL","MURLOC","QUILBOAR","UNDEAD","ELEMENTAL","BEAST","ALL"];
const PANELS = {
  tier:    { dataKey:"scalingBuilds", kind:"tier",    listEl:"tierList",    tierRow:"tierFilterRow",    raceRow:"raceFilterRow",        countEl:"tierCount",    toggleEl:"showOldVersion", noun:"套組合", f:{tier:"全部",diff:"全部",race:"全部"} },
  counter: { dataKey:"counters",      kind:"counter", listEl:"counterList", tierRow:"counterFilterRow", raceRow:"counterRaceFilterRow", countEl:"counterCount", toggleEl:null,             noun:"個對策", f:{tier:"全部",diff:"全部",race:"全部"} },
};

function buildFilterBars(key) {
  const P = PANELS[key], items = DATA[P.dataKey] || [];
  const tiers = ["全部","S","A","B","C"];
  const diffs = [["全部","全部難度"],["easy","🟢 簡單"],["medium","🟡 中等"],["hard","🔴 困難"]];
  let th = "";
  tiers.forEach(t => th += `<button class="fbtn${P.f.tier===t?' on':''}" data-f="tier" data-v="${t}">${t==='全部'?'全部 Tier':'Tier '+t}</button>`);
  th += `<span class="vsep"></span>`;
  diffs.forEach(([v,label]) => th += `<button class="fbtn${P.f.diff===v?' on':''}" data-f="diff" data-v="${v}">${label}</button>`);
  document.getElementById(P.tierRow).innerHTML = th;

  // race pills (only races present in this panel's data; hide row if none)
  const present = [];
  items.forEach(b => raceCodes(b.races).forEach(r => { if(!present.includes(r)) present.push(r); }));
  const ordered = RACE_ORDER.filter(r => present.includes(r));
  const raceEl = document.getElementById(P.raceRow);
  if (ordered.length) {
    let rh = `<span class="flabel">族裔：</span><button class="fbtn${P.f.race==='全部'?' on':''}" data-f="race" data-v="全部">全部</button>`;
    ordered.forEach(r => rh += `<button class="race-pill race-${r} fpill${P.f.race===r?' on':''}" data-f="race" data-v="${r}">${esc(RACE_ZH[r]||r)}</button>`);
    raceEl.innerHTML = rh; raceEl.style.display = "";
  } else {
    raceEl.innerHTML = ""; raceEl.style.display = "none";
  }

  document.querySelectorAll(`#${P.tierRow} [data-f], #${P.raceRow} [data-f]`).forEach(btn => {
    btn.addEventListener("click", () => {
      const f = btn.dataset.f, v = btn.dataset.v;
      P.f[f] = (f==="race" && P.f.race===v && v!=="全部") ? "全部" : v;
      buildFilterBars(key);
      applyFilters(key);
    });
  });
}

function applyFilters(key) {
  const P = PANELS[key];
  let list = (DATA[P.dataKey] || []).slice();
  if (P.toggleEl) {
    const show = document.getElementById(P.toggleEl).checked;
    list = list.filter(b => show || b.currentVersion !== false);
  }
  if (P.f.tier !== "全部") list = list.filter(b => tierOf(b.rank) === P.f.tier);
  if (P.f.diff !== "全部") list = list.filter(b => diffKey(b.difficulty) === P.f.diff);
  if (P.f.race !== "全部") list = list.filter(b => raceCodes(b.races).includes(P.f.race));
  const el = document.getElementById(P.listEl);
  renderTierGroups(el, list, P.kind);
  bindRows(el);
  const total = (DATA[P.dataKey] || []).length;
  const hidden = P.toggleEl ? (DATA[P.dataKey] || []).filter(b => b.currentVersion === false).length : 0;
  document.getElementById(P.countEl).textContent =
    `${list.length} / ${total} ${P.noun}` + (hidden ? ` ｜ 🗃️ ${hidden} 組可顯示` : "");
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
  document.getElementById("modal").addEventListener("click", e => { if (e.target.id === "modal") closeModal(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });

  try {
    const res = await fetch("data/builds.json", { cache: "no-store" });
    DATA = await res.json();
  } catch (e) {
    document.getElementById("tierList").innerHTML =
      `<p class="note">⚠️ 無法載入資料：${esc(e.message)}（請用 HTTP 伺服器或 GitHub Pages 開啟，勿用 file://）</p>`;
    return;
  }

  const m = DATA.meta || {};
  if (m.artBase) ART = m.artBase;
  if (m.source) document.getElementById("sourceLink").href = m.source;
  document.getElementById("hsVersion").textContent = "v" + (m.version || m.hsVersion || "[?]");
  if (m.season) {
    const sb = document.getElementById("seasonBadge");
    sb.textContent = "S" + m.season;
    sb.style.display = "";
  }
  document.getElementById("lastUpdated").textContent = m.lastUpdated || "—";

  // counter page (with filters)
  buildFilterBars("counter");
  applyFilters("counter");

  // duo page
  const duo = DATA.duo || {};
  document.getElementById("duoIntro").textContent = "👥 " + (duo.intro || "");
  document.getElementById("duoList").innerHTML =
    (duo.tips || []).map(t => `<div class="duo-card"><h3>${esc(t.title)}</h3><p>${esc(t.detail)}</p></div>`).join("");

  // tier page + filters + version toggle
  document.getElementById("showOldVersion").addEventListener("change", () => applyFilters("tier"));
  buildFilterBars("tier");
  applyFilters("tier");
}

document.addEventListener("DOMContentLoaded", init);
