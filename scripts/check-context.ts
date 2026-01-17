#!/usr/bin/env npx tsx
/**
 * Checks recent plans, to-try recipes, and favorites to inform meal planning.
 * Usage: VITE_CONVEX_URL=... npx tsx scripts/check-context.ts
 */
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

const client = new ConvexHttpClient(process.env.VITE_CONVEX_URL!);

async function main() {
  const [recentPlans, toTry, favorites, currentWeek] = await Promise.all([
    client.query(api.weeklyPlans.listPlans, { limit: 3 }),
    client.query(api.recipes.listToTry),
    client.query(api.ratings.getFavorites),
    client.query(api.weeklyPlans.getCurrentWeek),
  ]);

  console.log("=== CURRENT WEEK ===");
  if (currentWeek) {
    console.log(`Week ${currentWeek.weekNumber}: ${currentWeek.startDate} to ${currentWeek.endDate}`);
    console.log("Meals:");
    for (const meal of currentWeek.meals || []) {
      console.log(`  ${meal.dayOfWeek}: ${meal.name}`);
    }
  } else {
    console.log("No current week plan");
  }

  console.log("\n=== RECENT PLANS ===");
  for (const plan of recentPlans) {
    console.log(`Week ${plan.weekNumber} (${plan.startDate} - ${plan.endDate}): ${plan.mealCount} meals, ${plan.status}`);
  }

  console.log("\n=== TO-TRY RECIPES ===");
  if (toTry.highPriority.length > 0) {
    console.log("High priority:", toTry.highPriority.map((r: any) => r.name).join(", "));
  }
  if (toTry.someday.length > 0) {
    console.log("Someday:", toTry.someday.map((r: any) => r.name).join(", "));
  }
  if (toTry.highPriority.length === 0 && toTry.someday.length === 0) {
    console.log("None");
  }

  console.log("\n=== FAVORITES ===");
  if (favorites.length > 0) {
    for (const fav of favorites) {
      console.log(`  ${fav.mealName} (${fav.rating}★)`);
    }
  } else {
    console.log("None yet");
  }
}

main();
