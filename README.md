# VivaahHub: Where Elegance Meets Joy

Wedding planning platform (MERN stack). **No `.env` files required** for local development — defaults are built in.

## Quick start (open in browser)

### 1. Install dependencies (once)

```bash
cd /Users/shivani.e1/Downloads/VivaahHub
npm run install:all
```

Or separately:

```bash
cd backend && npm install
cd ../vivaahhub && npm install
```

### 2. Start MongoDB

The API needs MongoDB. Use either:

- **Local:** install MongoDB and ensure it is running on `mongodb://127.0.0.1:27017`
- **Atlas:** set `MONGO_URI` only if you use a cloud database (optional override)

Default database URL (no `.env` needed): `mongodb://127.0.0.1:27017/vivaahhub`

### 3. Run the app

**Terminal 1 — API:**

```bash
cd backend
npm start
```

**Terminal 2 — UI (opens browser automatically):**

```bash
cd vivaahhub
npm run dev
```

Or from the project root:

```bash
npm run dev
```

Open **http://localhost:5173** if the browser does not open on its own.

### Sign-in without SMS

In development, OTP codes are printed in the **backend terminal**, not sent by text:

```text
Mock SMS to +919876543210: Your OTP is 123456
```

Use an Indian phone format: `+919876543210` (10 digits after +91, starting with 6–9).

## Built-in defaults (no `.env`)

| Setting | Default |
|--------|---------|
| API URL | `http://localhost:5001` (5001 avoids macOS AirPlay on 5000) |
| Frontend | `http://localhost:5173` |
| MongoDB | `mongodb://127.0.0.1:27017/vivaahhub` |
| JWT secret | local dev string (change for production) |

Optional: create `backend/.env` or `vivaahhub/.env` only if you need Atlas, Cloudinary, or Twilio.

## Project structure

```
VivaahHub/
├── backend/     # Express API (port 5001)
└── vivaahhub/   # React + Vite UI (port 5173)
```

## License

MIT
