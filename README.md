# Student Dashboard — Backend Setup Guide

Your frontend (HTML/CSS/JS) now talks to this Express + PostgreSQL API
instead of storing students in memory.

## 1. Create a cloud PostgreSQL database

Pick one (all have free tiers):

- **Supabase** — supabase.com → New Project → Settings → Database →
  copy the "Connection string" (URI). Use the "Transaction" pooler
  connection if given the option.
- **Railway** — railway.app → New Project → "Provision PostgreSQL" →
  click the Postgres service → "Connect" tab → copy the
  "Postgres Connection URL".
- **Render** — render.com → New → PostgreSQL → after it's created,
  copy the "External Database URL".

## 2. Create the table

Open your provider's SQL editor/console and run the contents of
`schema.sql` (also pasted below):

```sql
CREATE TABLE IF NOT EXISTS students (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    age INTEGER NOT NULL,
    course TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
```

## 3. Configure the backend

```bash
cd backend
cp .env.example .env
```

Open `.env` and paste your real connection string into `DATABASE_URL`.

## 4. Install dependencies and run

```bash
npm install
npm start
```

You should see:

```
Connected to PostgreSQL successfully.
Server running on http://localhost:5000
```

Visit `http://localhost:5000` in a browser — you should see
"Student Dashboard API is running."

## 5. Point the frontend at the backend

In `StudentDashboard.js`, this line already points to your local server:

```js
const API_URL = "http://localhost:5000/api/students";
```

Just open `StudentDashboard.html` in your browser (or serve it with
Live Server) — it will now load, add, edit, and delete real rows in
your PostgreSQL database.

## 6. Deploying the backend so the site works online

If you host the frontend somewhere public (Netlify, Vercel, GitHub
Pages), the backend also needs to be public — `localhost` only works
on your own machine. Easiest options:

- **Railway** or **Render**: connect this `backend` folder as a Web
  Service, set the `DATABASE_URL` and `PORT` environment variables
  there, deploy, and you'll get a public URL like
  `https://your-app.up.railway.app`.
- Update `API_URL` in `StudentDashboard.js` to that public URL
  (keeping `/api/students` at the end).
- Set `FRONTEND_ORIGIN` in your backend's environment variables to
  your frontend's real URL for tighter CORS security (or leave `*`
  while testing).

## API Reference

| Method | Endpoint             | Body                          | Description         |
|--------|-----------------------|--------------------------------|----------------------|
| GET    | /api/students         | —                               | List all students   |
| POST   | /api/students         | `{ name, age, course }`         | Add a student        |
| PUT    | /api/students/:id     | `{ name, age, course }`         | Update a student      |
| DELETE | /api/students/:id     | —                               | Delete a student      |