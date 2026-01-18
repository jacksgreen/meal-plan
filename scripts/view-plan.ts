#!/usr/bin/env npx tsx
/**
 * View meal plan for a specific date or the current week.
 * Usage: VITE_CONVEX_URL=... npx tsx scripts/view-plan.ts [date]
 *
 * Examples:
 *   npx tsx scripts/view-plan.ts          # Shows plan containing today
 *   npx tsx scripts/view-plan.ts 2026-01-20   # Shows plan containing that date
 */
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

const client = new ConvexHttpClient(process.env.VITE_CONVEX_URL!);

async function main() {
  const dateArg = process.argv[2];
  const targetDate = dateArg || new Date().toISOString().split('T')[0];

  const plan = await client.query(api.weeklyPlans.getPlanByDate, { date: targetDate });

  if (!plan) {
    console.log(`No plan found for ${targetDate}`);
    return;
  }

  console.log(`Week ${plan.weekNumber}: ${plan.startDate} to ${plan.endDate}\n`);

  const today = new Date().toISOString().split('T')[0];

  for (const meal of plan.meals || []) {
    const isToday = meal.date === today;
    const marker = isToday ? " ← today" : "";
    const time = meal.estimatedTime ? ` (${meal.estimatedTime} min)` : "";

    console.log(`${meal.dayOfWeek}${marker} - ${meal.name}${time}`);
    if (meal.notes) {
      console.log(`  ${meal.notes}`);
    }
  }
}

main();
