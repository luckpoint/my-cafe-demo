# ☕ My Coffee - Starbucks Style Demo

A modern coffee shop web application inspired by Starbucks, built with Vite, Vanilla JavaScript, and Tailwind CSS v4. This demo project showcases a fully functional e-commerce experience with product browsing, cart management, and user authentication.

![Project Status](https://img.shields.io/badge/status-demo-green)
![Vite](https://img.shields.io/badge/Vite-7.x-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-06B6D4?logo=tailwindcss&logoColor=white)

---

## ✨ Features

- 🏠 **Home Page** - Hero section with call-to-action and feature highlights
- 🛒 **Product Catalog** - Browse coffee, tea, food, and merchandise
- 🔍 **Search & Filter** - Search products by name and filter by category
- 📄 **Product Details** - View detailed product information with size selection
- 🛍️ **Shopping Cart** - Add items, update quantities, and manage your order
- 👤 **User Profile** - View user information (demo authentication)
- 📱 **Responsive Design** - Optimized for desktop and mobile devices
- 💾 **Persistent Cart** - Cart data stored in LocalStorage

---

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| [Vite](https://vitejs.dev/) | 7.x | Build tool and development server |
| Vanilla JavaScript | ES2020+ | Core application logic (ES Modules) |
| [Tailwind CSS](https://tailwindcss.com/) | 4.x | Utility-first CSS framework |
| [Axios](https://axios-http.com/) | 1.x | HTTP client for API requests |
| [json-server](https://github.com/typicode/json-server) | 1.x | Mock REST API server |

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher recommended)
- **npm** (v9.0.0 or higher) or **yarn**

---

## 🚀 Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/luckpoint/my-cafe-demo.git
   cd my-cafe-demo
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

---

## 💻 Running the Application

You need to run **two servers** simultaneously: the Vite development server and the json-server for the mock API.

### Option 1: Run in separate terminals

**Terminal 1 - Start the mock API server:**

```bash
npm run server
```

This starts json-server on `http://localhost:3001`

**Terminal 2 - Start the development server:**

```bash
npm run dev
```

This starts the Vite dev server on `http://localhost:5173`

### Option 2: Run both concurrently

You can use tools like `concurrently` or simply open two terminal windows/tabs.

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run server` | Start json-server on port 3001 |

---

## 📁 Project Structure

```
my-cafe-demo/
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── Header.js       # Navigation header
│   │   └── Footer.js       # Page footer
│   ├── pages/              # Page-specific JavaScript
│   │   ├── home.js         # Home page logic
│   │   ├── products.js     # Product listing logic
│   │   ├── product-detail.js # Product detail page
│   │   ├── cart.js         # Shopping cart logic
│   │   └── profile.js      # User profile page
│   ├── services/           # API communication layer
│   │   ├── api.js          # Axios instance configuration
│   │   └── productService.js # Product-related API calls
│   ├── utils/              # Utility functions
│   │   ├── auth.js         # Authentication helpers
│   │   └── cart.js         # Cart management utilities
│   ├── index.css           # Global styles with Tailwind
│   └── main.js             # Application entry point
├── public/
│   └── images/             # Static image assets
├── index.html              # Home page
├── products.html           # Product listing page
├── product-detail.html     # Product detail page
├── cart.html               # Shopping cart page
├── profile.html            # User profile page
├── db.json                 # Mock database for json-server
├── vite.config.js          # Vite configuration
├── package.json            # Project dependencies
└── Design.md               # Design specifications
```

---

## 🗺️ Available Pages & Routes

| Page | Route | Description | Auth Required |
|------|-------|-------------|---------------|
| Home | `/` or `/index.html` | Landing page with hero section | ❌ |
| Products | `/products.html` | Product catalog with search & filter | ❌ |
| Product Detail | `/product-detail.html?id={id}` | Individual product page | ❌ |
| Cart | `/cart.html` | Shopping cart management | ✅ |
| Profile | `/profile.html` | User profile information | ✅ |

---

## 🔐 Demo Authentication

This project uses a simplified demo authentication system stored in LocalStorage.

### Demo Credentials

| Field | Value |
|-------|-------|
| Name | Demo User |
| Email | demo@example.com |

### How to Login

1. Click the **Login** button in the header
2. You will be automatically logged in as "Demo User"
3. Access protected pages (Cart, Profile)

### How to Logout

1. Click on your profile avatar in the header
2. Select **Logout**

> **Note:** This is a demo authentication system. In a production environment, you would implement proper authentication with a backend server.

---

## 📊 API Endpoints

The json-server provides the following REST API endpoints on `http://localhost:3001`:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/products` | Get all products |
| GET | `/products/:id` | Get product by ID |
| GET | `/products?category={category}` | Filter by category |
| GET | `/products?q={query}` | Search products |

### Product Categories

- `coffee` - Coffee beverages
- `tea` - Tea beverages
- `food` - Food items
- `merchandise` - Merchandise

---

## 📸 Screenshots

### Home Page
*Hero section with featured content and call-to-action buttons*

### Products Page
*Product grid with search bar and category filters*

### Product Detail
*Product information with size selection and add-to-cart functionality*

### Shopping Cart
*Cart items with quantity controls and total calculation*

> 💡 **Tip:** Add actual screenshots by placing images in the repository and updating the paths above.

---

## 🎨 Design

The application follows a Starbucks-inspired design with:

- **Primary Color:** Green (`#00704A`)
- **Clean, modern UI** with card-based layouts
- **Responsive grid system** for product displays
- **Size-based pricing** (Short, Tall, Grande, Venti)

For detailed design specifications, see [Design.md](./Design.md).

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **ISC License**.

---

## 🙏 Acknowledgments

- Design inspired by [Starbucks](https://www.starbucks.com/)
- Product images from [Unsplash](https://unsplash.com/)
- Icons and avatars from [UI Avatars](https://ui-avatars.com/)

---

<p align="center">
  Made with ☕ and 💚
</p>
