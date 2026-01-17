#!/usr/bin/env npx tsx
/**
 * Adds meals to an existing weekly plan.
 * Usage: VITE_CONVEX_URL=... npx tsx scripts/add-meals.ts '<JSON>'
 *
 * JSON format:
 * {
 *   "weekNumber": 3,
 *   "year": 2026,
 *   "meals": [
 *     {
 *       "date": "2026-01-19",
 *       "dayOfWeek": "Monday",
 *       "name": "Tacos",
 *       "notes": "Optional notes",
 *       "estimatedTime": 25,
 *       "tags": ["mexican", "quick"]
 *     }
 *   ]
 * }
 */
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

const client = new ConvexHttpClient(process.env.VITE_CONVEX_URL!);

interface Meal {
  date: string;
  dayOfWeek: string;
  name: string;
  notes?: string;
  recipeUrl?: string;
  estimatedTime: number;
  tags: string[];
}

interface AddMealsInput {
  weekNumber: number;
  year: number;
  meals: Meal[];
}

async function main() {
  const jsonArg = process.argv[2];
  if (!jsonArg) {
    console.error("Usage: npx tsx scripts/add-meals.ts '<JSON>'");
    process.exit(1);
  }

  const input: AddMealsInput = JSON.parse(jsonArg);

  // Find the existing plan
  const plans = await client.query(api.weeklyPlans.listPlans, { limit: 10 });
  const plan = plans.find((p: any) => p.weekNumber === input.weekNumber && p.year === input.year);

  if (!plan) {
    console.error(`Plan not found: Week ${input.weekNumber}, ${input.year}`);
    process.exit(1);
  }

  console.log(`Adding meals to Week ${input.weekNumber} (${plan.startDate} - ${plan.endDate})`);

  // Get existing meals for this plan
  const existingMeals = await client.query(api.meals.getMealsByPlan, { weeklyPlanId: plan._id });

  // Add each meal (replacing any existing meal on the same date)
  for (const meal of input.meals) {
    // Check for existing meals on this date and remove them
    const mealsOnDate = existingMeals.filter((m: any) => m.date === meal.date);
    for (const existing of mealsOnDate) {
      await client.mutation(api.meals.remove, { mealId: existing._id });
      console.log(`  ${meal.dayOfWeek}: Replacing "${existing.name}"`);
    }

    await client.mutation(api.meals.create, {
      weeklyPlanId: plan._id,
      date: meal.date,
      dayOfWeek: meal.dayOfWeek,
      name: meal.name,
      notes: meal.notes || "",
      recipeUrl: meal.recipeUrl,
      estimatedTime: meal.estimatedTime,
      tags: meal.tags,
    });
    console.log(`  ${meal.dayOfWeek}: ${meal.name}`);
  }

  console.log("\nMeals saved!");
}

main();
