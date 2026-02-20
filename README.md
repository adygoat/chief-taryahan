Chief Taryahan

A modern Next.js 16 application built with:

⚡ Next.js (App Router)

⚛️ React 19

🎨 Tailwind CSS v4

🧩 shadcn/ui + Radix UI

📝 React Hook Form + Zod validation

📊 Recharts

🌙 next-themes

🔔 Sonner (toasts)

🚀 Getting Started
1️⃣ Install dependencies

This project uses pnpm (recommended since pnpm-lock.yaml exists).

pnpm install

Or if using npm:

npm install
2️⃣ Run development server
pnpm dev

Then open:

http://localhost:3000
3️⃣ Build for production
pnpm build
pnpm start
🏗 Tech Stack
Framework

Next.js 16

React 19

TypeScript (strict mode enabled)

UI

Tailwind CSS v4

shadcn/ui (New York style preset)

Radix UI primitives

Lucide icons

Recharts (data visualization)

Forms & Validation

React Hook Form

Zod

Styling

Tailwind CSS v4 with PostCSS

CSS Variables enabled

📁 Project Structure (Suggested)
app/                 # Next.js App Router pages
components/          # UI & feature components
components/ui/       # shadcn UI components
lib/                 # Utility functions
hooks/               # Custom hooks
public/              # Static assets

Aliases configured:

@/components
@/lib
@/hooks
⚙️ Configuration Notes
Next.js Config

TypeScript build errors are ignored (use cautiously)

Images are unoptimized (useful for static hosting)

If deploying to production, consider:

Removing ignoreBuildErrors

Enabling image optimization

🎨 shadcn/ui Setup

This project uses:

Style: new-york

RSC enabled

TSX enabled

Neutral base color

Lucide icon library

To add new components:

npx shadcn-ui@latest add button
🧪 Linting
pnpm lint
📊 Features

Update this section depending on your app functionality. Example:

Authentication

Dashboard

Data visualization

Forms with validation

Theme switching

Responsive UI

🚀 Deployment

Works with:

Vercel (recommended)

Netlify

Any Node.js hosting

Static hosting

🛠 Recommended Improvements

Add .env.example

Add ESLint + Prettier config

Enable strict TypeScript build checking

Add CI workflow (GitHub Actions)

📄 License

MIT
