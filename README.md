# Product Explorer

A simple web app built with HTML, CSS and JavaScript for CSE-2340 (MP3-MP4).
It loads products from a free API, lets the user search, filter and sort them,
and saves favourite products in the browser.

**API used:** https://dummyjson.com/products (free, no API key needed)

## How to run
Open `index.html` in any browser (internet connection is required for the API).

## Features
- Search products by name
- Filter by category, sort by price or rating
- Click a product card to see full details in a popup
- Add or remove favourites (heart button)
- "Favourites" button shows only saved products
- Favourites, search text, category and sort are remembered after refresh

## Requirement mapping
| Requirement | Where in the project |
|---|---|
| DOM manipulation and dynamic rendering | `render()`, `createCard()`, `openModal()` use `createElement`, `querySelector`, `appendChild` |
| Event handling and JS logic | `addEventListener` for search, filter, sort, clicks; `map()`, `filter()`, `find()`, `forEach()`, `sort()` |
| API and async | `fetchProducts()` uses `fetch()` + `async/await` with loading, error (with retry) and empty states |
| Local Storage | `localStorage` saves favourites and filters, and loads them on page start |

## Files
- `index.html` - page structure
- `style.css` - design
- `script.js` - all logic
