# Meal Planning System

A modern web application for managing weekly meal plans, recipes, and ratings. Built with Vite, React, TypeScript, Tailwind CSS, and Convex.

## Overview

This system helps plan vegetarian meals for a household, tracking:
- **Weekly meal plans** (Sunday-Saturday)
- **Recipe collection** (tried recipes and to-try list)
- **Meal ratings and feedback**

All data is stored in Convex (real-time database) and managed via Claude Code.

## Tech Stack

- **Frontend**: Vite 6, React 18, TypeScript
- **Styling**: Tailwind CSS 4, shadcn/ui components
- **Database**: Convex (real-time backend)
- **Data Management**: Claude Code (via Convex mutations)

## Project Structure

```
meal-plan/
├── src/                    # Frontend source
│   ├── components/         # React components
│   ├── pages/             # Page components
│   ├── lib/               # Utilities
│   └── main.tsx           # App entry point
├── convex/                # Convex backend
│   ├── schema.ts          # Database schema
│   ├── weeklyPlans.ts     # Weekly plan queries/mutations
│   ├── meals.ts           # Meal queries/mutations
│   ├── recipes.ts         # Recipe queries/mutations
│   └── ratings.ts         # Rating queries/mutations
├── scripts/               # Utility scripts
│   ├── migrate-data.ts    # One-time data migration
│   └── clear-data.ts      # Clear database (for testing)
├── archive/               # Old markdown files (migrated to DB)
└── CLAUDE.md             # Instructions for Claude Code
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
# Install dependencies
npm install

# Start Convex dev server (in one terminal)
npx convex dev

# Start Vite dev server (in another terminal)
npm run dev
```

The app will be available at http://localhost:5173

### Environment Setup

Convex automatically creates `.env.local` with your `VITE_CONVEX_URL` when you run `npx convex dev`.

## Features

### Current Week View (Homepage)
- Shows meals for the current week (Sunday-Saturday)
- Highlights today's meal
- 7-column responsive grid layout
- Links to recipes when available

### Past Plans
- Browse previous weekly meal plans
- Expandable accordion view
- Status badges (completed/in-progress/planned)

### Recipes
- **Tried & Tested**: Collection of recipes you've cooked
- **To Try**: Wishlist of recipes to explore (prioritized)

## Data Management

All data operations are performed via **Claude Code** using Convex mutations. See `CLAUDE.md` for detailed instructions.

### Quick Reference

**Create a weekly plan:**
```typescript
const planId = await client.mutation(api.weeklyPlans.create, {
  weekNumber: 3,
  year: 2026,
  startDate: "2026-01-18",  // Sunday
  endDate: "2026-01-24",    // Saturday
});
```

**Add a meal:**
```typescript
await client.mutation(api.meals.create, {
  weeklyPlanId: planId,
  date: "2026-01-18",
  dayOfWeek: "Sunday",
  name: "Lentil Bolognese",
  notes: "Make a big batch",
  recipeUrl: "https://...",
  estimatedTime: 30,
  tags: ["pasta", "batch-cooking"]
});
```

**Add a rating:**
```typescript
await client.mutation(api.ratings.create, {
  mealName: "Lentil Bolognese",
  rating: 5,
  notes: "Amazing! Make regularly",
  date: "2026-01-18",
  wouldMakeAgain: true
});
```

## Architecture

### Single-User, View-Only UI

- No authentication required (single household)
- UI is read-only (displays data)
- All data creation/editing via Claude Code
- Real-time updates from Convex

### Automatic Status Calculation

Weekly plan status is automatically calculated:
- **completed**: All 7 days have meals
- **in-progress**: Current week or incomplete
- **planned**: Future week

### Sunday-Start Weeks

All weeks run **Sunday through Saturday** (7 days). This aligns with the household's work schedule (Sunday-Thursday work, Friday-Saturday weekend).

## Migration

The system was migrated from markdown files to Convex database. Original files are preserved in `archive/` for reference.

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npx convex dev` - Start Convex backend

### Key Commands

- `npx tsx scripts/migrate-data.ts` - Run data migration
- `npx tsx scripts/clear-data.ts` - Clear database (testing)

## License

Private household project.
