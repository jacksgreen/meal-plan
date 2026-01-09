import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// List all ratings (sorted by date, newest first)
export const listRatings = query({
  args: {},
  handler: async (ctx) => {
    const ratings = await ctx.db.query("ratings").collect();

    // Sort by date descending
    ratings.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return ratings;
  },
});

// Get favorite meals (4-5 star ratings)
export const getFavorites = query({
  args: {},
  handler: async (ctx) => {
    const ratings = await ctx.db.query("ratings").collect();

    const favorites = ratings.filter((r) => r.rating >= 4 && r.wouldMakeAgain);

    // Sort by rating descending, then by date
    favorites.sort((a, b) => {
      if (a.rating !== b.rating) return b.rating - a.rating;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    return favorites;
  },
});

// Create a new rating
export const create = mutation({
  args: {
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
    date: v.string(),
    wouldMakeAgain: v.boolean(),
  },
  handler: async (ctx, args) => {
    const ratingId = await ctx.db.insert("ratings", {
      mealId: args.mealId,
      recipeId: args.recipeId,
      mealName: args.mealName,
      rating: args.rating,
      notes: args.notes,
      date: args.date,
      wouldMakeAgain: args.wouldMakeAgain,
    });

    return ratingId;
  },
});
