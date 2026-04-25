# Quick Setup Guide

## Step 1 — Services to create (all free tiers)

### A. Clerk (Authentication + Google Login)
1. Go to https://clerk.com → Sign Up → Create Application
2. Name it "Luluos Closet"
3. Enable **Google** as a social provider
4. Copy your keys from Dashboard → API Keys

### B. Neon (PostgreSQL Database)
1. Go to https://neon.tech → Sign Up
2. Create a new project → "luluos-closet"
3. Copy the **Connection String** (starts with `postgresql://`)

### C. Anthropic (AI)
1. Go to https://console.anthropic.com
2. API Keys → Create Key
3. Copy the key (starts with `sk-ant-`)

---

## Step 2 — Local setup

```bash
# Install dependencies
npm install

# Create env file
cp .env.example .env.local
# → Fill in your 3 keys from Step 1

# Push database schema
npm run db:generate
npm run db:migrate

# Start dev server
npm run dev
```

Open http://localhost:3000

---

## Step 3 — Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit — Luluo's Closet"

# Create a repo on github.com first, then:
git remote add origin https://github.com/YOUR_USERNAME/luluos-closet.git
git push -u origin main
```

---

## Step 4 — Deploy to Vercel (get a live link)

1. Go to https://vercel.com → Import Git Repository
2. Select your `luluos-closet` repo
3. Add Environment Variables (same 3 keys from Step 1):
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
   - `NEXT_PUBLIC_CLERK_SIGN_IN_URL` = `/sign-in`
   - `NEXT_PUBLIC_CLERK_SIGN_UP_URL` = `/sign-up`
   - `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` = `/wardrobe`
   - `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` = `/wardrobe`
   - `DATABASE_URL`
   - `ANTHROPIC_API_KEY`
4. Click Deploy → Vercel gives you a live URL like `luluos-closet.vercel.app`

---

## Step 5 — Tell Clerk your live URL

In Clerk Dashboard → Domains → Add `https://luluos-closet.vercel.app`

Done! Your app is live.
