// ====== Demo product data (replace later with real data/API) ======
const PRODUCTS = [
  {
    id: "t1",
    name: "AeroBuds Pro",
    price: 129.00,
    category: "Audio",
    img: "https://picsum.photos/seed/aerobuds/900/700",
    desc: "Premium wireless earbuds with active noise cancellation, transparency mode, and a pocketable fast-charge case."
  },
  {
    id: "t2",
    name: "PulseWatch S",
    price: 199.00,
    category: "Wearables",
    img: "https://picsum.photos/seed/pulsewatch/900/700",
    desc: "A lightweight smartwatch with an always-on display, health tracking, and 7-day battery life."
  },
  {
    id: "t3",
    name: "MagCharge Stand",
    price: 39.99,
    category: "Accessories",
    img: "https://picsum.photos/seed/magcharge/900/700",
    desc: "Magnetic wireless charging stand with a clean desk footprint—snap, charge, and go."
  },
  {
    id: "t4",
    name: "Nova Keyboard",
    price: 89.00,
    category: "Peripherals",
    img: "https://picsum.photos/seed/novakeyboard/900/700",
    desc: "Compact mechanical keyboard with a premium aluminum frame and satisfying tactile feel."
  },
  {
    id: "t5",
    name: "Orbit Mouse",
    price: 49.00,
    category: "Peripherals",
    img: "https://picsum.photos/seed/orbitmouse/900/700",
    desc: "Ergonomic wireless mouse with a precision sensor and silent clicks for focused work."
  },
  {
    id: "t6",
    name: "Arc Speaker Mini",
    price: 59.00,
    category: "Audio",
    img: "https://picsum.photos/seed/arcspeaker/900/700",
    desc: "Compact speaker with crisp highs, warm bass, and a minimalist design that fits anywhere."
  },
  {
    id: "t7",
    name: "Flow Webcam 1080p",
    price: 69.00,
    category: "Accessories",
    img: "https://picsum.photos/seed/flowwebcam/900/700",
    desc: "Sharp video, clean audio, and auto-light correction—built for calls and content."
  },
  {
    id: "t8",
    name: "LitePad 10.9",
    price: 329.00,
    category: "Tablets",
    img: "https://picsum.photos/seed/litepad/900/700",
    desc: "A thin, bright-display tablet for study, streaming, and sketching with all-day battery."
  }
];


// ====== Cart helpers (stored in localStorage) ======
const CART_KEY = "simple_cart_v1";

function getCart(){
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || {}; }
  catch { return {}; }
}
function saveCart(cart){
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartBadge();
}
function cartCount(cart = getCart()){
  return Object.values(cart).reduce((sum, item) => sum + item.qty, 0);
}
function cartSubtotal(cart = getCart()){
  return Object.values(cart).reduce((sum, item) => sum + item.qty * item.price, 0);
}
function addToCart(productId, qty=1){
  const cart = getCart();
  const p = PRODUCTS.find(x => x.id === productId);
  if(!p) return;

  if(!cart[productId]){
    cart[productId] = { id:p.id, name:p.name, price:p.price, img:p.img, qty:0 };
  }
  cart[productId].qty += qty;
  saveCart(cart);
}
function updateQty(productId, qty){
  const cart = getCart();
  if(!cart[productId]) return;
  cart[productId].qty = Math.max(1, parseInt(qty || "1", 10));
  saveCart(cart);
}
function removeFromCart(productId){
  const cart = getCart();
  delete cart[productId];
  saveCart(cart);
}
function clearCart(){
  localStorage.removeItem(CART_KEY);
  updateCartBadge();
}

function formatMoney(n){
  return `$${n.toFixed(2)}`;
}

// ====== UI hooks ======
function updateCartBadge(){
  const el = document.querySelector("[data-cart-badge]");
  if(el) el.textContent = cartCount();
}

function renderProducts(){
  const grid = document.querySelector("#productGrid");
  if(!grid) return;

  const q = (document.querySelector("#searchInput")?.value || "").trim().toLowerCase();
  const cat = document.querySelector("#categoryFilter")?.value || "all";
  const sort = document.querySelector("#sortBy")?.value || "featured";

  let list = PRODUCTS.filter(p => {
    const matchesQuery =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q);

    const matchesCat = (cat === "all") || (p.category === cat);
    return matchesQuery && matchesCat;
  });

  if(sort === "low") list.sort((a,b)=> a.price - b.price);
  if(sort === "high") list.sort((a,b)=> b.price - a.price);

  grid.innerHTML = list.map(p => `
    <article class="card card-link" role="link" tabindex="0" data-open="${p.id}">
      <img src="${p.img}" alt="${p.name}">
      <div class="card-body">
        <div class="row">
          <div>
            <div style="font-weight:800">${p.name}</div>
            <div class="muted">${p.category}</div>
          </div>
          <div class="price">${formatMoney(p.price)}</div>
        </div>
        <button class="btn primary" data-add="${p.id}">Add to cart</button>
      </div>
    </article>
  `).join("");

  grid.querySelectorAll("[data-open]").forEach(card => {
    const go = () => (window.location.href = `product.html?id=${card.dataset.open}`);
    card.addEventListener("click", (e) => {
      if (e.target.matches("[data-add]")) return;
      go();
    });
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") go();
    });
  });

  grid.querySelectorAll("[data-add]").forEach(btn=>{
    btn.addEventListener("click", (e)=>{
      e.stopPropagation();
      addToCart(btn.dataset.add, 1);
    });
  });
}

function renderProductPage(){
  const root = document.querySelector("#productPage");
  if(!root) return; // not on product page

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const p = PRODUCTS.find(x => x.id === id);

  if(!p){
    root.innerHTML = `
      <div class="panel" style="margin-top:20px">
        <div style="font-weight:900; font-size:18px; color:var(--muted)">
          Product not found
        </div>
      </div>
    `;
    return;
  }

  root.innerHTML = `
    <div class="product-wrap">
      <div class="product-media">
        <img src="${p.img}" alt="${p.name}">
      </div>

      <div class="product-info">
        <div class="product-kicker">${p.category}</div>
        <h1 class="product-title">${p.name}</h1>
        <div class="product-price">${formatMoney(p.price)}</div>
        <p class="product-desc">${p.desc}</p>

        <div class="product-actions">
          <div class="qty-wrap">
            <span class="muted">Qty</span>
            <input class="qty" id="pdQty" type="number" min="1" value="1">
          </div>
          <button class="btn primary" id="pdAdd">Add to cart</button>
        </div>
      </div>
    </div>
  `;

  document.querySelector("#pdAdd").addEventListener("click", () => {
    const qty = parseInt(document.querySelector("#pdQty").value || "1", 10);
    addToCart(p.id, Math.max(1, qty));
  });
}

function renderCart(){
  const tbody = document.querySelector("#cartBody");
  const subtotalEl = document.querySelector("#subtotal");
  const emptyEl = document.querySelector("#emptyCart");

  if(!tbody) return;

  const cart = getCart();
  const items = Object.values(cart);

  if(items.length === 0){
    tbody.innerHTML = "";
    if(subtotalEl) subtotalEl.textContent = formatMoney(0);
    if(emptyEl) emptyEl.style.display = "block";
    return;
  }
  if(emptyEl) emptyEl.style.display = "none";

  tbody.innerHTML = items.map(item => `
    <tr>
      <td>
        <div style="display:flex; gap:10px; align-items:center">
          <img src="${item.img}" alt="${item.name}" style="width:64px;height:48px;object-fit:cover;border-radius:10px;border:1px solid var(--border)">
          <div>
            <div style="font-weight:800">${item.name}</div>
            <div class="muted">${formatMoney(item.price)} each</div>
          </div>
        </div>
      </td>
      <td>
        <input class="qty" type="number" min="1" value="${item.qty}" data-qty="${item.id}">
      </td>
      <td><strong>${formatMoney(item.qty * item.price)}</strong></td>
      <td>
        <button class="btn danger" data-remove="${item.id}">Remove</button>
      </td>
    </tr>
  `).join("");

  tbody.querySelectorAll("[data-qty]").forEach(input=>{
    input.addEventListener("change", ()=>{
      updateQty(input.dataset.qty, input.value);
      renderCart();
    });
  });
  tbody.querySelectorAll("[data-remove]").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      removeFromCart(btn.dataset.remove);
      renderCart();
    });
  });

  if(subtotalEl) subtotalEl.textContent = formatMoney(cartSubtotal(cart));
}

function bindCatalogControls(){
  const search = document.querySelector("#searchInput");
  const cat = document.querySelector("#categoryFilter");
  const sort = document.querySelector("#sortBy");

  if(search) search.addEventListener("input", renderProducts);
  if(cat) cat.addEventListener("change", renderProducts);
  if(sort) sort.addEventListener("change", renderProducts);
}


function bindCheckout(){
  const form = document.querySelector("#checkoutForm");
  if(!form) return;

  // populate summary
  const subtotalEl = document.querySelector("#checkoutSubtotal");
  const itemCountEl = document.querySelector("#checkoutItems");
  if(subtotalEl) subtotalEl.textContent = formatMoney(cartSubtotal());
  if(itemCountEl) itemCountEl.textContent = String(cartCount());

  form.addEventListener("submit", (e)=>{
    e.preventDefault();
    // simple “checkout”: store order + clear cart
    const data = Object.fromEntries(new FormData(form).entries());
    const order = {
      customer: data,
      items: Object.values(getCart()),
      subtotal: cartSubtotal(),
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem("last_order_v1", JSON.stringify(order));
    clearCart();
    window.location.href = "success.html";
  });
}

function renderSuccess(){
  const box = document.querySelector("#orderBox");
  if(!box) return;

  let order = null;
  try { order = JSON.parse(localStorage.getItem("last_order_v1")); } catch {}
  if(!order){
    box.innerHTML = `<div class="muted">No recent order found.</div>`;
    return;
  }

  box.innerHTML = `
    <div class="row">
      <div>
        <div style="font-size:20px;font-weight:900">Thanks, ${order.customer.firstName || "customer"}!</div>
        <div class="muted">Order created: ${new Date(order.createdAt).toLocaleString()}</div>
      </div>
      <div class="price">${formatMoney(order.subtotal)}</div>
    </div>
    <hr style="border-color:var(--border); opacity:.6; margin:14px 0">
    ${order.items.map(i=>`
      <div class="row" style="margin:10px 0">
        <div>${i.name} <span class="muted">× ${i.qty}</span></div>
        <div><strong>${formatMoney(i.qty*i.price)}</strong></div>
      </div>
    `).join("")}
    <hr style="border-color:var(--border); opacity:.6; margin:14px 0">
    <div class="total-line"><span>Ship to</span><strong>${order.customer.address || ""}</strong></div>
  `;
}

function populateCategories(){
  const sel = document.querySelector("#categoryFilter");
  if(!sel) return;

  const cats = Array.from(new Set(PRODUCTS.map(p=>p.category))).sort();
  sel.innerHTML = `<option value="all">All categories</option>` +
    cats.map(c=>`<option value="${c}">${c}</option>`).join("");
}

const THEME_KEY = "minishop_theme_v1";

function getSystemTheme(){
  return window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
}

function applyTheme(theme){
  document.documentElement.setAttribute("data-theme", theme);
  const btn = document.querySelector("#themeToggle");
  if(btn) btn.textContent = theme === "light" ? "☀️" : "🌙";
}

function initTheme(){
  const saved = localStorage.getItem(THEME_KEY);
  const theme = saved || getSystemTheme();
  applyTheme(theme);

  const btn = document.querySelector("#themeToggle");
  if(btn){
    btn.addEventListener("click", () => {
      const current = document.documentElement.getAttribute("data-theme") || "dark";
      const next = current === "dark" ? "light" : "dark";
      localStorage.setItem(THEME_KEY, next);
      applyTheme(next);
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // Theme + badge are safe
  if (typeof initTheme === "function") initTheme();
  if (typeof updateCartBadge === "function") updateCartBadge();

  // Catalog page
  if (typeof populateCategories === "function") populateCategories();
  if (typeof bindCatalogControls === "function") bindCatalogControls();
  if (typeof renderProducts === "function") renderProducts();

  // Cart / checkout / success
  if (typeof renderCart === "function") renderCart();
  if (typeof bindCheckout === "function") bindCheckout();
  if (typeof renderSuccess === "function") renderSuccess();

  // Product page (THIS is the one you need)
  if (typeof renderProductPage === "function") renderProductPage();
});