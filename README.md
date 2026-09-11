# ICERP Frontend

This project was configured to run as an Electron desktop app on top of a Vite + React frontend.

## Development

Run the Vite dev server and open the Electron window together:

```bash
npm run electron:dev
```

If you only need the Vite dev server:

```bash
npm run dev
```

## Production build

```bash
npm run build
npm run electron
```

The Electron main process loads the built `dist/index.html` when it exists; otherwise it falls back to the Vite dev server at `http://localhost:5173`.

```
icerp_frontend
├─ .env
├─ .env.example
├─ electron
│  └─ main.js
├─ eslint.config.js
├─ index.html
├─ package-lock.json
├─ package.json
├─ public
│  ├─ favicon.svg
│  └─ icons.svg
├─ README.md
├─ src
│  ├─ app
│  │  ├─ layouts
│  │  │  └─ AppLayout.tsx
│  │  └─ providers
│  │     ├─ languageContext.ts
│  │     ├─ LanguageProvider.tsx
│  │     └─ useLanguage.ts
│  ├─ App.css
│  ├─ App.tsx
│  ├─ assets
│  │  ├─ hero.png
│  │  ├─ react.svg
│  │  └─ vite.svg
│  ├─ components
│  │  ├─ alert-dialog
│  │  │  ├─ ConfirmDialog.css
│  │  │  └─ ConfirmDialog.tsx
│  │  ├─ drawer
│  │  │  ├─ Drawer.css
│  │  │  └─ Drawer.tsx
│  │  ├─ newbtn
│  │  │  ├─ newBtn.css
│  │  │  └─ newBtn.tsx
│  │  ├─ select
│  │  │  ├─ Select.css
│  │  │  └─ Select.tsx
│  │  ├─ sidebar
│  │  │  ├─ Sidebar.css
│  │  │  └─ Sidebar.tsx
│  │  ├─ supplier-input
│  │  │  ├─ Supplierinput.css
│  │  │  └─ SupplierInput.tsx
│  │  └─ topbar
│  │     ├─ Topbar.css
│  │     └─ Topbar.tsx
│  ├─ features
│  │  ├─ auth
│  │  │  ├─ api.ts
│  │  │  ├─ session.ts
│  │  │  └─ types.ts
│  │  ├─ rfq
│  │  │  ├─ api.ts
│  │  │  ├─ queries.ts
│  │  │  └─ type.ts
│  │  └─ supplier
│  │     ├─ api.ts
│  │     ├─ queries.ts
│  │     └─ types.ts
│  ├─ index.css
│  ├─ lib
│  │  └─ api
│  │     ├─ auth.ts
│  │     ├─ client.ts
│  │     └─ supplier.ts
│  ├─ locales
│  │  ├─ en.ts
│  │  ├─ index.ts
│  │  └─ zh.ts
│  ├─ main.tsx
│  └─ pages
│     ├─ customer
│     │  ├─ Customer.css
│     │  ├─ Customer.tsx
│     │  └─ NewCustomer.tsx
│     ├─ dashboard
│     │  ├─ Dashboard.css
│     │  └─ Dashboard.tsx
│     ├─ inventory
│     │  ├─ Inventory.css
│     │  ├─ Inventory.tsx
│     │  └─ NewInventory.tsx
│     ├─ login
│     │  ├─ Login.css
│     │  └─ Login.tsx
│     ├─ order
│     │  ├─ NewOrder.tsx
│     │  ├─ Order.css
│     │  └─ Order.tsx
│     ├─ profile
│     │  ├─ Profile.css
│     │  └─ Profile.tsx
│     ├─ purchase
│     │  ├─ NewPurchase.tsx
│     │  ├─ Purchase.css
│     │  └─ Purchase.tsx
│     ├─ rfq
│     │  ├─ Rfq.css
│     │  ├─ Rfq.tsx
│     │  ├─ RfqDraw.tsx
│     │  ├─ RfqNew.tsx
│     │  └─ types.ts
│     └─ supplier
│        ├─ Supplier.css
│        ├─ Supplier.tsx
│        ├─ SupplierDraw.tsx
│        └─ SupplierNew.tsx
├─ tsconfig.app.json
├─ tsconfig.json
├─ tsconfig.node.json
└─ vite.config.ts

```