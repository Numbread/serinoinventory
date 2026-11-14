# 📦 Inventory Management System (InventoryMS)

A modern full-stack Inventory Management System built for a school thesis/defense presentation. Powered by React, Node.js + Express, and Supabase (PostgreSQL) in the cloud.

---

## 🚀 Key Features

1. **🔐 Authentication & Protected Routes:**
   - JWT-based authentication with bcrypt password hashing.
   - Protected client-side routing and automatic session management.

2. **📦 Product Management:**
   - Full CRUD: Add, View, Edit, and Delete inventory items.
   - Live name-based search and inventory counter.
   - Reorder level threshold tracking with automated Low-Stock badges.

3. **🏷️ Category Management:**
   - Classification grouping for all products.
   - Foreign-key protection: Prevents category deletion if products are assigned.

4. **⚡ Stock In / Stock Out:**
   - Interactive console with dual mode switcher (Receive vs. Dispatch).
   - Real-time stock calculation preview.
   - **Over-dispatch protection:** Blocks Stock OUT if requested quantity exceeds on-hand inventory.
   - Comprehensive audit movement logs.

5. **📊 Executive Dashboard:**
   - Summary metric cards (Total Products, Categories, Low-Stock alerts).
   - Priority Low-Stock Action table with direct restock links.
   - 5 most recent warehouse transaction logs.

---

## 🛠️ Tech Stack

- **Frontend:** React 18, Vite, React Router v6, Axios, Vanilla Modern CSS
- **Backend:** Node.js, Express, JSON Web Tokens (JWT), Bcrypt
- **Database:** Supabase (Cloud PostgreSQL) via `@supabase/supabase-js`
- **Architecture:** RESTful API with parameterization and auth middleware

---

## 📂 Project Structure

```text
inventory/
├─ client/
│  ├─ src/
│  │  ├─ components/ (Navbar, ProtectedRoute)
│  │  ├─ pages/ (Login, Dashboard, Products, Categories, Stock)
│  │  ├─ api.js (Axios instance with JWT interceptor)
│  │  ├─ App.css (Global design system)
│  │  ├─ App.jsx (Route definitions)
│  │  └─ main.jsx
│  ├─ package.json
│  └─ vite.config.js
└─ server/
   ├─ controllers/ (auth, category, product, stock, dashboard)
   ├─ middleware/ (authMiddleware)
   ├─ routes/ (auth, category, product, stock, dashboard)
   ├─ db.js (Supabase client initialization)
   ├─ schema.sql (PostgreSQL schema & seed data)
   ├─ server.js (Express server entry point)
   ├─ package.json
   └─ .env.example
```

---

## ⚙️ Quick Start Setup

### 1. Database Setup (Supabase)
1. Create a free project at [supabase.com](https://supabase.com).
2. Go to the **SQL Editor** tab and execute the SQL script in `inventory/server/schema.sql`.

### 2. Configure Environment Variables
Inside `inventory/server/`, create a `.env` file based on `.env.example`:
```env
PORT=5000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-secret-key
JWT_SECRET=your_jwt_secret_key
```

### 3. Install Dependencies
```bash
# Server dependencies
cd inventory/server
npm install

# Client dependencies
cd ../client
npm install
```

### 4. Run the Application
In terminal 1 (Backend):
```bash
cd inventory/server
npm start
```

In terminal 2 (Frontend):
```bash
cd inventory/client
npm run dev
```

Open your browser at `http://localhost:5173`.

### Default Admin Credentials:
- **Username:** `admin`
- **Password:** `admin123`
