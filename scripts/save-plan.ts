#!/usr/bin/env npx tsx
/**
 * Saves a meal plan to Convex.
 * Usage: VITE_CONVEX_URL=... npx tsx scripts/save-plan.ts '<JSON>'
 *
 * JSON format:
 * {
 *   "weekNumber": 3,
 *   "year": 2026,
 *   "startDate": "2026-01-17",
 *   "endDate": "2026-01-22",
 *   "meals": [
 *     {
 *       "date": "2026-01-17",
 *       "dayOfWeek": "Saturday",
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

interface PlanInput {
  weekNumber: number;
  year: number;
  startDate: string;
  endDate: string;
  meals: Meal[];
}

async function main() {
  const jsonArg = process.argv[2];
  if (!jsonArg) {
    console.error("Usage: npx tsx scripts/save-plan.ts '<JSON>'");
    process.exit(1);
  }

  const plan: PlanInput = JSON.parse(jsonArg);

  // Create the weekly plan
  const planId = await client.mutation(api.weeklyPlans.create, {
    weekNumber: plan.weekNumber,
    year: plan.year,
    startDate: plan.startDate,
    endDate: plan.endDate,
  });
  console.log(`Created plan for week ${plan.weekNumber}: ${planId}`);

  // Create each meal
  for (const meal of plan.meals) {
    await client.mutation(api.meals.create, {
      weeklyPlanId: planId,
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

  console.log("\nPlan saved successfully!");
}

main();
