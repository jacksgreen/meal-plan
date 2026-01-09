import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  weeklyPlans: defineTable({
    weekNumber: v.number(),
    year: v.number(),
    startDate: v.string(), // ISO date
    endDate: v.string(), // ISO date
  })
    .index("by_year", ["year"])
    .index("by_year_and_week", ["year", "weekNumber"]),

  meals: defineTable({
    weeklyPlanId: v.id("weeklyPlans"),
    date: v.string(), // ISO date
    dayOfWeek: v.string(),
    name: v.string(),
    notes: v.optional(v.string()),
    recipeUrl: v.optional(v.string()),
    estimatedTime: v.optional(v.number()), // minutes
    tags: v.array(v.string()),
  })
    .index("by_weekly_plan", ["weeklyPlanId"])
    .index("by_date", ["date"]),

  recipes: defineTable({
    name: v.string(),
    source: v.string(),
    sourceUrl: v.optional(v.string()),
    status: v.union(v.literal("to-try"), v.literal("tried")),
    priority: v.optional(v.union(v.literal("high"), v.literal("someday"))),
    notes: v.optional(v.string()),
    usedWith: v.array(v.string()), // Array of meal contexts
    tags: v.array(v.string()),
  }).index("by_status", ["status"]),

  ratings: defineTable({
    mealId: v.optional(v.id("meals")),
    recipeId: v.optional(v.id("recipes")),
    mealName: v.string(),
    rating: v.union(
      v.literal(1),
      v.literal(2),
      v.literal(3),
      v.literal(4),
      v.literal(5)
    ),
    notes: v.optional(v.string()),
    date: v.string(), // ISO date when eaten
    wouldMakeAgain: v.boolean(),
  }).index("by_rating", ["rating"]),
});
