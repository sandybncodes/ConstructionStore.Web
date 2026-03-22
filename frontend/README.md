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

The app expects the backend API to expose these endpoints:

- `GET /api/products` — list of products
- `GET /api/products/{id}` — single product

API base URL configuration

- Local development is defined in `.env.local` as `https://localhost:7242`
- Production is defined in `.env.production` as `https://constructionstore-api.onrender.com`
- The frontend now requires `NEXT_PUBLIC_API_BASE_URL`; it no longer falls back to hardcoded URLs at runtime

Render deployment

- A Render blueprint is defined in the repository root `render.yaml`
- It deploys the frontend from `ConstructionStore.Web/frontend`
- It sets `NEXT_PUBLIC_API_BASE_URL=https://constructionstore-api.onrender.com`
- If this frontend is already deployed in the Render dashboard instead of via blueprint, set the same environment variable there manually

Notes

- This scaffold uses the pages router for simplicity.
- Add real images into `public/` (e.g., `hero-banner.jpg`, product images).
