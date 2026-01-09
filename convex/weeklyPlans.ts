import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Helper: Calculate status based on plan dates and meal count
function calculateStatus(
  startDate: string,
  endDate: string,
  mealCount: number
): "planned" | "in-progress" | "completed" {
  const today = new Date().toISOString().split('T')[0];
  const start = new Date(startDate);
  const end = new Date(endDate);

  // Calculate expected number of days in the week
  const expectedDays = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  // If all days have meals, it's completed
  if (mealCount === expectedDays) {
    return "completed";
  }

  // If today is within the week, it's in-progress
  if (today >= startDate && today <= endDate) {
    return "in-progress";
  }

  // If the week is in the past and not complete, it's still in-progress
  if (today > endDate) {
    return "in-progress";
  }

  // Otherwise, it's planned (future week)
  return "planned";
}

// Get current week's plan with meals (finds plan where today falls within date range)
export const getCurrentWeek = query({
  args: {},
  handler: async (ctx) => {
    const now = new Date();
    const todayISO = now.toISOString().split('T')[0]; // YYYY-MM-DD format

    // Find all plans and check which one contains today
    const allPlans = await ctx.db.query("weeklyPlans").collect();

    const plan = allPlans.find(p => {
      return todayISO >= p.startDate && todayISO <= p.endDate;
    });

    if (!plan) return null;

    // Get all meals for this plan
    const meals = await ctx.db
      .query("meals")
      .withIndex("by_weekly_plan", (q) => q.eq("weeklyPlanId", plan._id))
      .collect();

    // Sort meals by date
    meals.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Calculate status
    const status = calculateStatus(plan.startDate, plan.endDate, meals.length);

    return { ...plan, meals, status };
  },
});

// Get plan by a specific date (finds plan where the date falls within date range)
export const getPlanByDate = query({
  args: {
    date: v.string(), // ISO date string YYYY-MM-DD
  },
  handler: async (ctx, args) => {
    const targetDate = args.date;

    // Find all plans and check which one contains the target date
    const allPlans = await ctx.db.query("weeklyPlans").collect();

    const plan = allPlans.find(p => {
      return targetDate >= p.startDate && targetDate <= p.endDate;
    });

    if (!plan) return null;

    // Get all meals for this plan
    const meals = await ctx.db
      .query("meals")
      .withIndex("by_weekly_plan", (q) => q.eq("weeklyPlanId", plan._id))
      .collect();

    // Sort meals by date
    meals.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Calculate status
    const status = calculateStatus(plan.startDate, plan.endDate, meals.length);

    return { ...plan, meals, status };
  },
});

// Get adjacent plans (prev/next) for navigation
export const getAdjacentPlans = query({
  args: {
    currentStartDate: v.string(),
  },
  handler: async (ctx, args) => {
    const allPlans = await ctx.db.query("weeklyPlans").collect();

    // Sort plans by start date
    allPlans.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

    const currentIndex = allPlans.findIndex(p => p.startDate === args.currentStartDate);

    return {
      hasPrev: currentIndex > 0,
      hasNext: currentIndex < allPlans.length - 1 && currentIndex !== -1,
      prevStartDate: currentIndex > 0 ? allPlans[currentIndex - 1].startDate : null,
      nextStartDate: currentIndex < allPlans.length - 1 && currentIndex !== -1
        ? allPlans[currentIndex + 1].startDate
        : null,
    };
  },
});

// List all plans (paginated, sorted by newest first)
export const listPlans = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;

    const plans = await ctx.db
      .query("weeklyPlans")
      .order("desc")
      .take(limit);

    // For each plan, get meal count and calculate status
    const plansWithMealCount = await Promise.all(
      plans.map(async (plan) => {
        const mealCount = await ctx.db
          .query("meals")
          .withIndex("by_weekly_plan", (q) => q.eq("weeklyPlanId", plan._id))
          .collect()
          .then((meals) => meals.length);

        const status = calculateStatus(plan.startDate, plan.endDate, mealCount);

        return { ...plan, mealCount, status };
      })
    );

    return plansWithMealCount;
  },
});

// Get a specific plan by ID with all meals
export const getPlan = query({
  args: { planId: v.id("weeklyPlans") },
  handler: async (ctx, args) => {
    const plan = await ctx.db.get(args.planId);
    if (!plan) return null;

    const meals = await ctx.db
      .query("meals")
      .withIndex("by_weekly_plan", (q) => q.eq("weeklyPlanId", args.planId))
      .collect();

    meals.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const status = calculateStatus(plan.startDate, plan.endDate, meals.length);

    return { ...plan, meals, status };
  },
});

// Create a new weekly plan
export const create = mutation({
  args: {
    weekNumber: v.number(),
    year: v.number(),
    startDate: v.string(),
    endDate: v.string(),
  },
  handler: async (ctx, args) => {
    const planId = await ctx.db.insert("weeklyPlans", {
      weekNumber: args.weekNumber,
      year: args.year,
      startDate: args.startDate,
      endDate: args.endDate,
    });

    return planId;
  },
});

// Remove a weekly plan and all its meals
export const remove = mutation({
  args: {
    planId: v.id("weeklyPlans"),
  },
  handler: async (ctx, args) => {
    // First, delete all meals associated with this plan
    const meals = await ctx.db
      .query("meals")
      .withIndex("by_weekly_plan", (q) => q.eq("weeklyPlanId", args.planId))
      .collect();

    for (const meal of meals) {
      await ctx.db.delete(meal._id);
    }

    // Then delete the plan itself
    await ctx.db.delete(args.planId);

    return args.planId;
  },
});
