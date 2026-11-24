(function () {
"use strict";
var $ = function (s, r) { return (r || document).querySelector(s); };
var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }

/* ================= icons ================= */
var PAW = '<ellipse cx="5.5" cy="10.5" rx="2.1" ry="2.7"/><ellipse cx="9.6" cy="5.8" rx="2.1" ry="2.7"/><ellipse cx="14.4" cy="5.8" rx="2.1" ry="2.7"/><ellipse cx="18.5" cy="10.5" rx="2.1" ry="2.7"/><path d="M12 11c3.2 0 6.2 3.6 6.2 6.5 0 2-1.6 2.8-3.1 2.8-1.3 0-1.8-.6-3.1-.6s-1.8.6-3.1.6c-1.5 0-3.1-.8-3.1-2.8C5.8 14.6 8.8 11 12 11z"/>';
var ICONS = {
  paw: PAW,
  home: '<path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  heart: '<path d="M20.8 5.6a5 5 0 0 0-7.1 0L12 7.3l-1.7-1.7a5 5 0 0 0-7.1 7.1L12 21.5l8.8-8.8a5 5 0 0 0 0-7.1z"/>',
  shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>',
  bowl: '<path d="M3 11h18a8 8 0 0 1-8 8h-2a8 8 0 0 1-8-8z"/><path d="M8 7c0-1.5 1-2 1-3M12 7c0-1.5 1-2 1-3M16 7c0-1.5 1-2 1-3"/>',
  drop: '<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/>',
  star: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
  pot: '<path d="M4 10h16v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"/><path d="M2 10h20M8 6V4M16 6V4"/>',
  grain: '<circle cx="8" cy="9" r="2.4"/><circle cx="16" cy="8" r="2.4"/><circle cx="12" cy="16" r="2.4"/>',
  scale: '<rect x="3" y="4" width="18" height="16" rx="4"/><path d="M8 10a4 4 0 0 1 8 0z"/><path d="M12 10l2-2"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
  check: '<path d="M5 12l5 5 9-10"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  note: '<path d="M5 3h10l4 4v14H5z"/><path d="M9 12h6M9 16h6"/>',
  undo: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>',
  pill: '<rect x="3" y="8.5" width="18" height="7" rx="3.5" transform="rotate(-35 12 12)"/><path d="M9.2 9.7l5.6 4.6" transform="rotate(0)"/>',
  chart: '<path d="M4 20V4M4 20h16"/><path d="M7 15l4-4 3 3 5-6"/>',
  sex: '<circle cx="12" cy="12" r="7"/><path d="M9 11h.01M15 11h.01M9.5 15c1.5 1 3.5 1 5 0"/>'
};
function ic(name, fill) { return '<span class="ic' + (fill ? ' fill' : '') + '"><svg viewBox="0 0 24 24" aria-hidden="true">' + (ICONS[name] || "") + '</svg></span>'; }
function hydrateIcons() {
  $$("[data-ic]").forEach(function (el) {
    var n = el.dataset.ic, fill = n === "paw";
    el.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true">' + (ICONS[n] || "") + '</svg>';
    if (fill) el.classList.add("fill");
  });
}
var FOOD_ICON = { "Wet food": "bowl", "Dry food": "grain", "Kitten milk": "drop", "Home cooked": "pot", "Treat": "star" };
var FOOD_TONE = { "Wet food": "peach", "Dry food": "lilac", "Kitten milk": "sky", "Home cooked": "peach", "Treat": "pink" };

/* ================= data layer =================
   Records live in one table: {id, kind, data}. kinds: profile, feed, weight, note, care.
   With Supabase configured (config.js) the data is shared. Without it, it stays in this browser. */
var CFG = window.KITTEN_CONFIG || {};
var SHARED = !!(CFG.supabaseUrl && CFG.supabaseKey);
var LS_KEY = "kitten-diary-local-v1";

function uid() {
  if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
  return "id-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}
var store = {
  load: function () {
    if (!SHARED) {
      try { return Promise.resolve(JSON.parse(localStorage.getItem(LS_KEY) || "[]")); }
      catch (e) { return Promise.resolve([]); }
    }
    return fetch(CFG.supabaseUrl + "/rest/v1/records?select=id,kind,data&limit=5000", { headers: sbHeaders() })
      .then(function (r) { if (!r.ok) throw new Error("load " + r.status); return r.json(); });
  },
  save: function (rec) {
    if (!SHARED) { var a = localLoad(); var i = a.findIndex(function (x) { return x.id === rec.id; }); if (i >= 0) a[i] = rec; else a.push(rec); return localSave(a); }
    return fetch(CFG.supabaseUrl + "/rest/v1/records?on_conflict=id", {
      method: "POST",
      headers: Object.assign({ "Content-Type": "application/json", Prefer: "resolution=merge-duplicates,return=minimal" }, sbHeaders()),
      body: JSON.stringify([rec])
    }).then(function (r) { if (!r.ok) throw new Error("save " + r.status); });
  },
  remove: function (id) {
    if (!SHARED) return localSave(localLoad().filter(function (x) { return x.id !== id; }));
    return fetch(CFG.supabaseUrl + "/rest/v1/records?id=eq." + encodeURIComponent(id), { method: "DELETE", headers: sbHeaders() })
      .then(function (r) { if (!r.ok) throw new Error("delete " + r.status); });
  }
};
function sbHeaders() { return { apikey: CFG.supabaseKey, Authorization: "Bearer " + (window.MIO_AUTH_TOKEN || CFG.supabaseKey) }; }
function localLoad() { try { return JSON.parse(localStorage.getItem(LS_KEY) || "[]"); } catch (e) { return []; } }
function localSave(a) { try { localStorage.setItem(LS_KEY, JSON.stringify(a)); return Promise.resolve(); } catch (e) { return Promise.reject(e); } }

/* ================= state ================= */
var TABS = ["feed", "health", "care", "profile"];
var FOODS = [["Wet food", 1], ["Dry food", 1], ["Kitten milk", 1], ["Home cooked", 1], ["Treat", 0]];
var S = {
  recs: [], loaded: false, loadError: false, tab: "feed", food: "Wet food", who: null,
  showAll: false, confirm: null, openDone: null, doneDate: "", profileDirty: false, feedDirty: false, busy: false
};
try { S.who = localStorage.getItem("kitten-who"); } catch (_) {}

function of(kind) { return S.recs.filter(function (r) { return r.kind === kind; }).map(function (r) { var o = Object.assign({}, r.data); o.id = r.id; return o; }); }
function profile() { var p = S.recs.filter(function (r) { return r.id === "profile"; })[0]; return p ? p.data : null; }
function feeds() { return of("feed").sort(function (a, b) { return b.ts - a.ts; }); }
function weights() { return of("weight").sort(function (a, b) { return a.date < b.date ? 1 : a.date > b.date ? -1 : 0; }); }
function stools() { return of("stool").sort(function (a, b) { return b.ts - a.ts; }); }
function notes() { return of("note").sort(function (a, b) { return a.date < b.date ? 1 : a.date > b.date ? -1 : 0; }); }
function careMap() { var m = {}; of("care").forEach(function (o) { m[o.id] = o; }); return m; }

/* ================= dates ================= */
function pad(n) { return n < 10 ? "0" + n : "" + n; }
function ymd(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
function parseYmd(s) { var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || ""); return m ? new Date(+m[1], +m[2] - 1, +m[3], 0, 0, 0) : null; }
function nowInput() { var d = new Date(); return ymd(d) + "T" + pad(d.getHours()) + ":" + pad(d.getMinutes()); }
function sameDay(a, b) { return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate(); }
function fmtTime(ts) { return new Date(ts).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true }).toUpperCase(); }
function fmtDate(d) { return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }); }
function dayLabel(ts) {
  var d = new Date(ts), t = new Date(), y = new Date(); y.setDate(t.getDate() - 1);
  if (sameDay(d, t)) return "Today"; if (sameDay(d, y)) return "Yesterday";
  return d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
}
function dur(ms) {
  var m = Math.max(1, Math.round(ms / 6e4)); if (m < 60) return m + " min";
  var h = Math.floor(m / 60), r = m % 60; return h + " h" + (r ? " " + r + " min" : "");
}
function age(dob) {
  var b = parseYmd(dob); if (!b) return null;
  var now = new Date(), m = (now.getFullYear() - b.getFullYear()) * 12 + now.getMonth() - b.getMonth();
  var a = new Date(b); a.setMonth(b.getMonth() + m);
  if (a > now) { m--; a = new Date(b); a.setMonth(b.getMonth() + m); }
  return { months: Math.max(0, m), days: Math.max(0, Math.floor((now - a) / 864e5)), weeks: Math.max(0, Math.floor((now - b) / (7 * 864e5))) };
}
function names() { var c = (profile() && profile().caretakers) || []; return [c[0] || "Me", c[1] || "Sister"]; }
function ageText(a) { return a.months + " mo " + a.days + " d"; }

/* ================= toast / writes ================= */
var toastT;
function toast(msg, err) {
  var t = $("#toast"); t.textContent = msg; t.className = "toast" + (err ? " err" : ""); t.hidden = false;
  clearTimeout(toastT); toastT = setTimeout(function () { t.hidden = true; }, 2600);
}
function write(op, apply, okMsg) {
  if (S.busy) return Promise.resolve(false);
  S.busy = true;
  var before = S.recs.slice();
  apply(); renderAll();
  return op().then(function () { toast(okMsg); S.busy = false; return true; }, function () {
    S.recs = before; S.busy = false; renderAll(); toast("Could not save. Check your internet and try again.", true); return false;
  });
}
function putLocal(rec) { var i = S.recs.findIndex(function (r) { return r.id === rec.id; }); if (i >= 0) S.recs[i] = rec; else S.recs.push(rec); }
function save(rec, msg) { return write(function () { return store.save(rec); }, function () { putLocal(rec); }, msg); }
function remove(id, msg) { return write(function () { return store.remove(id); }, function () { S.recs = S.recs.filter(function (r) { return r.id !== id; }); }, msg); }

/* ================= render ================= */
function renderBanner() {
  var h = "";
  if (S.loadError) h = '<div class="banner bad">Could not reach the database. Check your internet. Data will refresh by itself.</div>';
  else if (!SHARED) h = '<div class="banner">Demo mode. Data is saved only on this phone. Add your Supabase details in config.js to share it with your sister.</div>';
  else if (S.loaded && !profile()) h = '<div class="banner">Start in <a href="#profile">Profile</a>: add your kitten\'s name and birth date.</div>';
  $("#banner").innerHTML = h;
}
function renderHeader() {
  var p = profile();
  $("#catName").textContent = p && p.name ? p.name : (S.loaded ? "Your Persian kitten" : "Loading…");
  var a = p && p.dob ? age(p.dob) : null, bits = [];
  if (p && p.breed) bits.push(p.breed); if (p && p.sex) bits.push(p.sex); if (a) bits.push(ageText(a));
  $("#catMeta").textContent = bits.join(" · ");
  $("#hello").textContent = S.who ? "Hi " + S.who + "," : "Hello,";
  var w = weights()[0];
  $("#wPill").innerHTML = w ? '<b class="num">' + esc(w.kg) + ' kg</b><span>' + esc(fmtDate(parseYmd(w.date) || new Date())) + '</span>' : '<b>—</b><span>log weight</span>';
}
function renderChips() {
  var n = names(); if (n.indexOf(S.who) < 0) S.who = n[0];
  $("#foodChips").innerHTML = FOODS.map(function (f) { return '<button type="button" class="chip" data-act="food" data-v="' + esc(f[0]) + '" aria-pressed="' + (S.food === f[0]) + '">' + ic(FOOD_ICON[f[0]]) + esc(f[0]) + '</button>'; }).join("");
  $("#whoChips").innerHTML = n.map(function (x) { return '<button type="button" class="chip" data-act="who" data-v="' + esc(x) + '" aria-pressed="' + (S.who === x) + '">' + ic("user") + esc(x) + '</button>'; }).join("");
}
function whoCls(by) { return by === names()[0] ? "p1" : "p2"; }
function renderNext() {
  var el = $("#next");
  var wm = '<span class="wm ic fill"><svg viewBox="0 0 24 24" aria-hidden="true">' + PAW + '</svg></span>';
  if (!S.loaded) { el.innerHTML = wm + '<p class="k">Next meal</p><p class="big">…</p><p class="sub">Loading</p>'; return; }
  var last = null, f = feeds();
  for (var i = 0; i < f.length; i++) { if (f[i].meal !== false) { last = f[i]; break; } }
  var btn = '<button type="button" class="fednow" data-act="fednow"><span>Fed just now<small>' + esc(S.food) + ' · ' + esc(S.who || names()[0]) + '</small></span><span class="go">' + ic("paw", true) + '</span></button>';
  if (!last) { el.innerHTML = wm + '<p class="k">Next meal</p><p class="big">No meals yet</p><p class="sub">Tap below after the first meal and the next feeding time will show here.</p>' + btn; return; }
  var p = profile(), gapH = p && p.gapHours > 0 ? p.gapHours : 4;
  var next = last.ts + gapH * 36e5, diff = next - Date.now(), pill, cls = "";
  if (diff <= 0) { pill = dur(-diff) + " overdue"; cls = "late"; }
  else if (diff <= 36e5) { pill = "in " + dur(diff); cls = "soon"; }
  else pill = "in " + dur(diff);
  var when = fmtTime(next) + (sameDay(new Date(next), new Date()) ? "" : " (" + dayLabel(next) + ")");
  el.innerHTML = wm + '<p class="k">Next meal</p><p class="big">' + esc(when) + '</p>'
    + '<p><span class="pill ' + cls + '">' + ic("clock") + esc(pill) + '</span></p>'
    + btn
    + '<p class="last">Last: ' + esc(fmtTime(last.ts)) + ' (' + esc(dayLabel(last.ts)) + ') · ' + esc(last.food)
    + (last.amount ? ' · ' + esc(last.amount) : '') + ' · ' + esc(last.by) + '</p>';
}

/* ---- care schedule ---- */
function careItems(dob) {
  var b = parseYmd(dob); if (!b) return [];
  function w(n) { var d = new Date(b); d.setDate(d.getDate() + n * 7); return d; }
  function m(n) { var d = new Date(b); d.setMonth(d.getMonth() + n); return d; }
  return [
    { id: "v-fvrcp-1", kind: "v", label: "FVRCP (core vaccine) · dose 1", due: w(8), hint: "Protects against cat flu and panleukopenia" },
    { id: "v-fvrcp-2", kind: "v", label: "FVRCP · dose 2", due: w(12) },
    { id: "v-rabies-1", kind: "v", label: "Rabies · dose 1", due: w(12), hint: "Given only after 12 weeks of age" },
    { id: "v-fvrcp-3", kind: "v", label: "FVRCP · dose 3", due: w(16) },
    { id: "v-yearly", kind: "v", label: "Yearly booster · FVRCP + Rabies", due: m(12), hint: "Then every year" },
    { id: "d-8w", kind: "d", label: "Deworming · 8 weeks", due: w(8), hint: "Every 2 weeks until 12 weeks" },
    { id: "d-10w", kind: "d", label: "Deworming · 10 weeks", due: w(10) },
    { id: "d-12w", kind: "d", label: "Deworming · 12 weeks", due: w(12), hint: "Then monthly until 6 months" },
    { id: "d-4m", kind: "d", label: "Deworming · 4 months", due: m(4) },
    { id: "d-5m", kind: "d", label: "Deworming · 5 months", due: m(5) },
    { id: "d-6m", kind: "d", label: "Deworming · 6 months", due: m(6) },
    { id: "d-9m", kind: "d", label: "Deworming · 9 months", due: m(9), hint: "Then every 3 months" },
    { id: "d-12m", kind: "d", label: "Deworming · 12 months", due: m(12) }
  ];
}
function careStatus(it, cm) {
  var rec = cm["care-" + it.id];
  if (rec && rec.doneOn) { var d = parseYmd(rec.doneOn); return { cls: "done", txt: "Done", sub: d ? fmtDate(d) : "", done: true, sort: 1e12 + it.due.getTime() }; }
  var t = new Date(); t.setHours(0, 0, 0, 0);
  var diff = Math.round((it.due.getTime() - t.getTime()) / 864e5);
  if (diff < 0) return { cls: "late", txt: -diff + " d overdue", sub: "Due " + fmtDate(it.due), sort: it.due.getTime() };
  if (diff === 0) return { cls: "soon", txt: "Today", sub: "Due " + fmtDate(it.due), sort: it.due.getTime() };
  if (diff <= 7) return { cls: "soon", txt: "in " + diff + " d", sub: "Due " + fmtDate(it.due), sort: it.due.getTime() };
  return { cls: "later", txt: fmtDate(it.due), sub: "", sort: it.due.getTime() };
}
function careRow(it, st) {
  var tone = st.done ? "sky" : (it.kind === "v" ? "lilac" : "peach");
  var h = '<div class="care"><span class="ibub ' + tone + '">' + ic(st.done ? "check" : (it.kind === "v" ? "shield" : "pill")) + '</span><div><p class="nm">' + esc(it.label) + '</p>'
    + (st.sub ? '<p class="due">' + esc(st.sub) + '</p>' : '') + (it.hint && !st.done ? '<p class="hint">' + esc(it.hint) + '</p>' : '') + '</div>'
    + '<span class="st ' + st.cls + '">' + esc(st.txt) + '</span>';
  if (st.done) h += '<div class="act"><button class="btn ghost small" data-act="undo" data-v="' + it.id + '">' + ic("undo") + 'Undo</button></div>';
  else if (S.openDone === it.id) {
    h += '<div class="act"><label>Given on<input type="date" id="doneDate" value="' + esc(S.doneDate) + '" max="' + ymd(new Date()) + '"></label>'
      + '<button class="btn small" data-act="donesave" data-v="' + it.id + '">Save</button>'
      + '<button class="btn ghost small" data-act="donecancel">Cancel</button></div>';
  } else h += '<div class="act"><button class="btn ghost small" data-act="done" data-v="' + it.id + '">' + ic("check") + 'Mark done</button></div>';
  return h + '</div>';
}
function careRows() {
  var p = profile(); if (!p || !p.dob) return [];
  var cm = careMap();
  return careItems(p.dob).map(function (it) { return { it: it, st: careStatus(it, cm) }; }).sort(function (a, b) { return a.st.sort - b.st.sort; });
}
function renderCare() {
  var rows = careRows();
  if (!rows.length) {
    var msg = '<p class="empty">' + ic("calendar") + (S.loaded ? "Save the birth date in Profile and the dates will appear here." : "Loading…") + '</p>';
    $("#careVacc").innerHTML = msg; $("#careDew").innerHTML = msg; $("#glance").hidden = true;
    $("#progBar").style.width = "0%"; $("#progTxt").textContent = ""; return;
  }
  var doneN = rows.filter(function (r) { return r.st.done; }).length;
  $("#progBar").style.width = Math.round(doneN / rows.length * 100) + "%";
  $("#progTxt").textContent = doneN + " of " + rows.length + " done";
  $("#careVacc").innerHTML = rows.filter(function (r) { return r.it.kind === "v"; }).map(function (r) { return careRow(r.it, r.st); }).join("");
  $("#careDew").innerHTML = rows.filter(function (r) { return r.it.kind === "d"; }).map(function (r) { return careRow(r.it, r.st); }).join("");
  var open = rows.filter(function (r) { return !r.st.done; }).slice(0, 2), g = $("#glance");
  if (!open.length) { g.hidden = true; return; }
  g.hidden = false;
  g.innerHTML = '<div class="card-h"><h2>' + ic("shield") + 'Up next</h2><a href="#care">Full list</a></div>'
    + open.map(function (r) { return '<div class="care"><span class="ibub ' + (r.it.kind === "v" ? "lilac" : "peach") + '">' + ic(r.it.kind === "v" ? "shield" : "pill") + '</span><div><p class="nm">' + esc(r.it.label) + '</p>' + (r.st.sub ? '<p class="due">' + esc(r.st.sub) + '</p>' : '') + '</div><span class="st ' + r.st.cls + '">' + esc(r.st.txt) + '</span></div>'; }).join("");
}

/* ---- feed list ---- */
function delBlock(id) {
  if (S.confirm === id) return '<div class="confirm">Delete this? <button class="btn small" data-act="delyes" data-v="' + esc(id) + '">Yes</button><button class="btn ghost small" data-act="delno">No</button></div>';
  return "";
}
function renderFeedList() {
  var el = $("#feedList"), all = feeds();
  if (!S.loaded) { el.innerHTML = '<p class="empty">Loading…</p>'; $("#todaySum").innerHTML = ""; return; }
  var today = new Date(), tm = all.filter(function (f) { return f.meal !== false && sameDay(new Date(f.ts), today); });
  var cnt = {}; tm.forEach(function (f) { cnt[f.by] = (cnt[f.by] || 0) + 1; });
  $("#todaySum").innerHTML = '<span class="by p1" style="margin:0">Today ' + tm.length + (tm.length === 1 ? " meal" : " meals") + '</span>'
    + Object.keys(cnt).map(function (k) { return '<span class="by ' + whoCls(k) + '" style="margin:0">' + esc(k) + " " + cnt[k] + '</span>'; }).join("");
  if (!all.length) { el.innerHTML = '<p class="empty">' + ic("paw", true) + 'No meals logged yet. Tap "Fed just now" or add one above.</p>'; return; }
  var groups = [], idx = {};
  all.forEach(function (f) { var k = ymd(new Date(f.ts)); if (!(k in idx)) { idx[k] = groups.length; groups.push({ ts: f.ts, rows: [] }); } groups[idx[k]].rows.push(f); });
  var more = 0; if (!S.showAll && groups.length > 7) { more = groups.length - 7; groups = groups.slice(0, 7); }
  el.innerHTML = groups.map(function (g) {
    var meals = g.rows.filter(function (f) { return f.meal !== false; }).length;
    return '<div class="day"><div class="day-h"><span>' + esc(dayLabel(g.ts)) + '</span><span>' + meals + (meals === 1 ? " meal" : " meals") + '</span></div>'
      + g.rows.map(function (f) {
        return '<div class="item"><span class="ibub ' + (FOOD_TONE[f.food] || "peach") + '">' + ic(FOOD_ICON[f.food] || "bowl") + '</span><div class="what"><b class="t">' + esc(fmtTime(f.ts)) + '</b> · ' + esc(f.food)
          + (f.amount ? ' · ' + esc(f.amount) : '') + '<span class="by ' + whoCls(f.by) + '">' + esc(f.by) + '</span>'
          + (f.note ? '<small>' + esc(f.note) + '</small>' : '') + '</div>'
          + '<button class="x" data-act="del" data-v="' + esc(f.id) + '" aria-label="Delete meal">' + ic("trash") + '</button>' + delBlock(f.id) + '</div>';
      }).join("") + '</div>';
  }).join("") + (more ? '<button class="btn ghost" data-act="more">Show ' + more + ' older days</button>' : '');
}

/* ---- health ---- */
function renderHealth() {
  renderStools();
  var p = profile(), a = p && p.dob ? age(p.dob) : null, W = weights(), w = W[0];
  $("#ageCard").innerHTML = '<p class="k">About ' + esc((p && p.name) || "your kitten") + '</p>'
    + '<p class="agebig">' + (a ? esc(ageText(a)) : "Add birth date") + '</p>'
    + (a ? '<p class="muted num">' + a.weeks + ' weeks old · born ' + esc(fmtDate(parseYmd(p.dob))) + '</p>' : '<p class="muted">Save the date of birth in Profile.</p>')
    + '<div class="tiles">'
    + '<div class="tile t1"><b>' + (a ? a.months + " mo" : "—") + '</b><span>Age</span></div>'
    + '<div class="tile t2"><b>' + esc((p && p.sex) || "—") + '</b><span>Sex</span></div>'
    + '<div class="tile t3"><b class="num">' + (w ? esc(w.kg) + " kg" : "—") + '</b><span>Weight</span></div></div>';
  var el = $("#weightChart");
  if (!S.loaded) el.innerHTML = '<p class="empty">Loading…</p>';
  else if (W.length < 2) el.innerHTML = '<p class="empty">' + (W.length ? "Log one more weight to see the chart." : "No weight logged yet.") + '</p>';
  else el.innerHTML = chart(W.slice().reverse());
  $("#weightList").innerHTML = W.map(function (x, i) {
    var prev = W[i + 1], d = prev ? x.kg - prev.kg : null;
    return '<div class="item"><span class="ibub pink">' + ic("scale") + '</span><div class="what num"><b>' + esc(x.kg) + ' kg</b>'
      + (d !== null ? ' <span class="muted">(' + (d >= 0 ? "+" : "−") + Math.abs(d).toFixed(2) + ')</span>' : '') + '<small>' + esc(fmtDate(parseYmd(x.date) || new Date())) + '</small></div>'
      + '<button class="x" data-act="del" data-v="' + esc(x.id) + '" aria-label="Delete weight">' + ic("trash") + '</button>' + delBlock(x.id) + '</div>';
  }).join("");
  $("#noteList").innerHTML = notes().map(function (x) {
    return '<div class="item"><span class="ibub sky">' + ic("note") + '</span><div class="what">' + esc(x.text) + '<small>' + esc(fmtDate(parseYmd(x.date) || new Date())) + '</small></div>'
      + '<button class="x" data-act="del" data-v="' + esc(x.id) + '" aria-label="Delete note">' + ic("trash") + '</button>' + delBlock(x.id) + '</div>';
  }).join("");
}

function renderStools() {
  var el = $("#stoolList"), all = stools();
  if (!el) return;
  if (!S.loaded) { el.innerHTML = '<p class="empty">Loading…</p>'; return; }
  if (!all.length) { el.innerHTML = '<p class="empty">No stool records yet.</p>'; return; }
  el.innerHTML = all.slice(0, 20).map(function (x) {
    return '<div class="item"><span class="ibub lilac">' + ic("paw") + '</span><div class="what"><b class="t">' + esc(fmtDate(new Date(x.ts))) + ' · ' + esc(fmtTime(x.ts)) + '</b><small>' + esc(x.consistency) + ' · ' + esc(x.color) + (x.note ? ' · ' + esc(x.note) : '') + '</small><small>Logged by ' + esc(x.by || "Caregiver") + '</small></div><button class="x" data-act="del" data-v="' + esc(x.id) + '" aria-label="Delete stool record">' + ic("trash") + '</button>' + delBlock(x.id) + '</div>';
  }).join("");
}
\nfunction chart(pts) {
  var W = 340, H = 170, L = 40, R = 16, T = 26, B = 28;
  var xs = pts.map(function (p) { return (parseYmd(p.date) || new Date()).getTime(); });
  var ys = pts.map(function (p) { return +p.kg; });
  var x0 = Math.min.apply(null, xs), x1 = Math.max.apply(null, xs), y0 = Math.min.apply(null, ys), y1 = Math.max.apply(null, ys);
  var padY = Math.max(0.1, (y1 - y0) * 0.2); y0 = Math.max(0, y0 - padY); y1 = y1 + padY;
  function X(v) { return x1 === x0 ? (L + W - R) / 2 : L + (v - x0) / (x1 - x0) * (W - L - R); }
  function Y(v) { return T + (1 - (v - y0) / (y1 - y0)) * (H - T - B); }
  var s = '<svg class="chart" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Weight chart">';
  [0, 0.5, 1].forEach(function (f) {
    var v = y0 + (y1 - y0) * f, y = Y(v);
    s += '<line class="ch-grid" x1="' + L + '" x2="' + (W - R) + '" y1="' + y.toFixed(1) + '" y2="' + y.toFixed(1) + '"/>'
      + '<text class="ch-t" x="' + (L - 6) + '" y="' + (y + 4).toFixed(1) + '" text-anchor="end">' + v.toFixed(2) + '</text>';
  });
  s += '<polyline class="ch-line" points="' + pts.map(function (p, i) { return X(xs[i]).toFixed(1) + "," + Y(ys[i]).toFixed(1); }).join(" ") + '"/>';
  pts.forEach(function (p, i) {
    var last = i === pts.length - 1;
    s += '<circle class="' + (last ? "ch-end" : "ch-dot") + '" cx="' + X(xs[i]).toFixed(1) + '" cy="' + Y(ys[i]).toFixed(1) + '" r="' + (last ? 5 : 3.5) + '"/>';
  });
  s += '<text class="ch-v" x="' + Math.min(X(xs[xs.length - 1]), W - R).toFixed(1) + '" y="' + (Y(ys[ys.length - 1]) - 10).toFixed(1) + '" text-anchor="end">' + ys[ys.length - 1] + ' kg</text>';
  var o = { day: "numeric", month: "short" };
  s += '<text class="ch-t" x="' + L + '" y="' + (H - 8) + '" text-anchor="start">' + new Date(x0).toLocaleDateString("en-IN", o) + '</text>'
    + '<text class="ch-t" x="' + (W - R) + '" y="' + (H - 8) + '" text-anchor="end">' + new Date(x1).toLocaleDateString("en-IN", o) + '</text></svg>';
  return s;
}

function fillProfile() {
  if (S.profileDirty) return; var p = profile(); if (!p) return;
  $("#pName").value = p.name || ""; $("#pBreed").value = p.breed || "Persian"; $("#pSex").value = p.sex || "Male";
  $("#pDob").value = p.dob || ""; $("#pC1").value = (p.caretakers && p.caretakers[0]) || ""; $("#pC2").value = (p.caretakers && p.caretakers[1]) || "";
  $("#pGap").value = p.gapHours || 4;
}
function renderAll() { renderBanner(); renderHeader(); renderChips(); renderNext(); renderCare(); renderFeedList(); renderHealth(); }

/* ================= tabs ================= */
function setTab() {
  var h = (location.hash || "").slice(1); S.tab = TABS.indexOf(h) >= 0 ? h : "feed";
  TABS.forEach(function (t) { $("#v-" + t).hidden = t !== S.tab; });
  $$(".tab").forEach(function (a) { if (a.dataset.tab === S.tab) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current"); });
  if (S.tab === "feed" && !S.feedDirty) $("#fTime").value = nowInput();
  if (S.tab === "health") { if (!$("#sTime").value) $("#sTime").value = nowInput(); if (!$("#wDate").value) $("#wDate").value = ymd(new Date()); if (!$("#nDate").value) $("#nDate").value = ymd(new Date()); }
  window.scrollTo(0, 0);
}
window.addEventListener("hashchange", setTab);

/* ================= events ================= */
document.addEventListener("click", function (e) {
  var b = e.target.closest("[data-act]"); if (!b) return;
  var a = b.dataset.act, v = b.dataset.v;
  if (a === "food") { S.food = v; renderChips(); renderNext(); }
  else if (a === "who") { S.who = v; try { localStorage.setItem("kitten-who", v); } catch (_) {} renderChips(); renderNext(); renderHeader(); }
  else if (a === "fednow") {
    var meal = FOODS.filter(function (f) { return f[0] === S.food; })[0][1] === 1;
    save({ id: uid(), kind: "feed", data: { ts: Date.now(), food: S.food, amount: "", by: S.who || names()[0], note: "", meal: meal } }, "Logged: " + S.food + " by " + (S.who || names()[0]));
  }
  else if (a === "del") { S.confirm = v; renderFeedList(); renderHealth(); }
  else if (a === "delno") { S.confirm = null; renderFeedList(); renderHealth(); }
  else if (a === "delyes") { S.confirm = null; remove(v, "Deleted"); }
  else if (a === "more") { S.showAll = true; renderFeedList(); }
  else if (a === "done") { S.openDone = v; S.doneDate = ymd(new Date()); renderCare(); }
  else if (a === "donecancel") { S.openDone = null; renderCare(); }
  else if (a === "donesave") { var d = S.doneDate || ymd(new Date()); S.openDone = null; save({ id: "care-" + v, kind: "care", data: { doneOn: d } }, "Saved"); }
  else if (a === "undo") { remove("care-" + v, "Undone"); }
});
document.addEventListener("input", function (e) {
  var t = e.target;
  if (t.id === "doneDate") S.doneDate = t.value;
  if (t.closest("#profileForm")) S.profileDirty = true;
  if (t.closest("#feedForm")) S.feedDirty = true;
});
$("#feedForm").addEventListener("submit", function (e) {
  e.preventDefault();
  var ts = new Date($("#fTime").value).getTime(); if (!isFinite(ts)) { toast("Enter a valid time", true); return; }
  var meal = FOODS.filter(function (f) { return f[0] === S.food; })[0][1] === 1;
  var rec = { id: uid(), kind: "feed", data: { ts: ts, food: S.food, amount: $("#fAmount").value.trim(), by: S.who || names()[0], note: $("#fNote").value.trim(), meal: meal } };
  save(rec, "Meal saved").then(function (ok) { if (ok) { $("#fAmount").value = ""; $("#fNote").value = ""; S.feedDirty = false; $("#fTime").value = nowInput(); } });
});

$("#stoolForm").addEventListener("submit", function (e) {
  e.preventDefault();
  var ts = new Date($("#sTime").value).getTime();
  if (!isFinite(ts) || ts > Date.now()) { toast("Enter a valid past date and time", true); return; }
  var rec = { id: uid(), kind: "stool", data: { ts: ts, consistency: $("#sConsistency").value, color: $("#sColor").value, note: $("#sNote").value.trim(), by: S.who || names()[0] } };
  save(rec, "Stool record saved").then(function (ok) { if (ok) { $("#sNote").value = ""; $("#sTime").value = nowInput(); } });
});
\n$("#weightForm").addEventListener("submit", function (e) {
  e.preventDefault();
  var kg = parseFloat($("#wKg").value), d = $("#wDate").value;
  if (!(kg > 0) || !parseYmd(d)) { toast("Enter a valid weight and date", true); return; }
  save({ id: uid(), kind: "weight", data: { date: d, kg: Math.round(kg * 100) / 100 } }, "Weight saved").then(function (ok) { if (ok) $("#wKg").value = ""; });
});
$("#noteForm").addEventListener("submit", function (e) {
  e.preventDefault();
  var d = $("#nDate").value, t = $("#nText").value.trim();
  if (!parseYmd(d) || !t) { toast("Enter a date and a note", true); return; }
  save({ id: uid(), kind: "note", data: { date: d, text: t } }, "Note saved").then(function (ok) { if (ok) $("#nText").value = ""; });
});
$("#profileForm").addEventListener("submit", function (e) {
  e.preventDefault();
  var dob = $("#pDob").value, b = parseYmd(dob); if (!b || b > new Date()) { toast("Enter a valid birth date", true); return; }
  var gap = parseFloat($("#pGap").value); if (!(gap > 0)) gap = 4;
  var rec = { id: "profile", kind: "profile", data: { name: $("#pName").value.trim(), breed: $("#pBreed").value.trim() || "Persian", sex: $("#pSex").value, dob: dob, caretakers: [$("#pC1").value.trim() || "Me", $("#pC2").value.trim() || "Sister"], gapHours: gap } };
  save(rec, "Saved").then(function (ok) { if (ok) { S.profileDirty = false; location.hash = "#feed"; } });
});

/* ================= boot ================= */
function refresh() {
  if (S.busy) return;
  store.load().then(function (rows) {
    if (S.busy) return;
    S.recs = rows; S.loaded = true; S.loadError = false; fillProfile(); renderAll();
  }, function () { S.loadError = true; renderBanner(); });
}
hydrateIcons(); setTab(); renderAll();
Promise.resolve(window.MIO_AUTH_READY).then(function () { $("#appShell").hidden = false; $("#loginPanel").hidden = true; refresh(); setInterval(refresh, 15000); }).catch(function (e) { console.error(e); });
setInterval(function () { renderNext(); renderHeader(); }, 30000);
document.addEventListener("visibilitychange", function () { if (!document.hidden) refresh(); });
})();
