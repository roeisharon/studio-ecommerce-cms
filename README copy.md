**Deborah Studio** is a full-stack e-commerce and content management platform built for a real ceramic design studio. It allows customers to browse and order handcrafted ceramics, submit custom order requests, and leave reviews — while giving the studio owner a complete admin panel to manage everything.

The project uses a **serverless architecture** — Firebase handles the database and authentication, Cloudinary handles media uploads, and EmailJS handles transactional emails, with no backend server required. 

Designed as a template for small creative businesses — studios, artists, makers, boutiques — that need a real online store with an admin panel, without the complexity of managing a backend server.

---

## Overview

This project gives you a complete storefront and CMS out of the box:

- Customers can browse products, add to cart, checkout, submit custom order requests, and leave reviews
- The store owner gets a hidden admin panel to manage everything — products, orders, blog posts, and reviews
- Every order triggers automatic emails to both the customer and the admin
- All media is hosted on Cloudinary, all data in Firestore, all auth via Firebase — no server to maintain

---

## Features

### Storefront
- Product catalogue with category pages and filtering
- Product detail pages with image gallery and customer reviews
- Shopping cart with persistent state (localStorage)
- Checkout with real-time stock updates on order
- Custom order request form — with image uploads, budget range, and timeline selection
- Blog with full post pages
- Responsive design across desktop, tablet, and mobile

### Admin Panel
- Hidden login — no visible link anywhere on the site. Access is granted via a **secret key sequence** configured in your `.env` file
- Full CRUD for products, blog posts, and orders
- Separate views for regular orders and custom order requests
- Review moderation — approve, unapprove, or delete customer reviews
- Product image uploads via Cloudinary

### Emails
Every order automatically sends:
- **Customer confirmation** — receipt with order summary
- **Admin notification** — full order details

Same flow for custom order requests.

---

## Tech Stack

| Layer | Technology |
|:------|:-----------|
| Frontend | React 18, Vite, TailwindCSS, Framer Motion |
| Database | Firebase Firestore |
| Authentication | Firebase Auth (email/password) |
| Media Storage | Cloudinary |
| Email | EmailJS |
| Routing | React Router v6 |
| State / Fetching | TanStack Query v5 |
| UI Components | shadcn/ui (Radix UI) |

---

## Project Structure

```
├── src/
│   ├── api/
│   │   ├── apiClient.js        ← unified API client (Firestore + Auth + Cloudinary)
│   │   └── entities.js
│   ├── firebase/
│   │   ├── config.js
│   │   ├── firestore.js        ← Firestore CRUD helpers (client-side sorting, ID lookups)
│   │   ├── auth.js
│   │   ├── storage.js          ← Cloudinary upload helper
│   │   └── index.js
│   ├── lib/
│   │   ├── AuthContext.jsx
│   │   ├── emailService.js     ← order + custom order emails
│   │   └── utils.js
│   ├── hooks/
│   │   └── useKonamiCode.js    ← secret admin access hook
│   ├── pages/                  ← all public + admin pages
│   └── components/
│       ├── home/               ← homepage sections
│       ├── products/           ← product grid, filters, reviews
│       ├── shared/             ← Header, Footer, Nav, FloatingCart
│       └── ui/                 ← shadcn/ui primitives
├── email-templates/
│   ├── customer-receipt.html   ← paste into EmailJS customer template
│   └── admin-notification.html ← paste into EmailJS admin template
├── .env.example
└── .gitignore
```

---

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/your-username/your-repo.git
cd your-repo
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Fill in all values:

```env
# Firebase
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

# Cloudinary
VITE_CLOUDINARY_CLOUD_NAME=
VITE_CLOUDINARY_UPLOAD_PRESET=

# EmailJS
VITE_EMAILJS_SERVICE_ID=
VITE_EMAILJS_ADMIN_TEMPLATE_ID=
VITE_EMAILJS_CUSTOMER_TEMPLATE_ID=
VITE_EMAILJS_PUBLIC_KEY=
VITE_ADMIN_EMAIL=

# Admin access — comma-separated key sequence (e.g. keyboard key names)
VITE_ADMIN_SECRET_SEQUENCE=
```

### 3. Set up Firebase

1. [console.firebase.google.com](https://console.firebase.google.com) → new project
2. **Firestore Database** → Create → start in test mode
3. **Authentication** → Email/Password → Enable
4. **Project Settings** → Web App → copy config values to `.env`
5. **Authentication → Users** → Add user (your admin email + password)
6. Apply the Firestore security rules below

### 4. Set up Cloudinary

1. [cloudinary.com](https://cloudinary.com) → free signup
2. Dashboard → copy **Cloud Name** to `.env`
3. Settings → Upload → Upload Presets → Add preset
   - Signing mode: **Unsigned**
   - Set a preset name and add it to `.env`

### 5. Set up EmailJS

1. [emailjs.com](https://emailjs.com) → free signup (200 emails/month)
2. **Email Services** → connect your email provider → copy Service ID
3. **Email Templates** → create 2 templates using the files in `email-templates/`
   - Set **To Email** field to `{{to_email}}` in both
4. **Account → API Keys** → copy Public Key
5. Add all values to `.env`

### 6. Run

```bash
npm run dev
```

- Store: [http://localhost:5173](http://localhost:5173)
- Admin: trigger the key sequence you set in `VITE_ADMIN_SECRET_SEQUENCE`

---

## Firestore Security Rules

Paste into Firebase Console → Firestore → Rules → Publish:

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /products/{id} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /blog_posts/{id} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /orders/{id} {
      allow create: if true;
      allow read, update, delete: if request.auth != null;
    }
    match /personal_orders/{id} {
      allow create: if true;
      allow read, update, delete: if request.auth != null;
    }
    match /reviews/{id} {
      allow create: if true;
      allow read: if resource.data.is_approved == true || request.auth != null;
      allow update, delete: if request.auth != null;
    }
  }
}
```

---

## Deploying to Vercel

```bash
git add .
git commit -m "initial commit"
git push
```

1. [vercel.com](https://vercel.com) → Add New Project → import your repo
2. No root directory change needed — Vite is at the root
3. Add all `.env` variables in Vercel → Settings → Environment Variables
4. Redeploy once so variables take effect
5. Add your Vercel domain to Firebase → Authentication → **Authorized Domains**

From then on: `git push` → live in ~30 seconds.

---

## Customization

To adapt this template for your own store:

| What | Where |
|:-----|:------|
| Brand name, colors, fonts | `tailwind.config.js`, `src/index.css`, component files |
| Product categories | `src/App.jsx` (routes), `src/components/shared/Header.jsx` (nav) |
| Currency symbol | `src/pages/Checkout.jsx`, `src/lib/emailService.js` |
| Shipping threshold and cost | `src/pages/Checkout.jsx` |
| Contact details, social links, map | `src/components/shared/Footer.jsx` |
| Email template design | `email-templates/` — paste HTML into EmailJS |
| Admin secret sequence | `VITE_ADMIN_SECRET_SEQUENCE` in `.env` |

---

## Firestore Collections

| Collection | Description |
|:-----------|:------------|
| `products` | Store catalogue |
| `blog_posts` | Blog articles |
| `orders` | Customer checkout orders |
| `personal_orders` | Custom order requests |
| `reviews` | Customer reviews (approval workflow) |

---

## Development Progress

| Feature | Status |
|:--------|:------:|
| Product catalogue with categories | ✅ Done |
| Shopping cart and checkout | ✅ Done |
| Real-time stock updates | ✅ Done |
| Custom order requests | ✅ Done |
| Customer reviews + moderation | ✅ Done |
| Blog | ✅ Done |
| Admin panel (full CRUD) | ✅ Done |
| Cloudinary image uploads | ✅ Done |
| Firebase Auth + secret admin access | ✅ Done |
| Transactional emails (EmailJS) | ✅ Done |
| Production deployment (Vercel) | 🚧 In progress |
| Payment integration | 🔜 Planned |

---

## Author

[Roei Sharon](https://github.com/roeisharon)
📍 Tel Aviv University — Computer Science Student