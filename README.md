# FindANCHome.com - Lightkeeper Realty Platform

A comprehensive real estate platform for North Carolina built with Next.js 15, Supabase, and Tailwind CSS. Features HUD homes, REO properties, agent CRM, and educational resources.

## Tech Stack

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS 4** - Utility-first styling
- **Supabase** - PostgreSQL database and authentication
- **Lucide React** - Icon library
- **Vercel** - Deployment platform

## Features

### Public-Facing
- Property listings (HUD, REO, foreclosures, conventional)
- Community pages for NC regions
- Agent profiles and listings
- Education center for buyers and sellers
- Property search and filtering

### Broker Dashboard
- Lead management with pipeline stages
- Client management
- Activity logging (calls, emails, texts, meetings)
- Property recommendations for leads
- Communication tools

### Admin Panel
- Property management (CRUD)
- Agent/broker management
- Lead assignment system
- Bulk property import (CSV/JSON)
- Analytics dashboard

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or pnpm
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/AIRealSolutions/findanchome.git
cd findanchome
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Database Connection (for migrations)
DATABASE_URL=your_postgresql_connection_string
```

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the site.

## Database Setup

The platform uses Supabase PostgreSQL. You'll need to create the following tables:

- `users` - User accounts with roles (end_user, broker, admin)
- `agents` - Real estate agent profiles
- `properties` - Property listings
- `communities` - NC community information
- `leads` - CRM lead management
- `clients` - Client management
- `activities` - Activity/event logging
- `news` - News articles
- `events` - Community events

See `lib/types.ts` for the complete schema definitions.

## Deployment to Vercel

### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/AIRealSolutions/findanchome)

### Manual Deployment

1. Push your code to GitHub
2. Import the repository in Vercel
3. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Deploy!

## Project Structure

```
findanchome-nextjs/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Homepage
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── lib/                   # Utilities and helpers
│   ├── supabase/         # Supabase client setup
│   ├── types.ts          # TypeScript types
│   └── utils.ts          # Utility functions
├── components/           # Reusable React components
├── public/              # Static assets
└── TODO.md              # Feature roadmap
```

## Development Roadmap

See `TODO.md` for the complete feature roadmap organized by phases:

- ✅ Phase 1: Project Setup (Complete)
- 🔄 Phase 2: Core Pages (In Progress)
- 📋 Phase 3: Authentication & User Management
- 🏢 Phase 4: Broker Dashboard
- 👨‍💼 Phase 5: Admin Panel
- 🤖 Phase 6: AI Features
- 🚀 Phase 7: Deployment

## Contributing

This is a private project for Lightkeeper Realty. For questions or support, contact the development team.

## License

Proprietary - All rights reserved by Lightkeeper Realty

---

**Lightkeeper Realty** - Your trusted HUD Buyer's Agency helping families find affordable homes in North Carolina for over 25 years.
