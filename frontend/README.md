# Construction Store — Frontend

This is a Next.js + Bootstrap frontend scaffold for the Construction Store.

Setup

1. Open a terminal in `frontend`.
2. Install dependencies:

```bash
npm install
```

3. Run the dev server:

```bash
npm run dev
```

The app expects the backend API to be available at `https://localhost:7242` with endpoints:

- `GET /api/products` — list of products
- `GET /api/products/{id}` — single product

Notes

- This scaffold uses the pages router for simplicity.
- Add real images into `public/` (e.g., `hero-banner.jpg`, product images).
