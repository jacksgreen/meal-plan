# Meal Planning System

## Quick Commands
- **"Plan next week"** - Generate a new weekly meal plan
- **"What's for dinner?"** - Show today's meal from current plan
- **"Rate [meal] [1-5]"** - Add feedback for a meal
- **"Add to try list: [recipe]"** - Queue a recipe to try later

## Household Context
- 2 people: Jack + fiancé
- Location: Israel
- Work days: Sunday-Thursday (need quick meals, 30 min max)
- Weekend: Friday-Saturday (can be more elaborate)
- Equipment: airfryer, oven, pots and pans

## Diet
**All meals are vegetarian** - one meal for both of us.
(Fiancé is vegetarian, Jack doesn't eat pork/shellfish - vegetarian satisfies both)

## Likes & Dislikes
| Person | Likes | Dislikes |
|--------|-------|----------|
| Jack | | |
| Alex | | Halloumi |

## Planning Rules
1. **Weeks run Sunday-Saturday** - Always create 7-day plans starting on Sunday
2. Sunday-Thursday: Quick meals (30 mins or less active cooking)
3. Friday-Saturday: Can be more elaborate
4. Look for ingredient synergy between meals (e.g., make extra rice one night, use it the next)
5. Balance: protein + carbs + vegetables
6. All cuisines welcome - we love interesting food
7. **Don't make up recipes** - find real ones online or suggest ideas (I'll look up recipes)

## Favorite Recipe Sources
- [MOB Kitchen](https://mob.co.uk) - Great for quick weeknight meals, good veggie section
- [Bon Appétit](https://bonappetit.com) - Well-tested, interesting recipes

---

## How to Use Convex (Technical Reference)

This meal planning system uses **Convex** for data storage. All meal plans, recipes, and ratings are saved to the database using Convex mutations.

### Setup
```typescript
import { ConvexHttpClient } from "convex/browser";
import { api } from "./convex/_generated/api";

const client = new ConvexHttpClient(process.env.VITE_CONVEX_URL);
```

---

## Weekly Planning Workflow

When the user says **"Plan next week"**:

### Step 1: Check Context
Query existing data to inform the new plan:

```typescript
// Check recent plans for variety
const recentPlans = await client.query(api.weeklyPlans.listPlans, { limit: 5 });

// Check recipes to-try for queued ideas
const toTry = await client.query(api.recipes.listToTry);

// Check ratings for favorites and things to avoid
const favorites = await client.query(api.ratings.getFavorites);
```

### Step 2: Calculate Week Dates
Calculate the next Sunday-Saturday week:

```typescript
// Example: If today is Tuesday Jan 6, 2026
// Next week starts Sunday Jan 11, 2026 and ends Saturday Jan 17, 2026
const startDate = "2026-01-11"; // Sunday
const endDate = "2026-01-17";   // Saturday
const weekNumber = 3; // Week number in the year
```

### Step 3: Create the Weekly Plan
```typescript
const planId = await client.mutation(api.weeklyPlans.create, {
  weekNumber: 3,
  year: 2026,
  startDate: "2026-01-11",  // Sunday
  endDate: "2026-01-17",    // Saturday
  // Note: Status is automatically calculated based on dates and meal count
});
```

### Step 4: Create 7 Meals (One Per Day)
```typescript
const meals = [
  {
    date: "2026-01-11",
    dayOfWeek: "Sunday",
    name: "Chickpea Curry + Rice",
    notes: "Make extra rice for Monday",
    recipeUrl: "https://mob.co.uk/recipes/chickpea-curry",
    estimatedTime: 35,
    tags: ["curry", "quick"]
  },
  {
    date: "2026-01-12",
    dayOfWeek: "Monday",
    name: "Veggie Tray Bake with Tofu",
    notes: "Use leftover rice",
    recipeUrl: undefined,  // Can be undefined if no recipe URL
    estimatedTime: 30,
    tags: ["quick", "leftovers"]
  },
  // ... 5 more meals for Tue-Sat
];

for (const meal of meals) {
  await client.mutation(api.meals.create, {
    weeklyPlanId: planId,
    date: meal.date,
    dayOfWeek: meal.dayOfWeek,
    name: meal.name,
    notes: meal.notes,
    recipeUrl: meal.recipeUrl,
    estimatedTime: meal.estimatedTime,
    tags: meal.tags
  });
}
```

### Important Notes:
- **Always create 7 meals** (Sunday through Saturday)
- Status is automatically calculated:
  - `"completed"` if all 7 days have meals
  - `"in-progress"` if current week or incomplete
  - `"planned"` if future week
- Use `undefined` for optional fields like `recipeUrl` and `notes`
- `estimatedTime` is in minutes

---

## Adding Recipe Ratings

When the user says **"Rate [meal] [1-5]"**:

```typescript
await client.mutation(api.ratings.create, {
  mealName: "Chickpea Curry + Rice",
  rating: 5,  // 1-5
  notes: "Amazing! Make regularly. Maybe add more spice next time.",
  date: "2026-01-11",  // ISO date when eaten
  wouldMakeAgain: true,
  // Optional: link to meal or recipe if available
  mealId: undefined,
  recipeId: undefined
});
```

---

## Adding Recipes to Try List

When the user says **"Add to try list: [recipe]"**:

```typescript
await client.mutation(api.recipes.create, {
  name: "Thai Green Curry",
  source: "MOB Kitchen",
  sourceUrl: "https://mob.co.uk/recipes/thai-green-curry",
  status: "to-try",
  priority: "high",  // "high" or "someday"
  notes: "Looks interesting for a weekend",
  usedWith: [],  // Will be populated when used in meals
  tags: ["curry", "thai", "weekend"]
});
```

---

## Marking Recipe as Tried

When a recipe from the to-try list gets used in a meal plan:

```typescript
// First, find the recipe
const toTry = await client.query(api.recipes.listToTry);
const recipe = toTry.highPriority.find(r => r.name === "Thai Green Curry");

if (recipe) {
  await client.mutation(api.recipes.updateStatus, {
    recipeId: recipe._id,
    status: "tried"
  });
}
```

---

## Query Reference

### Get Current Week's Plan
```typescript
const currentWeek = await client.query(api.weeklyPlans.getCurrentWeek);
// Returns: { _id, weekNumber, year, startDate, endDate, status, meals: [...] }
// Or null if no plan exists for current week
```

### List All Plans
```typescript
const allPlans = await client.query(api.weeklyPlans.listPlans, { limit: 10 });
// Returns plans sorted by newest first, with mealCount and calculated status
```

### Get Specific Plan
```typescript
const plan = await client.query(api.weeklyPlans.getPlan, { planId: "..." });
// Returns full plan with all meals
```

### List Tried Recipes
```typescript
const triedRecipes = await client.query(api.recipes.listTried);
// Returns array of tried recipes
```

### List Recipes to Try
```typescript
const toTry = await client.query(api.recipes.listToTry);
// Returns: { highPriority: [...], someday: [...] }
```

### Get All Ratings
```typescript
const ratings = await client.query(api.ratings.listRatings);
```

### Get Favorite Meals (4-5 stars)
```typescript
const favorites = await client.query(api.ratings.getFavorites);
```

---

## Environment Setup

The Convex URL is automatically available in `.env.local` after running `npx convex dev`.

Access it via:
```typescript
process.env.VITE_CONVEX_URL
```

---

## Complete Example: Planning Next Week

```typescript
import { ConvexHttpClient } from "convex/browser";
import { api } from "./convex/_generated/api";

const client = new ConvexHttpClient(process.env.VITE_CONVEX_URL);

// 1. Check context
const recentPlans = await client.query(api.weeklyPlans.listPlans, { limit: 3 });
const toTry = await client.query(api.recipes.listToTry);
const favorites = await client.query(api.ratings.getFavorites);

// 2. Create plan for next Sunday-Saturday
const planId = await client.mutation(api.weeklyPlans.create, {
  weekNumber: 3,
  year: 2026,
  startDate: "2026-01-18",  // Sunday
  endDate: "2026-01-24",    // Saturday
});

// 3. Create 7 meals
const meals = [
  { date: "2026-01-18", dayOfWeek: "Sunday", name: "Lentil Bolognese", notes: "Make a big batch", recipeUrl: "https://...", estimatedTime: 30, tags: ["pasta", "batch-cooking"] },
  { date: "2026-01-19", dayOfWeek: "Monday", name: "Leftover Bolognese", notes: "Quick reheat", recipeUrl: undefined, estimatedTime: 15, tags: ["quick", "leftovers"] },
  { date: "2026-01-20", dayOfWeek: "Tuesday", name: "Shakshuka", notes: "Serve with bread", recipeUrl: undefined, estimatedTime: 30, tags: ["quick", "eggs"] },
  { date: "2026-01-21", dayOfWeek: "Wednesday", name: "Crispy Tofu Rice Bowl", notes: "Airfryer tofu", recipeUrl: undefined, estimatedTime: 30, tags: ["quick", "asian"] },
  { date: "2026-01-22", dayOfWeek: "Thursday", name: "Pasta Aglio e Olio", notes: "15-min meal", recipeUrl: undefined, estimatedTime: 15, tags: ["quick", "pasta"] },
  { date: "2026-01-23", dayOfWeek: "Friday", name: "Stuffed Peppers", notes: "Weekend special", recipeUrl: undefined, estimatedTime: 45, tags: ["weekend", "baked"] },
  { date: "2026-01-24", dayOfWeek: "Saturday", name: "Homemade Pizza", notes: "Make dough in morning", recipeUrl: "https://...", estimatedTime: 60, tags: ["weekend", "pizza"] },
];

for (const meal of meals) {
  await client.mutation(api.meals.create, {
    weeklyPlanId: planId,
    ...meal
  });
}

console.log("✅ Week 3 planned successfully!");
```
