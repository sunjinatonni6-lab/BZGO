# BazarGO — E-Commerce Web Application

BazarGO is a multi-page e-commerce application built with HTML, CSS, vanilla JavaScript, Firebase Authentication, and Cloud Firestore. It includes a customer storefront, shopping cart, checkout flow, customer order history, and an admin panel.

> **Scope of this README update:** Documentation only. Existing HTML, CSS, JavaScript, Firebase rules, and application design are not changed by this README update.

## Table of Contents

- [Technology Stack](#technology-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Firebase Setup](#firebase-setup)
- [Run Locally](#run-locally)
- [Deploy to Vercel](#deploy-to-vercel)
- [Responsive Design and Multi-Device Data](#responsive-design-and-multi-device-data)
- [Security Notes](#security-notes)
- [Troubleshooting](#troubleshooting)

## Technology Stack

- **Frontend:** HTML5, CSS3, Vanilla JavaScript (ES Modules)
- **Icons:** Font Awesome 6.5.1 CDN
- **Authentication:** Firebase Authentication
- **Database:** Cloud Firestore
- **Hosting:** Vercel

## Features

### Customer Storefront

- Browse and search the product catalog.
- View product details, ratings, reviews, categories, and stock status.
- Add products to the cart and adjust quantities.
- Sign in or register before placing an order.
- Manage account details and delivery information.
- View order history and order status.

### Inventory and Orders

- Product inventory includes stock quantities.
- Stock status can be shown as **Out of Stock** when inventory is depleted.
- Order and stock changes rely on Firebase/Firestore implementation and configuration.
- Customer order cancellation should be restricted to eligible orders and validated by trusted Firestore rules or backend logic.

### Admin Panel

The `admin/` pages provide the admin interface for dashboard metrics, product management, order management, and promotional banner settings. Admin access depends on the configured authentication and authorization checks.

## Project Structure

```text
BazarGO/
├── index.html
├── cart.html
├── checkout.html
├── login.html
├── register.html
├── account.html
├── my-orders.html
├── firestore.rules
├── vercel.json
├── admin/
│   ├── dashboard.html
│   ├── products.html
│   ├── orders.html
│   └── banner.html
└── assets/
    ├── css/
    │   ├── style.css
    │   ├── responsive.css
    │   ├── admin.css
    │   ├── admin-responsive.css
    │   └── pages/
    ├── js/
    │   ├── firebase-config.js
    │   ├── auth.js
    │   └── cart.js
    └── images/
```

## Firebase Setup

1. Open the project in the [Firebase Console](https://console.firebase.google.com/).
2. Create or select a Firebase project.
3. Enable **Authentication** and configure the sign-in methods used by the app.
4. Create a **Cloud Firestore** database.
5. Review `assets/js/firebase-config.js` and enter the configuration values for your Firebase project. Do not publish private server credentials.
6. Review `firestore.rules` and deploy appropriate rules from the Firebase Console or Firebase CLI.
7. Ensure the database collections and document fields used by the application match the code.

**Important:** Firebase web configuration values identify your Firebase project; Firestore Security Rules and authorization checks must protect the data. Never rely on hiding buttons or client-side checks alone for security.

## Run Locally

Because the application uses JavaScript ES modules, run it through a local web server rather than opening HTML files directly with a `file://` URL.

For example, using Visual Studio Code:

1. Open the project folder.
2. Start a local server with the Live Server extension (or another static development server).
3. Open the local URL shown by the server.
4. Test customer and admin flows using appropriately configured Firebase accounts.

## Deploy to Vercel

1. Push the project to a Git repository or import the project into Vercel.
2. Set the project root to the directory containing `index.html` and `vercel.json`.
3. Deploy the project.
4. Test authentication, product loading, checkout, and admin access on the deployed domain.
5. Add the deployed domain to Firebase Authentication's authorized domains if required.

## Responsive Design and Multi-Device Data

- The project contains shared stylesheets and responsive stylesheets under `assets/css/`.
- Responsive behavior should be verified at mobile, tablet, laptop, and wide-desktop widths. A stylesheet's presence does not guarantee that every page or component is fully responsive.
- Data that must stay consistent across devices should be read from and written to Cloud Firestore (or another shared backend), rather than only from browser-local storage.
- For updates to appear on other devices without refreshing, the relevant pages must subscribe to Firestore changes (for example, with Firestore `onSnapshot`) and update their UI when snapshots arrive.
- Cart data stored only in `localStorage` is browser/device-specific. Cross-device cart synchronization requires an authenticated user identity and a shared Firestore cart implementation.

## Security Notes

- Require a valid signed-in customer session before creating an order.
- Derive the order's `userId` from the authenticated Firebase user, not from a user-editable form field.
- Firestore rules should validate authentication, ownership, allowed status transitions, and protected fields.
- Admin privileges must be verified by trusted authorization data, such as a protected custom claim or a carefully secured role record.
- Do not expose service-account keys or other server-side secrets in frontend files.
- Test rules in the Firebase Emulator Suite or Firestore Rules Playground before production use.

## Troubleshooting

### “Missing or insufficient permissions”

Check that the user is signed in, the order's `userId` matches `request.auth.uid`, the document fields satisfy `firestore.rules`, and the deployed rules match the intended schema. Do not solve this by allowing unrestricted writes.

### Changes on one device do not appear on another

Confirm that both devices use the same Firebase project and that the affected data is stored in Firestore. Check that the page uses a live Firestore listener or refreshes its data after changes. Browser `localStorage` is not shared between devices.

### Layout issues on small screens

Test each page at common viewport widths, inspect overflowing containers and fixed-width elements, and verify that navigation, forms, product grids, tables, dialogs, and checkout remain usable. Update responsive CSS only after identifying the affected component.

---

For production use, verify the actual Firebase configuration, Firestore rules, and live synchronization behavior in the deployed environment.

## Storefront UI enhancements

The homepage now includes:
- A hero slideshow with 5-second automatic rotation, previous/next controls, and slide dots.
- Multi-slide hero banner management from **Admin → Hero Banner**. Use **Add Slide** to add optional slides; each additional slide needs a headline, description, and image path/URL.
- A category carousel with responsive page sizes and dot navigation.
- Product sorting by price, name, and newest first.
- A wishlist that can be toggled from product cards and filtered from the homepage.

### Wishlist storage note
Wishlist selections are currently stored in the visitor's browser (`localStorage`). They remain on that browser/device and are not synchronized between devices or accounts. Cross-device wishlist sync would require a separate authenticated Firestore wishlist implementation and corresponding security-rule deployment.

### Hero slideshow compatibility
The homepage continues to support the original `store_settings/heroBanner` document fields. The Admin Hero Banner page additionally saves a `slides` array in that same document, so existing single-banner settings remain compatible.

## Professional UI/UX Upgrade (November 2026)

This update is additive and keeps the existing BazarGO orange/navy brand palette and Firebase architecture.

### Included improvements
- Shared responsive visual layer for customer and admin pages.
- Mobile bottom navigation for storefront, cart, and order-history journeys.
- Scroll progress indicator, accessible back-to-top control, and lightweight toast notifications.
- Native product-name search suggestions populated from the live product grid.
- Recently Viewed products section on the storefront (stored locally in the current browser/device).
- Lazy loading for storefront product images and more consistent card, form, table, and dashboard styling.
- Reduced-motion support and clearer keyboard focus states.

### Notes
- Existing Firebase Authentication, Firestore listeners, order submission, stock handling, and admin role checks are retained.
- Wishlist and Recently Viewed remain browser-local in this version; cross-device sync requires an authenticated-user Firestore collection and corresponding security rules.
- This package has been syntax/structure checked locally. A live Firebase/Vercel deployment test still requires the project's own Firebase credentials and deployed environment.
