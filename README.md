# DailyNest PWA starter

A mobile-first, installable storefront prototype designed to be edited from an iPhone or computer.

## Included
- Product catalogue, search and category filters
- Cart and demo checkout
- Customer order list
- Admin panel to add/delete products, update stock and update order status
- Local browser persistence with localStorage
- PWA manifest and service worker

## Important limitations
This is a prototype, not a production commerce system. Data is stored only in the browser/device where it is used. It is NOT shared between customer devices and the admin device. There is no real payment processing, authentication, customer account security, server-side inventory, order notifications, or courier integration. Do not collect real customer orders or payment details with this version.

## Publish free with GitHub Pages
1. Create/sign in to a GitHub account.
2. Create a new public repository named `dailynest`.
3. Upload all files in this folder to the repository root (not the ZIP itself).
4. Open repository Settings → Pages.
5. Under Build and deployment, choose Deploy from a branch → `main` → `/ (root)` → Save.
6. Wait for GitHub Pages to publish. Your site URL will be shown in Settings → Pages.
7. Open the published URL in Safari on iPhone → Share → Add to Home Screen.

PWA installation and service workers require HTTPS; GitHub Pages provides HTTPS.

## Before a real launch
Connect a secure shared backend (e.g. Supabase), implement admin authentication and database row-level security, server-side stock validation, privacy/terms/returns pages, payment gateway integration, order notifications, and tested delivery/refund workflows. Never put secret API keys in frontend JavaScript.
