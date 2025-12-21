# ☕ My Coffee - Starbucks Style Demo (Cloudflare Workers Edition)

A modern coffee shop web application inspired by Starbucks, built with **Hono**, **Cloudflare Workers**, **D1**, **Auth0**, and **Stripe**. This project showcases a fully functional server-side rendered (SSR) e-commerce experience.

![Project Status](https://img.shields.io/badge/status-active-green)
![Hono](https://img.shields.io/badge/Hono-4.x-FF0055?logo=hono&logoColor=white)
![Cloudflare Workers](https://img.shields.io/badge/Cloudflare_Workers-v3-F38020?logo=cloudflare-workers&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-06B6D4?logo=tailwindcss&logoColor=white)

---

## ✨ Features

- 🏠 **Home Page** - Server-side rendered hero section and featured products
- 🛒 **Product Catalog** - Browse coffee, tea, food, and merchandise (managed via JSON)
- 🛍️ **Shopping Cart** - Manage items with persistency via cookies
- 💳 **Stripe Integration** - Secure checkout flow with Stripe Checkout and Webhooks
- 👤 **Auth0 Authentication** - Secure OIDC-based user login and profile management
- 📜 **Order History** - Persistent order tracking using **Cloudflare D1** (SQLite)
- 📱 **Responsive Design** - Optimized for desktop and mobile using Tailwind CSS v4

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| [Hono](https://hono.dev/) | Ultrafast web framework for the Edges |
| [Cloudflare Workers](https://workers.cloudflare.com/) | Serverless execution environment |
| [Cloudflare D1](https://developers.cloudflare.com/d1/) | Serverless SQL database (SQLite) for orders |
| [Auth0](https://auth0.com/) | Identity and Access Management (OIDC) |
| [Stripe](https://stripe.com/) | Payment processing and checkout |
| [Tailwind CSS v4](https://tailwindcss.com/) | Utility-first CSS framework |

---

## 📋 Prerequisites

- **Node.js** (v18+)
- **Cloudflare Account** (for D1 and Workers deployment)
- **Stripe Account** (for payments)
- **Auth0 Account** (for authentication)

---

## 🚀 Getting Started

### 1. Installation

```bash
git clone https://github.com/luckpoint/my-cafe-demo.git
cd my-cafe-demo
npm install
```

### 2. Environment Variables

Create a `.dev.vars` file for local development:

```env
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-client-secret
AUTH0_BASE_URL=http://localhost:8787
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 3. Database Setup (D1)

Initialize the local D1 database:

```bash
npx wrangler d1 execute my-cafe-demo-db --local --file=./migrations/0001_create_orders_table.sql
```

### 4. Running Locally

```bash
npm run dev
```

The application will be available at `http://localhost:8787`.

---

## 📁 Project Structure

```
my-cafe-demo/
├── src/
│   ├── components/         # Hono JSX components (Layout, Header, Footer, etc.)
│   ├── routes/             # Hono route handlers (home, products, cart, api, etc.)
│   ├── services/           # Business logic (orderService, productService, stripeService)
│   ├── types/              # TypeScript definitions
│   ├── middleware/         # Custom middlewares
│   └── index.tsx           # Application entry point & Hono app configuration
├── public/
│   ├── css/                # Tailwind CSS output
│   └── images/             # Static assets
├── migrations/             # D1 database migration files
├── db.json                 # Product data source
├── wrangler.json           # Cloudflare Workers configuration
└── package.json            # Dependencies and scripts
```

---

## 🏗️ Deployment

To deploy to Cloudflare Workers:

```bash
npm run deploy
```

> **Note:** Ensure you have configured the D1 database and secret variables in the Cloudflare Dashboard or via `wrangler secret`.

---

## 📸 Screenshots

*(Add your screenshots here)*

---

## 📄 License

This project is licensed under the **ISC License**.

---

<p align="center">
  Made with ☕ and Hono
</p>
