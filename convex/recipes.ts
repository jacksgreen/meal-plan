import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// List all tried recipes
export const listTried = query({
  args: {},
  handler: async (ctx) => {
    const recipes = await ctx.db
      .query("recipes")
      .withIndex("by_status", (q) => q.eq("status", "tried"))
      .collect();

    return recipes;
  },
});

// List all to-try recipes
export const listToTry = query({
  args: {},
  handler: async (ctx) => {
    const recipes = await ctx.db
      .query("recipes")
      .withIndex("by_status", (q) => q.eq("status", "to-try"))
      .collect();

    // Group by priority
    const highPriority = recipes.filter((r) => r.priority === "high");
    const someday = recipes.filter((r) => r.priority === "someday" || !r.priority);

    return { highPriority, someday };
  },
});

// Create a new recipe
export const create = mutation({
  args: {
    name: v.string(),
    source: v.string(),
    sourceUrl: v.optional(v.string()),
    status: v.union(v.literal("to-try"), v.literal("tried")),
    priority: v.optional(v.union(v.literal("high"), v.literal("someday"))),
    notes: v.optional(v.string()),
    usedWith: v.array(v.string()),
    tags: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const recipeId = await ctx.db.insert("recipes", {
      name: args.name,
      source: args.source,
      sourceUrl: args.sourceUrl,
      status: args.status,
      priority: args.priority,
      notes: args.notes,
      usedWith: args.usedWith,
      tags: args.tags,
    });

    return recipeId;
  },
});

// Update recipe status (e.g., move from to-try to tried)
export const updateStatus = mutation({
  args: {
    recipeId: v.id("recipes"),
    status: v.union(v.literal("to-try"), v.literal("tried")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.recipeId, {
      status: args.status,
    });

    return args.recipeId;
  },
});

// Remove a recipe
export const remove = mutation({
  args: {
    recipeId: v.id("recipes"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.recipeId);
    return args.recipeId;
  },
});
