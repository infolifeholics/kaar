# 🌿 Kaar Ayurveda & LifeHolics

A luxury Ayurvedic e-commerce storefront with real-time product management, guest order tracking, Google Sheets CRM synchronization, and Razorpay Live payment integration. Built with **React 18**, **TypeScript**, **Tailwind CSS**, **Vite**, and **Firebase**.

---

## 💻 Local Development

```bash
# 1. Install dependencies
npm install

# 2. Start Vite local development server
npm run dev

# 3. Open in your browser
http://localhost:5173
```

---

## 🔥 Firebase CLI Commands & Setup

### 1. Firebase CLI Installation & Login

```bash
# Install Firebase CLI globally (if not already installed)
npm install -g firebase-tools

# Check version
firebase --version

# Log in to your Google / Firebase account
firebase login

# If running in a headless or remote container:
firebase login --no-localhost
```

### 2. Firebase Project Initialization

To connect or switch to your existing Firebase project (`kaar-d3bcd`):

```bash
# List all Firebase projects accessible by your account
firebase projects:list

## Initialize Firebase
firebase init

# Select existing project
firebase use kaar-d3bcd

# Verify active project
firebase project:active
```

### 3. Deploying Security Rules & Storage

The repository includes pre-configured production rules:
- `firestore.rules`: Enforces public read for published products and restricts writes to `info.lifeholics@gmail.com`.
- `storage.rules`: Protects image uploads and restricts mutations to authorized administrators.

```bash
# Deploy Firestore security rules
firebase deploy --only firestore:rules

# Deploy Firestore indexes
firebase deploy --only firestore:indexes

# Deploy Storage security rules
firebase deploy --only storage

# Deploy both Firestore & Storage rules together
firebase deploy --only firestore,storage
```

### 4. Firebase Emulators (Local Testing)

Test Firestore, Auth, and Storage locally without touching the production database:

```bash
# Start Firebase Local Emulators Suite
firebase emulators:start

# Start emulators with saved data import/export
firebase emulators:start --import=./emulator-data --export-on-exit
```

### 5. Hosting Deployment with Firebase

If you want to deploy the frontend directly to Firebase Hosting:

```bash
# 1. Build the production application
npm run build

# 2. Initialize hosting (if firebase.json is not configured)
firebase init hosting

# 3. Deploy build output (dist directory) to live Firebase Hosting
firebase deploy --only hosting
```

---

## ✨ Features & Modules

### 🔍 Smart Order Tracking & Admin Login
- Located at the user avatar / "Find my orders" modal.
- Customers enter their checkout email or mobile number to track live milestones (`Received`, `Shipped`, `Delivered`).
- Entering the designated administrator email:
  `info.lifeholics@gmail.com`
  automatically triggers the Google OAuth workflow. Unauthorized Google accounts are rejected.

### 🛍️ Blinkit-Style Collections Discovery
- Access via **Collections** in the navigation header.
- Category pills with count badges, dynamic keyword search, and responsive sort filters (Price, Newest, Bestseller).
- Quick "Add to bag" and detailed modal preview.

### 💳 Razorpay Live Payment Gateway
- Supports Credit/Debit Cards, UPI, Netbanking, and Wallets.
- Automatically calculates server-accurate cart totals.
- Logs payment references and updates order status to `PAID` upon successful checkout.

### 📊 Google Sheets Real-time CRM Sync
- Connected to Spreadsheet ID: `1couKMsGuunmNDY89HJfCXgRljxytHOqMgqDF0rGYh8k`.
- **`Cart` tab**: Synchronizes user cart activity (user ID, product ID, quantity, price, location, timestamps).
- **`Orders` tab**: Logs paid and confirmed customer orders for operations and fulfillment.

### ⚙️ Admin Dashboard & Product Management
- Accessible by `info.lifeholics@gmail.com`.
- Add, Edit, and Delete products with full attribute management (specifications, features, badges, stock).
- Permanent image uploads directly to Firebase Storage.
- Live logistics management: change order statuses (`processing`, `shipped`, `delivered`).
- Review Google Sheets synchronization queues and automated email dispatch logs.

---


## 🧪 Build, Lint & Typecheck

```bash
# Typecheck TypeScript source files
npm run typecheck

# Run ESLint validation
npm run lint

# Build production bundle
npm run build

# Preview production build locally
npm run preview
```

---

## 🚀 Deployment

### Deploy to Vercel
1. Push your repository to GitHub.
2. Import the project into Vercel.
3. Configure environment variables in the Vercel Dashboard under **Project Settings → Environment Variables**.
4. Build command: `npm run build`
5. Output directory: `dist`

### Deploy to Firebase Hosting
```bash
npm run build
firebase deploy --only hosting
```

```bash
git add .
git commit -m "Fix: fixed shipment calculation and new order details modal added"
git push 
```

---

© 2026 Kaar Ayurveda & LifeHolics. All rights reserved.
