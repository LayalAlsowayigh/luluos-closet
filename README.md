# Luluo's Closet

> AI-powered personal styling — your digital wardrobe, curated by intelligence.

## Tech Stack

| Layer | Tool |
|---|---|
| Framework | Next.js 15 (App Router) |
| Auth + Google OAuth | Clerk |
| Database | Drizzle ORM + Neon PostgreSQL |
| AI | Anthropic Claude API |
| UI | Tailwind CSS v4 |
| Deploy | Vercel |

## Features

- **Google Sign-In** via Clerk
- **Photo Wardrobe** — upload real clothing photos
- **AI Analysis** — Claude Vision auto-tags category, color, style
- **Background Removal** — one-click (connect remove.bg for full effect)
- **AI Outfit Generator** — Claude picks outfits from your actual photos
- **Virtual Try-On** — connect Fashn.ai for photorealistic results
- **Streaming Style Chat** — real-time AI stylist responses
- **Outfit History** — all generated looks saved to database

## Getting Started

### 1. Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/luluos-closet.git
cd luluos-closet
npm install
```

### 2. Environment Variables

```bash
cp .env.example .env.local
```

Fill in your `.env.local`:

```env
# Clerk — https://clerk.com (free)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/wardrobe
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/wardrobe

# Neon PostgreSQL — https://neon.tech (free tier)
DATABASE_URL=postgresql://...

# Anthropic — https://console.anthropic.com
ANTHROPIC_API_KEY=sk-ant-...
```

### 3. Set Up Database

```bash
npm run db:generate
npm run db:migrate
```

### 4. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deploy to Vercel

```bash
npm i -g vercel
vercel
```

Add all env variables in Vercel dashboard → Settings → Environment Variables.

## Optional Integrations

| Feature | Service | Notes |
|---|---|---|
| Background Removal | [remove.bg](https://remove.bg) | Free 50/month |
| Virtual Try-On | [Fashn.ai](https://fashn.ai) | Paid API |
| File Storage | [Uploadthing](https://uploadthing.com) | For storing images in cloud |

## Project Structure

```
src/
├── app/
│   ├── (auth)/sign-in & sign-up   ← Clerk auth pages
│   ├── (dashboard)/               ← Protected pages
│   │   ├── wardrobe/              ← Photo closet
│   │   ├── style/                 ← AI outfit generator
│   │   ├── chat/                  ← Streaming stylist chat
│   │   └── profile/               ← User profile & stats
│   ├── api/                       ← API routes
│   │   ├── items/                 ← CRUD wardrobe items
│   │   ├── outfits/               ← Generate + history
│   │   ├── chat/                  ← Streaming chat
│   │   └── analyze/               ← AI photo analysis
│   └── page.tsx                   ← Landing page
├── components/
├── db/                            ← Drizzle schema + migrations
├── hooks/                         ← SWR data hooks
├── lib/                           ← AI, utils, validators
└── types/                         ← TypeScript types
```

MIT License © Luluo's Closet
