import { auth, db } from "./firebase.js";

// Auth
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

// Firestore
import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  limit,
  deleteDoc,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

/* ===================== CONFIG ===================== */
const ADMIN_CODE = "ARGA123";

const SUPERADMIN_USER = "superadmin";
const SUPERADMIN_PASS = "super123";

// Firebase Admin Master (akun firebase yang dipakai superadmin untuk akses)
const FIREBASE_MASTER_EMAIL = "adminmaster@gudang.com";
const FIREBASE_MASTER_PASS = "adminmaster123";

const WAREHOUSE_LABEL = {
  gedung_ab: "Gedung A&B",
  gedung_cdm: "Gedung CDM",
  gedung_thamrin: "Gedung Thamrin",
};

const LOW_STOCK_LIMIT = 5;

/* ===================== HELPERS ===================== */
const el = (id) => document.getElementById(id);

function safeText(node, text) {
  if (!node) return;
  node.textContent = text;
}
function show(node) {
  if (!node) return;
  node.style.display = "block";
}
function hide(node) {
  if (!node) return;
  node.style.display = "none";
}
function todayStr() {
  return new Date().toISOString().slice(0, 10);
}
function escapeHtml(s) {
  return String(s || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
function safeDocId(name) {
  return String(name || "")
    .trim()
    .replaceAll("/", "-")
    .replaceAll("\\", "-")
    .replaceAll("#", "")
    .replaceAll("?", "")
    .replaceAll("*", "")
    .slice(0, 140);
}

/* ===================== MODAL HELPERS ===================== */
function openModal(modal) {
  if (!modal) return;
  modal.classList.add("show");
}
function closeModal(modal) {
  if (!modal) return;
  modal.classList.remove("show");
}

/* ===================== AUTH DOM ===================== */
const authScreen = el("authScreen");
const tabLogin = el("tabLogin");
const tabRegister = el("tabRegister");
const registerExtra = el("registerExtra");

const regName = el("regName");
const regWarehouse = el("regWarehouse");
const regRole = el("regRole");
const adminCodeWrap = el("adminCodeWrap");
const regAdminCode = el("regAdminCode");

const authUser = el("authUser");
const authPass = el("authPass");
const authPass2 = el("authPass2");

const confirmWrap = el("confirmWrap");
const togglePassBtn = el("togglePassBtn");
const authActionBtn = el("authActionBtn");
const authHint = el("authHint");
const resetAccountBtn = el("resetAccountBtn");

const superAdminWarehouseWrap = el("superAdminWarehouseWrap");
const superAdminWarehouse = el("superAdminWarehouse");

let authMode = "login";

/* ===================== TOP UI ===================== */
const logoutBtn = el("logoutBtn");
const avatar = el("avatar");
const userName = el("userName");
const warehouseName = el("warehouseName");

const lowStockBadge = el("lowStockBadge");
const lowStockBadgeCount = el("lowStockBadgeCount");

// ✅ THEME BUTTON (harus ada di HTML)
const themeBtn = el("themeBtn");

/* ✅ MODAL LOGOUT */
const modalLogout = el("modalLogout");
const cancelLogoutBtn = el("cancelLogoutBtn");
const confirmLogoutBtn = el("confirmLogoutBtn");

/* ===================== PAGES / NAV ===================== */
const pages = {
  home: el("page-home"),
  out: el("page-out"),
  in: el("page-in"),
  opname: el("page-opname"),
  tools: el("page-tools"),
};

const navBtns = [...document.querySelectorAll(".nav-btn")];
const navAdminOnly = [...document.querySelectorAll(".nav-btn.admin-only")];

/* ===================== HOME ===================== */
const lowStockList = el("lowStockList");
const lowStockHint = el("lowStockHint");
const txList = el("txList");
const totalItems = el("totalItems");
const totalStock = el("totalStock");
const todayTx = el("todayTx");

const toggleSummaryBtn = el("toggleSummaryBtn");
const toggleLowStockBtn = el("toggleLowStockBtn");
const toggleTxBtn = el("toggleTxBtn");

const summaryBox = el("summaryBox");
const lowStockBox = el("lowStockBox");
const txBox = el("txBox");

const txFilterDate = el("txFilterDate");
const exportTxTextBtn = el("exportTxTextBtn");
const txTextOutput = el("txTextOutput");
const copyTxTextBtn = el("copyTxTextBtn");
const txFilterHint = el("txFilterHint");

/* ===================== OUT ===================== */
const outItemSelect = el("outItemSelect");
const outCurrentStock = el("outCurrentStock");
const outReceiver = el("outReceiver");
const outQty = el("outQty");
const outNote = el("outNote");
const outRemainingStock = el("outRemainingStock");
const outHint = el("outHint");
const outSubmit = el("outSubmit");
const outClear = el("outClear");

/* ===================== IN ===================== */
const inItemSelect = el("inItemSelect");
const inCurrentStock = el("inCurrentStock");
const inQty = el("inQty");
const inDate = el("inDate");
const inNote = el("inNote");
const inAfterStock = el("inAfterStock");
const inHint = el("inHint");
const inSubmit = el("inSubmit");
const inClear = el("inClear");

/* ===================== OPNAME ===================== */
const opnameSearch = el("opnameSearch");
const opnameFilter = el("opnameFilter");
const opnameTableBody = el("opnameTableBody");
const opnameSummary = el("opnameSummary");

/* ===================== TOOLS ===================== */
const openAllDrawersBtn = el("openAllDrawersBtn");
const closeAllDrawersBtn = el("closeAllDrawersBtn");

const refreshAdminPanelBtn = el("refreshAdminPanelBtn");
const onlineList = el("onlineList");
const adminPanelHint = el("adminPanelHint");

const importFile = el("importFile");
const importMode = el("importMode");
const importBtn = el("importBtn");
const importHint = el("importHint");

const manualName = el("manualName");
const manualQty = el("manualQty");
const manualUnit = el("manualUnit");
const manualNote = el("manualNote");
const manualAddBtn = el("manualAddBtn");
const manualAddHint = el("manualAddHint");

const exportOutput = el("exportOutput");
const exportHint = el("exportHint");
const exportStockBtn = el("exportStockBtn");
const exportTxBtn = el("exportTxBtn");
const copyExportBtn = el("copyExportBtn");
const clearExportBtn = el("clearExportBtn");

const waReportDate = el("waReportDate");
const waReportNote = el("waReportNote");
const waReportOutput = el("waReportOutput");
const waReportHint = el("waReportHint");
const generateWaBtn = el("generateWaBtn");
const copyWaBtn = el("copyWaBtn");

const resetAllBtn = el("resetAllBtn");
const resetAllHint = el("resetAllHint");

/* ===================== STATE ===================== */
let currentUser = null;
let userProfile = null;
let superAdminMode = false;

let stockByKey = {};
let txLatest = [];
let presenceTimer = null;

/* ===================== PATH ===================== */
function warehouseId() {
  if (superAdminMode) return localStorage.getItem("superadmin_wh") || "gedung_ab";
  return userProfile?.warehouseId || "gedung_ab";
}

function userDoc(uid = currentUser?.uid) {
  return doc(db, "users", uid);
}
function colItems() {
  return collection(db, "warehouses", warehouseId(), "items");
}
function itemDocByKey(itemKey) {
  return doc(db, "warehouses", warehouseId(), "items", itemKey);
}
function colTx() {
  return collection(db, "warehouses", warehouseId(), "transactions");
}
function colPresence() {
  return collection(db, "warehouses", warehouseId(), "presence");
}
function presenceDoc(uid = currentUser?.uid) {
  return doc(db, "warehouses", warehouseId(), "presence", uid);
}

/* =========================
   THEME TOGGLE (SAFE)
========================= */
function initThemeToggle() {
  if (!themeBtn) return;

  function applyTheme(mode) {
    document.body.setAttribute("data-theme", mode);
    localStorage.setItem("theme_mode", mode);
    themeBtn.textContent = mode === "light" ? "☀️" : "🌙";
  }

  applyTheme(localStorage.getItem("theme_mode") || "dark");

  themeBtn.addEventListener("click", () => {
    const now = document.body.getAttribute("data-theme") || "dark";
    applyTheme(now === "dark" ? "light" : "dark");
  });
}

/* ===================== BOOT ===================== */
boot();

function boot() {
  forceSingleActivePage("home");
  initThemeToggle();
  bindEvents();
  initToolDrawers();
  setDefaultDates();
  setAuthMode("login");
  initHomeCollapseDefaults();

  // auto superadmin session
  if (localStorage.getItem("superadmin_mode") === "1") {
    superAdminMode = true;
    hide(authScreen);
    loginFirebaseMaster();
  }

  onAuthStateChanged(auth, async (u) => {
    if (u) {
      currentUser = u;

      if (!superAdminMode) {
        await loadUserProfile();
      }

      hide(authScreen);
      setUserUI();
      applyRoleLock();

      startPresence();

      await reloadAllFromDB();
      refreshDropdowns();
      renderAll();
      renderOpnameTable();

      updateLowStockBadge();
      showLowStockAlertOnce();

      forceSingleActivePage("home");
    } else {
      currentUser = null;
      userProfile = null;
      stopPresence();

      if (!superAdminMode) show(authScreen);
      forceSingleActivePage("home");
    }
  });
}

/* ===================== NAV ===================== */
function forceSingleActivePage(pageKey) {
  Object.keys(pages).forEach((k) => pages[k]?.classList.remove("active"));
  pages[pageKey]?.classList.add("active");

  navBtns.forEach((b) => b.classList.remove("active"));
  navBtns.find((b) => b.dataset.go === pageKey)?.classList.add("active");
}

function go(pageKey) {
  forceSingleActivePage(pageKey);
  if (pageKey === "opname") renderOpnameTable();
  if (pageKey === "tools" && isAdmin()) loadAdminPanel();
}

/* ===================== ROLE ===================== */
function isAdmin() {
  if (superAdminMode) return true;
  return (userProfile?.role || "viewer") === "admin";
}

/* ===================== UI USER ===================== */
function setUserUI() {
  const whLabel = WAREHOUSE_LABEL[warehouseId()] || warehouseId();

  if (superAdminMode) {
    userName.textContent = "SuperAdmin";
    warehouseName.textContent = whLabel;
    avatar.textContent = "S";
    return;
  }

  const email = userProfile?.email || currentUser?.email || "User";
  userName.textContent = userProfile?.name || email;
  warehouseName.textContent = whLabel;
  avatar.textContent = (userProfile?.name || email).slice(0, 1).toUpperCase();
}

function applyRoleLock() {
  const admin = isAdmin();

  navAdminOnly.forEach((b) => {
    if (!admin) b.classList.add("disabled");
    else b.classList.remove("disabled");
  });

  pages.out.style.display = admin ? "block" : "none";
  pages.in.style.display = admin ? "block" : "none";
  pages.tools.style.display = admin ? "block" : "none";
}

/* ===================== EVENTS ===================== */
function bindEvents() {
  // NAV
  navBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();

      if (btn.classList.contains("admin-only") && !isAdmin()) {
        go("opname");
        return;
      }

      go(btn.dataset.go);
    });
  });

  // AUTH TAB
  tabLogin?.addEventListener("click", () => setAuthMode("login"));
  tabRegister?.addEventListener("click", () => setAuthMode("register"));

  togglePassBtn?.addEventListener("click", () => {
    authPass.type = authPass.type === "password" ? "text" : "password";
  });

  authUser?.addEventListener("input", () => {
    const v = (authUser.value || "").trim().toLowerCase();
    if (v === SUPERADMIN_USER) {
      show(superAdminWarehouseWrap);
      const savedWh = localStorage.getItem("superadmin_wh") || "gedung_ab";
      if (superAdminWarehouse) superAdminWarehouse.value = savedWh;
    } else {
      hide(superAdminWarehouseWrap);
    }
  });

  regRole?.addEventListener("change", () => {
    if (!adminCodeWrap) return;
    adminCodeWrap.style.display = regRole.value === "admin" ? "block" : "none";
  });

  authActionBtn?.addEventListener("click", async () => {
    if (authMode === "login") await doLogin();
    else await doRegister();
  });

  resetAccountBtn?.addEventListener("click", () => {
    safeText(authHint, "Reset akun via Firebase Console → Authentication.");
  });

  // LOGOUT MODAL
  logoutBtn?.addEventListener("click", () => openModal(modalLogout));
  cancelLogoutBtn?.addEventListener("click", () => closeModal(modalLogout));
  modalLogout?.addEventListener("click", (e) => {
    if (e.target === modalLogout) closeModal(modalLogout);
  });

  confirmLogoutBtn?.addEventListener("click", async () => {
    try {
      closeModal(modalLogout);

      // reset superadmin state
      localStorage.removeItem("superadmin_mode");
      localStorage.removeItem("superadmin_wh");
      superAdminMode = false;

      await signOut(auth);

      // reset UI
      forceSingleActivePage("home");
      show(authScreen);

      if (authUser) authUser.value = "";
      if (authPass) authPass.value = "";
      if (authPass2) authPass2.value = "";

      hide(superAdminWarehouseWrap);
      safeText(authHint, "✅ Logout berhasil. Silakan login kembali.");
    } catch (err) {
      alert("Logout gagal: " + err.message);
    }
  });

  // HOME COLLAPSE
  toggleSummaryBtn?.addEventListener("click", () => toggleBox(toggleSummaryBtn, summaryBox));
  toggleLowStockBtn?.addEventListener("click", () => toggleBox(toggleLowStockBtn, lowStockBox));
  toggleTxBtn?.addEventListener("click", () => toggleBox(toggleTxBtn, txBox));

  // TX FILTER + EXPORT TEXT
  txFilterDate?.addEventListener("change", () => renderTx());
  exportTxTextBtn?.addEventListener("click", () => exportTxText());
  copyTxTextBtn?.addEventListener("click", () => copyTxText());

  // OUT/IN
  outItemSelect?.addEventListener("change", updateOutPreview);
  outQty?.addEventListener("input", updateOutPreview);
  outSubmit?.addEventListener("click", saveOut);
  outClear?.addEventListener("click", clearOutForm);

  inItemSelect?.addEventListener("change", updateInPreview);
  inQty?.addEventListener("input", updateInPreview);
  inSubmit?.addEventListener("click", saveIn);
  inClear?.addEventListener("click", clearInForm);

  // OPNAME
  opnameSearch?.addEventListener("input", renderOpnameTable);
  opnameFilter?.addEventListener("change", renderOpnameTable);

  // TOOLS OPEN/CLOSE ALL
  openAllDrawersBtn?.addEventListener("click", () => {
    document.querySelectorAll(".drawer").forEach((d) => d.classList.add("open"));
  });
  closeAllDrawersBtn?.addEventListener("click", () => {
    document.querySelectorAll(".drawer").forEach((d) => d.classList.remove("open"));
  });

  // TOOLS ACTION
  refreshAdminPanelBtn?.addEventListener("click", loadAdminPanel);
  importBtn?.addEventListener("click", importCSVOnline);
  manualAddBtn?.addEventListener("click", addManualItem);
  resetAllBtn?.addEventListener("click", resetAllData);

  exportStockBtn?.addEventListener("click", exportStock);
  exportTxBtn?.addEventListener("click", exportTransactions);
  copyExportBtn?.addEventListener("click", copyExportJSON);
  clearExportBtn?.addEventListener("click", () => {
    exportOutput.value = "";
    exportHint.textContent = "Output export dibersihkan.";
  });

  generateWaBtn?.addEventListener("click", generateWaReport);
  copyWaBtn?.addEventListener("click", copyWaReport);
}

/* ===================== HOME COLLAPSE ===================== */
function initHomeCollapseDefaults() {
  closeBox(toggleSummaryBtn, summaryBox);
  closeBox(toggleLowStockBtn, lowStockBox);
  closeBox(toggleTxBtn, txBox);
}
function openBox(btn, box) {
  if (!btn || !box) return;
  box.classList.add("open");
  btn.textContent = "Tutup";
}
function closeBox(btn, box) {
  if (!btn || !box) return;
  box.classList.remove("open");
  btn.textContent = "Lihat";
}
function toggleBox(btn, box) {
  if (!btn || !box) return;
  box.classList.contains("open") ? closeBox(btn, box) : openBox(btn, box);
}

/* ===================== DRAWER TOOLS ===================== */
function initToolDrawers() {
  const heads = [...document.querySelectorAll(".drawer-head")];
  heads.forEach((head) => {
    head.addEventListener("click", (e) => {
      // ✅ biar klik tombol dalam drawer-body gak ke-trigger
      if (e.target.closest(".drawer-body")) return;

      const drawer = head.closest(".drawer");
      if (!drawer) return;
      drawer.classList.toggle("open");
    });
  });
}

/* ===================== AUTH UI ===================== */
function setAuthMode(mode) {
  authMode = mode;
  tabLogin?.classList.remove("active");
  tabRegister?.classList.remove("active");

  if (mode === "login") {
    tabLogin?.classList.add("active");
    hide(confirmWrap);
    hide(registerExtra);
    authActionBtn.textContent = "Login";
    safeText(authHint, "Silakan login.");
  } else {
    tabRegister?.classList.add("active");
    show(confirmWrap);
    show(registerExtra);
    authActionBtn.textContent = "Register";
    safeText(authHint, "Silakan register.");
  }
}

/* ===================== SUPERADMIN MASTER ===================== */
async function loginFirebaseMaster() {
  try {
    await signInWithEmailAndPassword(auth, FIREBASE_MASTER_EMAIL, FIREBASE_MASTER_PASS);
  } catch (err) {
    safeText(authHint, "❌ SuperAdmin gagal login Firebase Master: " + err.message);
    superAdminMode = false;
    localStorage.removeItem("superadmin_mode");
    show(authScreen);
  }
}

/* ===================== LOGIN / REGISTER ===================== */
async function doLogin() {
  const email = (authUser?.value || "").trim();
  const pass = (authPass?.value || "").trim();

  if (!email || !pass) return safeText(authHint, "⚠️ Email dan password wajib.");

  // SUPERADMIN LOCAL LOGIN
  if (email.toLowerCase() === SUPERADMIN_USER && pass === SUPERADMIN_PASS) {
    superAdminMode = true;
    localStorage.setItem("superadmin_mode", "1");

    const chosenWh = superAdminWarehouse?.value || "gedung_ab";
    localStorage.setItem("superadmin_wh", chosenWh);

    hide(authScreen);
    safeText(authHint, "✅ SuperAdmin masuk...");
    await loginFirebaseMaster();
    return;
  }

  safeText(authHint, "⏳ Login...");
  try {
    await signInWithEmailAndPassword(auth, email, pass);
    safeText(authHint, "✅ Login berhasil!");
  } catch (err) {
    safeText(authHint, "❌ Login gagal: " + err.message);
  }
}

async function doRegister() {
  const name = (regName?.value || "").trim();
  const wh = regWarehouse?.value || "gedung_ab";
  let role = regRole?.value || "viewer";

  const email = (authUser?.value || "").trim();
  const p1 = (authPass?.value || "").trim();
  const p2 = (authPass2?.value || "").trim();

  if (!name) return safeText(authHint, "⚠️ Nama wajib diisi.");
  if (!email) return safeText(authHint, "⚠️ Email wajib diisi.");
  if (!p1 || !p2) return safeText(authHint, "⚠️ Password wajib diisi.");
  if (p1 !== p2) return safeText(authHint, "❌ Password tidak sama.");

  if (role === "admin") {
    const code = (regAdminCode?.value || "").trim();
    if (code !== ADMIN_CODE) role = "viewer";
  }

  safeText(authHint, "⏳ Register...");
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, p1);

    await setDoc(doc(db, "users", cred.user.uid), {
      name,
      email,
      warehouseId: wh,
      role,
      createdAt: serverTimestamp(),
    });

    safeText(authHint, `✅ Register sukses! Role: ${role.toUpperCase()}`);
  } catch (err) {
    safeText(authHint, "❌ Register gagal: " + err.message);
  }
}

/* ===================== PROFILE ===================== */
async function loadUserProfile() {
  const snap = await getDoc(userDoc());
  if (snap.exists()) userProfile = snap.data();
}

/* ===================== PRESENCE ===================== */
function startPresence() {
  stopPresence();
  updatePresence();
  presenceTimer = setInterval(updatePresence, 15000);
}
function stopPresence() {
  if (presenceTimer) clearInterval(presenceTimer);
  presenceTimer = null;
}
async function updatePresence() {
  try {
    if (!currentUser?.uid) return;
    await setDoc(
      presenceDoc(currentUser.uid),
      {
        uid: currentUser.uid,
        name: superAdminMode ? "SuperAdmin" : userProfile?.name || "User",
        email: superAdminMode ? "superadmin" : userProfile?.email || "",
        lastSeen: serverTimestamp(),
      },
      { merge: true }
    );
  } catch {}
}

/* ===================== LOAD DATA ===================== */
async function reloadAllFromDB() {
  await loadStock();
  await loadLatestTx();
}
async function loadStock() {
  stockByKey = {};
  const snap = await getDocs(colItems());
  snap.forEach((d) => (stockByKey[d.id] = { key: d.id, ...d.data() }));
}
async function loadLatestTx() {
  txLatest = [];
  const qTx = query(colTx(), orderBy("createdAt", "desc"), limit(25));
  const snap = await getDocs(qTx);
  snap.forEach((d) => txLatest.push({ id: d.id, ...d.data() }));
}

/* ===================== DROPDOWNS ===================== */
function refreshDropdowns() {
  const items = Object.values(stockByKey)
    .map((x) => ({ key: x.key, name: x.name || x.key }))
    .sort((a, b) => a.name.localeCompare(b.name));

  fillSelect(outItemSelect, items, "Pilih barang...");
  fillSelect(inItemSelect, items, "Pilih barang...");

  updateOutPreview();
  updateInPreview();
}
function fillSelect(selectEl, items, placeholder) {
  if (!selectEl) return;
  selectEl.innerHTML = "";

  const opt0 = document.createElement("option");
  opt0.value = "";
  opt0.textContent = placeholder;
  selectEl.appendChild(opt0);

  items.forEach((it) => {
    const opt = document.createElement("option");
    opt.value = it.key;
    opt.textContent = it.name;
    selectEl.appendChild(opt);
  });
}

/* ===================== HOME RENDER ===================== */
function renderAll() {
  renderStats();
  renderLowStock();
  renderTx();
}

function renderStats() {
  const all = Object.values(stockByKey);
  totalItems.textContent = all.length;
  totalStock.textContent = all.reduce((acc, x) => acc + Number(x.qty || 0), 0);

  const today = todayStr();
  todayTx.textContent = txLatest.filter((t) => (t.createdDate || "").slice(0, 10) === today).length;
}

function renderLowStock() {
  if (!lowStockList) return;
  lowStockList.innerHTML = "";

  const list = Object.values(stockByKey)
    .map((x) => ({ name: x.name || x.key, qty: Number(x.qty || 0), unit: x.unit || "karton" }))
    .sort((a, b) => a.qty - b.qty);

  safeText(lowStockHint, `Limit low stock: < ${LOW_STOCK_LIMIT}`);

  if (list.length === 0) {
    lowStockList.innerHTML = `<div class="hint">Belum ada stok.</div>`;
    return;
  }

  const showList = list.filter((x) => x.qty === 0 || (x.qty > 0 && x.qty < LOW_STOCK_LIMIT)).slice(0, 50);

  if (showList.length === 0) {
    lowStockList.innerHTML = `<div class="hint">✅ Aman! Tidak ada barang hampir habis.</div>`;
    return;
  }

  showList.forEach((x) => {
    const row = document.createElement("div");
    row.className = "item";
    row.innerHTML = `
      <div class="meta">
        <div class="title">${escapeHtml(x.name)}</div>
        <div class="sub">Stok: <b>${x.qty}</b> ${escapeHtml(x.unit)}</div>
      </div>
      <div style="font-weight:900;">⚠️</div>
    `;
    lowStockList.appendChild(row);
  });
}

function renderTx() {
  if (!txList) return;
  txList.innerHTML = "";

  let data = [...txLatest];
  const fDate = txFilterDate?.value || "";

  if (fDate) {
    data = data.filter((t) => {
      if (t.type === "IN") return String(t.inDate || "") === fDate;
      return String(t.createdDate || "").slice(0, 10) === fDate;
    });
    safeText(txFilterHint, `Filter aktif: ${fDate} • ${data.length} transaksi`);
  } else {
    safeText(txFilterHint, `Menampilkan 25 transaksi terakhir (${data.length})`);
  }

  if (data.length === 0) {
    txList.innerHTML = `<div class="hint">Tidak ada transaksi.</div>`;
    return;
  }

  data.forEach((t) => {
    const unit = t.unit ? ` ${t.unit}` : "";
    const sub =
      t.type === "IN"
        ? `MASUK • ${t.inDate || "-"} • Qty: ${t.qty}${unit}`
        : `KELUAR • ${t.receiver || "-"} • Qty: ${t.qty}${unit}`;

    const row = document.createElement("div");
    row.className = "item";
    row.innerHTML = `
      <div class="meta">
        <div class="title">${escapeHtml(t.itemName)}</div>
        <div class="sub">${escapeHtml(sub)}</div>
      </div>
      <div style="font-weight:900;">🧾</div>
    `;
    txList.appendChild(row);
  });
}

/* ===================== LOW STOCK BADGE + ALERT ===================== */
function lowStockCount() {
  return Object.values(stockByKey).filter((x) => {
    const qty = Number(x.qty || 0);
    return qty === 0 || (qty > 0 && qty < LOW_STOCK_LIMIT);
  }).length;
}

function updateLowStockBadge() {
  const n = lowStockCount();
  if (!lowStockBadge || !lowStockBadgeCount) return;

  if (n > 0) {
    lowStockBadgeCount.textContent = String(n);
    lowStockBadge.style.display = "inline-flex";
  } else {
    lowStockBadge.style.display = "none";
  }
}

function showLowStockAlertOnce() {
  const n = lowStockCount();
  if (n <= 0) return;

  const key = `lowstock_alert_${warehouseId()}`;
  if (localStorage.getItem(key) === "1") return;

  alert(`⚠️ Perhatian!\nAda ${n} item yang habis / hampir habis.\nCek Home → Info Barang.`);
  localStorage.setItem(key, "1");
}

/* ===================== TX EXPORT TEXT ===================== */
function exportTxText() {
  const fDate = txFilterDate?.value || "";
  let data = [...txLatest];

  if (fDate) {
    data = data.filter((t) => {
      if (t.type === "IN") return String(t.inDate || "") === fDate;
      return String(t.createdDate || "").slice(0, 10) === fDate;
    });
  }

  if (data.length === 0) {
    txTextOutput.value = "";
    safeText(txFilterHint, "⚠️ Tidak ada transaksi untuk di-export.");
    return;
  }

  let text = "";
  text += `LAPORAN TRANSAKSI GUDANG\n`;
  text += `Gedung: ${WAREHOUSE_LABEL[warehouseId()] || warehouseId()}\n`;
  text += `Tanggal Filter: ${fDate || "Semua (25 terakhir)"}\n`;
  text += `Total: ${data.length}\n\n`;

  data.forEach((t, i) => {
    const unit = t.unit ? ` ${t.unit}` : "";
    if (t.type === "IN") {
      text += `${i + 1}. MASUK - ${t.itemName} (${t.qty}${unit}) | Tgl: ${t.inDate || "-"}\n`;
    } else {
      text += `${i + 1}. KELUAR - ${t.itemName} (${t.qty}${unit}) | Penerima: ${t.receiver || "-"}\n`;
    }
  });

  txTextOutput.value = text;
  safeText(txFilterHint, "✅ Export text siap dicopy.");
}

function copyTxText() {
  const txt = (txTextOutput?.value || "").trim();
  if (!txt) return safeText(txFilterHint, "⚠️ Output kosong.");

  navigator.clipboard
    .writeText(txt)
    .then(() => safeText(txFilterHint, "✅ Copied."))
    .catch(() => safeText(txFilterHint, "⚠️ Copy gagal."));
}

/* ===================== OPNAME ===================== */
function renderOpnameTable() {
  if (!opnameTableBody) return;
  opnameTableBody.innerHTML = "";

  const keyword = (opnameSearch?.value || "").trim().toLowerCase();
  const filter = opnameFilter?.value || "available";

  const items = Object.values(stockByKey)
    .map((x) => ({ name: x.name || x.key, qty: Number(x.qty || 0), unit: x.unit || "karton" }))
    .filter((x) => (keyword ? x.name.toLowerCase().includes(keyword) : true))
    .filter((x) => {
      if (filter === "available") return x.qty > 0;
      if (filter === "low") return x.qty > 0 && x.qty < LOW_STOCK_LIMIT;
      if (filter === "zero") return x.qty === 0;
      return true;
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  safeText(opnameSummary, `Total: ${Object.values(stockByKey).length} • Ditampilkan: ${items.length}`);

  if (items.length === 0) {
    opnameTableBody.innerHTML = `<tr><td colspan="4" style="padding:12px;color:rgba(232,238,252,0.7);">Tidak ada data.</td></tr>`;
    return;
  }

  items.forEach((x, i) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${i + 1}</td>
      <td>${escapeHtml(x.name)}</td>
      <td><b>${x.qty}</b></td>
      <td>${escapeHtml(x.unit)}</td>
    `;
    opnameTableBody.appendChild(tr);
  });
}

/* ===================== PREVIEW ===================== */
function getQtyByKey(itemKey) {
  return Number(stockByKey[itemKey]?.qty || 0);
}
function getItem(itemKey) {
  return stockByKey[itemKey] || null;
}

function updateOutPreview() {
  const itemKey = outItemSelect?.value || "";
  const qty = Number(outQty?.value || 0);

  if (!itemKey) {
    if (outCurrentStock) outCurrentStock.value = "-";
    if (outRemainingStock) outRemainingStock.value = "-";
    return;
  }

  const current = getQtyByKey(itemKey);
  if (outCurrentStock) outCurrentStock.value = current;
  if (outRemainingStock) outRemainingStock.value = !qty || qty <= 0 ? current : current - qty;
}

function updateInPreview() {
  const itemKey = inItemSelect?.value || "";
  const qty = Number(inQty?.value || 0);

  if (!itemKey) {
    if (inCurrentStock) inCurrentStock.value = "-";
    if (inAfterStock) inAfterStock.value = "-";
    return;
  }

  const current = getQtyByKey(itemKey);
  if (inCurrentStock) inCurrentStock.value = current;
  if (inAfterStock) inAfterStock.value = !qty || qty <= 0 ? current : current + qty;
}

/* ===================== SAVE TX ===================== */
async function saveOut() {
  if (!isAdmin()) return safeText(outHint, "❌ Viewer tidak bisa edit.");

  const itemKey = outItemSelect?.value || "";
  const receiver = (outReceiver?.value || "").trim();
  const qty = Number(outQty?.value || 0);

  if (!itemKey) return safeText(outHint, "⚠️ Pilih barang dulu.");
  if (!receiver) return safeText(outHint, "⚠️ Nama penerima wajib.");
  if (!qty || qty <= 0) return safeText(outHint, "⚠️ Jumlah keluar harus > 0.");

  const item = getItem(itemKey);
  const itemName = item?.name || itemKey;
  const unit = item?.unit || "karton";

  const current = getQtyByKey(itemKey);
  if (current - qty < 0) return safeText(outHint, "❌ Stok tidak cukup.");

  await setDoc(
    itemDocByKey(itemKey),
    { name: itemName, qty: current - qty, unit, updatedAt: serverTimestamp() },
    { merge: true }
  );

  await addDoc(colTx(), {
    type: "OUT",
    itemKey,
    itemName,
    qty,
    unit,
    receiver,
    note: (outNote?.value || "").trim(),
    createdAt: serverTimestamp(),
    createdDate: new Date().toISOString(),
  });

  safeText(outHint, "✅ Barang keluar tersimpan.");

  await reloadAllFromDB();
  refreshDropdowns();
  renderAll();
  renderOpnameTable();
  updateLowStockBadge();

  clearOutForm();
  go("home");
}

async function saveIn() {
  if (!isAdmin()) return safeText(inHint, "❌ Viewer tidak bisa edit.");

  const itemKey = inItemSelect?.value || "";
  const qty = Number(inQty?.value || 0);
  const date = inDate?.value || "";

  if (!itemKey) return safeText(inHint, "⚠️ Pilih barang dulu.");
  if (!qty || qty <= 0) return safeText(inHint, "⚠️ Jumlah masuk harus > 0.");
  if (!date) return safeText(inHint, "⚠️ Tanggal masuk wajib.");

  const item = getItem(itemKey);
  const itemName = item?.name || itemKey;
  const unit = item?.unit || "karton";

  const current = getQtyByKey(itemKey);

  await setDoc(
    itemDocByKey(itemKey),
    { name: itemName, qty: current + qty, unit, updatedAt: serverTimestamp() },
    { merge: true }
  );

  await addDoc(colTx(), {
    type: "IN",
    itemKey,
    itemName,
    qty,
    unit,
    inDate: date,
    note: (inNote?.value || "").trim(),
    createdAt: serverTimestamp(),
    createdDate: new Date().toISOString(),
  });

  safeText(inHint, "✅ Barang masuk tersimpan.");

  await reloadAllFromDB();
  refreshDropdowns();
  renderAll();
  renderOpnameTable();
  updateLowStockBadge();

  clearInForm();
  go("home");
}

/* ===================== FORM RESET ===================== */
function clearOutForm() {
  if (outItemSelect) outItemSelect.value = "";
  if (outReceiver) outReceiver.value = "";
  if (outQty) outQty.value = "";
  if (outNote) outNote.value = "";
  updateOutPreview();
}
function clearInForm() {
  if (inItemSelect) inItemSelect.value = "";
  if (inQty) inQty.value = "";
  if (inNote) inNote.value = "";
  setDefaultDates();
  updateInPreview();
}
function setDefaultDates() {
  if (inDate) inDate.value = todayStr();
  if (waReportDate) waReportDate.value = todayStr();
}

/* ===================== ADMIN PANEL ===================== */
async function loadAdminPanel() {
  if (!isAdmin()) return;

  safeText(adminPanelHint, "⏳ Loading...");
  if (onlineList) onlineList.innerHTML = "";

  try {
    const now = Date.now();
    const snapP = await getDocs(colPresence());
    const online = [];

    snapP.forEach((d) => {
      const p = d.data();
      const last = p.lastSeen?.toDate?.()?.getTime?.() || 0;
      if (now - last < 35000) online.push(p);
    });

    if (online.length === 0) {
      onlineList.innerHTML = `<div class="hint">Tidak ada user online.</div>`;
    } else {
      online.forEach((u) => {
        const row = document.createElement("div");
        row.className = "item";
        row.innerHTML = `
          <div class="meta">
            <div class="title">${escapeHtml(u.name || "-")}</div>
            <div class="sub">${escapeHtml(u.email || "-")}</div>
          </div>
          <div style="font-weight:900;">🟢</div>
        `;
        onlineList.appendChild(row);
      });
    }

    safeText(adminPanelHint, "✅ Ready.");
  } catch (err) {
    safeText(adminPanelHint, "❌ Error: " + err.message);
  }
}

/* ===================== IMPORT CSV ===================== */
async function importCSVOnline() {
  if (!isAdmin()) return;
  safeText(importHint, "");

  try {
    if (!importFile?.files || importFile.files.length === 0) {
      safeText(importHint, "⚠️ Pilih file CSV dulu.");
      return;
    }

    const text = await importFile.files[0].text();
    const lines = text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);

    if (lines.length < 2) {
      safeText(importHint, "⚠️ CSV kosong.");
      return;
    }

    const mode = importMode?.value || "append";

    if (mode === "replace") {
      const ok = confirm("⚠️ Replace akan menghapus semua ITEM lama. Lanjut?");
      if (!ok) {
        safeText(importHint, "Dibatalkan.");
        return;
      }

      const snap = await getDocs(colItems());
      await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
    }

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(",");
      const name = (cols[0] || "").trim();
      const qty = Number(cols[1] || 0);
      const unit = (cols[2] || "karton").trim();

      if (!name || !Number.isFinite(qty) || qty < 0) continue;

      const key = safeDocId(name);
      const current = Number(stockByKey[key]?.qty || 0);
      const newQty = mode === "replace" ? qty : current + qty;

      await setDoc(
        itemDocByKey(key),
        { name, qty: newQty, unit, updatedAt: serverTimestamp() },
        { merge: true }
      );
    }

    safeText(importHint, "✅ Import selesai.");
    importFile.value = "";

    await reloadAllFromDB();
    refreshDropdowns();
    renderAll();
    renderOpnameTable();
    updateLowStockBadge();
  } catch (err) {
    safeText(importHint, "❌ Import error: " + err.message);
  }
}

/* ===================== MANUAL ADD ITEM ===================== */
async function addManualItem() {
  if (!isAdmin()) return;

  safeText(manualAddHint, "");

  const name = (manualName?.value || "").trim();
  const qty = Number(manualQty?.value || 0);
  const unit = (manualUnit?.value || "karton").trim();
  const note = (manualNote?.value || "").trim();

  if (!name) return safeText(manualAddHint, "⚠️ Nama barang wajib.");
  if (!Number.isFinite(qty) || qty < 0) return safeText(manualAddHint, "⚠️ Stok harus >= 0.");

  const key = safeDocId(name);

  await setDoc(
    itemDocByKey(key),
    { name, qty, unit, note, updatedAt: serverTimestamp() },
    { merge: true }
  );

  safeText(manualAddHint, "✅ Barang ditambahkan.");
  if (manualName) manualName.value = "";
  if (manualQty) manualQty.value = "";
  if (manualNote) manualNote.value = "";

  await reloadAllFromDB();
  refreshDropdowns();
  renderAll();
  renderOpnameTable();
  updateLowStockBadge();
}

/* ===================== RESET ALL DATA ===================== */
async function resetAllData() {
  if (!isAdmin()) return;

  const ok = confirm("⚠️ RESET TOTAL? Semua item + transaksi gudang ini akan dihapus.");
  if (!ok) return;

  safeText(resetAllHint, "⏳ Menghapus...");

  try {
    const itemsSnap = await getDocs(colItems());
    await Promise.all(itemsSnap.docs.map((d) => deleteDoc(d.ref)));

    const txSnap = await getDocs(colTx());
    await Promise.all(txSnap.docs.map((d) => deleteDoc(d.ref)));

    safeText(resetAllHint, "✅ Reset selesai.");

    await reloadAllFromDB();
    refreshDropdowns();
    renderAll();
    renderOpnameTable();
    updateLowStockBadge();
  } catch (err) {
    safeText(resetAllHint, "❌ Reset gagal: " + err.message);
  }
}

/* ===================== EXPORT JSON ===================== */
function exportStock() {
  if (!isAdmin()) return;
  if (!exportOutput) return;

  exportOutput.value = JSON.stringify(Object.values(stockByKey), null, 2);
  safeText(exportHint, "✅ Export stock tampil (copy).");
}

function exportTransactions() {
  if (!isAdmin()) return;
  if (!exportOutput) return;

  exportOutput.value = JSON.stringify(txLatest, null, 2);
  safeText(exportHint, "✅ Export transaksi tampil (copy).");
}

function copyExportJSON() {
  const txt = (exportOutput?.value || "").trim();
  if (!txt) return safeText(exportHint, "⚠️ Output kosong.");

  navigator.clipboard
    .writeText(txt)
    .then(() => safeText(exportHint, "✅ Copied."))
    .catch(() => safeText(exportHint, "⚠️ Copy gagal."));
}

/* ===================== WA REPORT ===================== */
function generateWaReport() {
  if (!isAdmin()) return;

  safeText(waReportHint, "");
  const date = waReportDate?.value || todayStr();
  const note = (waReportNote?.value || "").trim() || "Dengan jumlah yang sesuai dengan orderan.";

  const list = txLatest.filter((t) => t.type === "IN" && String(t.inDate || "") === date);

  if (list.length === 0) {
    if (waReportOutput) waReportOutput.value = "";
    safeText(waReportHint, "⚠️ Tidak ada transaksi MASUK hari itu.");
    return;
  }

  const map = {};
  list.forEach((t) => {
    const key = (t.itemName || "").trim();
    if (!map[key]) map[key] = { qty: 0, unit: t.unit || "" };
    map[key].qty += Number(t.qty || 0);
  });

  let text = "";
  text += "*INFO PENERIMAAN BARANG*\n";
  text += `Gedung: ${WAREHOUSE_LABEL[warehouseId()] || warehouseId()}\n`;
  text += `Tanggal: ${date}\n\n`;
  text += "*Barang yang diterima:*\n";

  Object.keys(map)
    .sort()
    .forEach((name) => {
      const x = map[name];
      const unit = x.unit ? ` ${x.unit}` : "";
      text += `- ${name}: ${x.qty}${unit}\n`;
    });

  text += "\n*Keterangan:*\n";
  text += note;

  if (waReportOutput) waReportOutput.value = text;
  safeText(waReportHint, "✅ Laporan siap dicopy.");
}

function copyWaReport() {
  const txt = (waReportOutput?.value || "").trim();
  if (!txt) return safeText(waReportHint, "⚠️ Output laporan kosong.");

  navigator.clipboard
    .writeText(txt)
    .then(() => safeText(waReportHint, "✅ Copied."))
    .catch(() => safeText(waReportHint, "⚠️ Copy gagal."));
}
