import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get meals around a specific date (rolling window)
export const getMealsAroundDate = query({
  args: {
    centerDate: v.string(), // ISO date string YYYY-MM-DD
    daysBefore: v.optional(v.number()),
    daysAfter: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const daysBefore = args.daysBefore ?? 2;
    const daysAfter = args.daysAfter ?? 5;

    const center = new Date(args.centerDate);
    const startDate = new Date(center);
    startDate.setDate(center.getDate() - daysBefore);
    const endDate = new Date(center);
    endDate.setDate(center.getDate() + daysAfter);

    const startISO = startDate.toISOString().split('T')[0];
    const endISO = endDate.toISOString().split('T')[0];

    // Get all meals and filter by date range
    const allMeals = await ctx.db.query("meals").collect();

    const mealsInRange = allMeals.filter(meal => {
      return meal.date >= startISO && meal.date <= endISO;
    });

    // Sort by date
    mealsInRange.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return {
      meals: mealsInRange,
      startDate: startISO,
      endDate: endISO,
      centerDate: args.centerDate,
    };
  },
});

// Get all meals for a specific weekly plan
export const getMealsByPlan = query({
  args: { weeklyPlanId: v.id("weeklyPlans") },
  handler: async (ctx, args) => {
    const meals = await ctx.db
      .query("meals")
      .withIndex("by_weekly_plan", (q) => q.eq("weeklyPlanId", args.weeklyPlanId))
      .collect();

    meals.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return meals;
  },
});

// Create a new meal
export const create = mutation({
  args: {
    weeklyPlanId: v.id("weeklyPlans"),
    date: v.string(),
    dayOfWeek: v.string(),
    name: v.string(),
    notes: v.optional(v.string()),
    recipeUrl: v.optional(v.string()),
    estimatedTime: v.optional(v.number()),
    tags: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const mealId = await ctx.db.insert("meals", {
      weeklyPlanId: args.weeklyPlanId,
      date: args.date,
      dayOfWeek: args.dayOfWeek,
      name: args.name,
      notes: args.notes,
      recipeUrl: args.recipeUrl,
      estimatedTime: args.estimatedTime,
      tags: args.tags,
    });

    return mealId;
  },
});

// Update an existing meal
export const update = mutation({
  args: {
    mealId: v.id("meals"),
    name: v.optional(v.string()),
    notes: v.optional(v.string()),
    recipeUrl: v.optional(v.string()),
    estimatedTime: v.optional(v.number()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const { mealId, ...updates } = args;

    // Filter out undefined values
    const cleanUpdates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        cleanUpdates[key] = value;
      }
    }

    await ctx.db.patch(mealId, cleanUpdates);
    return mealId;
  },
});

// Delete a meal
export const remove = mutation({
  args: {
    mealId: v.id("meals"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.mealId);
    return args.mealId;
  },
});
