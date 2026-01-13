# Meal Planning App

A personal meal planning app for a 2-person household. Users can view weekly meal plans, browse past plans, and manage a recipe collection.

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite 6
- **Styling:** Tailwind CSS 4, Lucide icons
- **Backend:** Convex (real-time database)
- **Routing:** React Router 7

## Commands

```bash
npm run dev      # Start dev server (Vite)
npm run build    # Type-check + build for production
npm run lint     # Run ESLint
```

Convex runs separately: `npx convex dev`

## Project Structure

```
src/
├── App.tsx              # Router setup
├── main.tsx             # Entry point, Convex provider
├── pages/
│   ├── HomePage.tsx     # "This Week" - scrollable day cards
│   ├── PlansPage.tsx    # "Past Plans" - accordion of weekly plans
│   └── RecipesPage.tsx  # "Recipes" - to-try and tried recipes
├── components/
│   └── Layout.tsx       # Header (desktop) / bottom nav (mobile)
└── lib/
    └── utils.ts         # cn() helper for Tailwind

convex/
├── schema.ts            # Database schema
├── weeklyPlans.ts       # Plan queries/mutations
├── meals.ts             # Meal queries/mutations
├── recipes.ts           # Recipe queries/mutations
└── ratings.ts           # Rating queries/mutations
```

## Database Schema (Convex)

- **weeklyPlans** - year, weekNumber, startDate, endDate
- **meals** - weeklyPlanId, date, dayOfWeek, name, notes, recipeUrl, estimatedTime, tags
- **recipes** - name, source, sourceUrl, status (to-try|tried), priority, notes, tags
- **ratings** - mealName, rating (1-5), notes, date, wouldMakeAgain

## Notes

- Single-user app, no auth
- Responsive: bottom nav on mobile, top header on desktop
- Status (completed/in-progress/planned) is calculated automatically in Convex based on dates and meal count
