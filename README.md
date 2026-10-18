# matcha

A full-stack World Recipes Hub pulling real recipe data from TheMealDB, with cuisine/category browsing, search, user submissions, ratings/comments, and an admin dashboard.

Built with ForgeAI Builder — MERN stack (MongoDB, Express, React + Vite, Node).

## Run locally

```bash
npm install        # server dependencies
npm run build      # installs client deps and builds the React app
npm start          # serves the API + built client on http://localhost:4000
```

For live-reload frontend development, also run the Vite dev server:

```bash
npm --prefix client run dev    # http://localhost:5173 (proxies /api to :4000)
```

## Database

Copy `.env.example` to `.env` and set `MONGODB_URI` (a free MongoDB Atlas cluster works).
The site loads without a database, but API routes need one.

## Deploy

Any Node host works. On Render: build command `npm install && npm run build`,
start command `npm start`, and set `MONGODB_URI` in the environment settings.
