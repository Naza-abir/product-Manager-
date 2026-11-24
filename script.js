// ===============================
// Product Explorer - script.js
// API: https://dummyjson.com/products (free, no API key)
// ===============================

const API_URL = "https://dummyjson.com/products?limit=100";
const FAV_KEY = "productExplorer_favorites";
const FILTER_KEY = "productExplorer_filters";

// ---------- DOM elements (selectors) ----------
const searchInput = document.querySelector("#searchInput");
const categorySelect = document.querySelector("#categorySelect");
const sortSelect = document.querySelector("#sortSelect");
const favToggle = document.querySelector("#favToggle");
const favCount = document.querySelector("#favCount");
const resultInfo = document.querySelector("#resultInfo");
const grid = document.querySelector("#productGrid");
const loadingBox = document.querySelector("#loading");
const errorBox = document.querySelector("#error");
const errorMsg = document.querySelector("#errorMsg");
const emptyBox = document.querySelector("#empty");
const retryBtn = document.querySelector("#retryBtn");
const modal = document.querySelector("#modal");
const modalBody = document.querySelector("#modalBody");
const closeModal = document.querySelector("#closeModal");

// ---------- Application data ----------
let products = [];                 // all products from API
let favorites = loadFavorites();   // array of product ids (from localStorage)
let showOnlyFavs = false;

// ===============================
// Local Storage
// ===============================
function loadFavorites() {
  try {
    return JSON.parse(localStorage.getItem(FAV_KEY)) || [];
  } catch (e) {
    return [];
  }
}

function saveFavorites() {
  localStorage.setItem(FAV_KEY, JSON.stringify(favorites));
}

function saveFilters() {
  const filters = {
    search: searchInput.value,
    category: categorySelect.value,
    sort: sortSelect.value,
    onlyFavs: showOnlyFavs,
  };
  localStorage.setItem(FILTER_KEY, JSON.stringify(filters));
}

function restoreFilters() {
  try {
    const saved = JSON.parse(localStorage.getItem(FILTER_KEY));
    if (!saved) return;
    searchInput.value = saved.search || "";
    sortSelect.value = saved.sort || "default";
    showOnlyFavs = !!saved.onlyFavs;
    // category is restored after categories are loaded (see fillCategories)
    categorySelect.dataset.saved = saved.category || "all";
  } catch (e) {
    /* ignore broken data */
  }
}

// ===============================
// API call (fetch + async/await)
// ===============================
async function fetchProducts() {
  showState("loading");
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error("Server error: " + response.status);
    }
    const data = await response.json();
    products = data.products;
    fillCategories();
    showState("none");
    render();
  } catch (error) {
    errorMsg.textContent =
      "Could not load products. Please check your internet and try again. (" +
      error.message + ")";
    showState("error");
  }
}

// ===============================
// UI states: loading / error / empty
// ===============================
function showState(name) {
  loadingBox.classList.toggle("hidden", name !== "loading");
  errorBox.classList.toggle("hidden", name !== "error");
  emptyBox.classList.toggle("hidden", name !== "empty");
  if (name === "loading" || name === "error") {
    grid.innerHTML = "";
    resultInfo.textContent = "";
  }
}

// ===============================
// Categories dropdown (map + Set)
// ===============================
function fillCategories() {
  const categories = [...new Set(products.map((p) => p.category))].sort();
  categories.forEach((cat) => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat.replace(/-/g, " ");
    categorySelect.appendChild(option);
  });
  categorySelect.value = categorySelect.dataset.saved || "all";
}

// ===============================
// Filter + sort logic (filter, sort)
// ===============================
function getVisibleProducts() {
  const text = searchInput.value.trim().toLowerCase();
  const category = categorySelect.value;
  const sort = sortSelect.value;

  let result = products.filter((p) => {
    const matchText = p.title.toLowerCase().includes(text);
    const matchCategory = category === "all" || p.category === category;
    const matchFav = !showOnlyFavs || favorites.includes(p.id);
    return matchText && matchCategory && matchFav;
  });

  if (sort === "price-asc") result.sort((a, b) => a.price - b.price);
  if (sort === "price-desc") result.sort((a, b) => b.price - a.price);
  if (sort === "rating") result.sort((a, b) => b.rating - a.rating);

  return result;
}

// ===============================
// Rendering (DOM manipulation)
// ===============================
function render() {
  const list = getVisibleProducts();
  grid.innerHTML = "";
  favCount.textContent = favorites.length;
  favToggle.classList.toggle("active", showOnlyFavs);

  if (list.length === 0) {
    emptyBox.classList.remove("hidden");
    resultInfo.textContent = "";
    return;
  }
  emptyBox.classList.add("hidden");
  resultInfo.textContent = "Showing " + list.length + " product(s)";

  list.forEach((product) => grid.appendChild(createCard(product)));
}

function createCard(product) {
  const card = document.createElement("div");
  card.className = "card";
  card.dataset.id = product.id;

  const img = document.createElement("img");
  img.src = product.thumbnail;
  img.alt = product.title;
  img.loading = "lazy";

  const favBtn = document.createElement("button");
  favBtn.className = "fav-btn";
  favBtn.dataset.id = product.id;
  favBtn.textContent = favorites.includes(product.id) ? "❤️" : "🤍";

  const title = document.createElement("h3");
  title.textContent = product.title;

  const category = document.createElement("p");
  category.className = "category";
  category.textContent = product.category.replace(/-/g, " ");

  const rating = document.createElement("p");
  rating.className = "rating";
  rating.textContent = "⭐ " + product.rating;

  const price = document.createElement("p");
  price.className = "price";
  price.textContent = "$" + product.price;

  card.append(favBtn, img, title, category, rating, price);
  return card;
}

function openModal(id) {
  const product = products.find((p) => p.id === id); // find()
  if (!product) return;

  const isFav = favorites.includes(product.id);
  modalBody.innerHTML = "";

  const img = document.createElement("img");
  img.src = product.images && product.images[0] ? product.images[0] : product.thumbnail;
  img.alt = product.title;

  const title = document.createElement("h2");
  title.textContent = product.title;

  const desc = document.createElement("p");
  desc.textContent = product.description;

  const info = document.createElement("p");
  info.innerHTML =
    "<strong>Brand:</strong> " + (product.brand || "N/A") +
    "<br><strong>Category:</strong> " + product.category +
    "<br><strong>Price:</strong> $" + product.price +
    "<br><strong>Rating:</strong> ⭐ " + product.rating +
    "<br><strong>Stock:</strong> " + product.stock;

  const btn = document.createElement("button");
  btn.className = "btn";
  btn.textContent = isFav ? "Remove from Favourites" : "Add to Favourites";
  btn.addEventListener("click", () => {
    toggleFavorite(product.id);
    openModal(product.id); // refresh modal text
  });

  modalBody.append(img, title, desc, info, btn);
  modal.classList.remove("hidden");
}

// ===============================
// Favourites logic
// ===============================
function toggleFavorite(id) {
  if (favorites.includes(id)) {
    favorites = favorites.filter((favId) => favId !== id);
  } else {
    favorites.push(id);
  }
  saveFavorites();
  render();
}

// ===============================
// Event listeners
// ===============================
searchInput.addEventListener("input", () => { saveFilters(); render(); });
categorySelect.addEventListener("change", () => { saveFilters(); render(); });
sortSelect.addEventListener("change", () => { saveFilters(); render(); });

favToggle.addEventListener("click", () => {
  showOnlyFavs = !showOnlyFavs;
  saveFilters();
  render();
});

// One listener for the whole grid (event delegation)
grid.addEventListener("click", (event) => {
  const favBtn = event.target.closest(".fav-btn");
  if (favBtn) {
    toggleFavorite(Number(favBtn.dataset.id));
    return;
  }
  const card = event.target.closest(".card");
  if (card) openModal(Number(card.dataset.id));
});

closeModal.addEventListener("click", () => modal.classList.add("hidden"));
modal.addEventListener("click", (e) => {
  if (e.target === modal) modal.classList.add("hidden");
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") modal.classList.add("hidden");
});

retryBtn.addEventListener("click", fetchProducts);

// ===============================
// Start the app
// ===============================
restoreFilters();
favCount.textContent = favorites.length;
fetchProducts();
