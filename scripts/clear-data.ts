import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import { config } from "dotenv";

// Load environment variables from .env.local
config({ path: ".env.local" });

// Get Convex URL from environment
const CONVEX_URL = process.env.VITE_CONVEX_URL;

if (!CONVEX_URL) {
  console.error("❌ VITE_CONVEX_URL not found in environment");
  console.error("Make sure you've run 'npx convex dev' and have a .env.local file");
  process.exit(1);
}

const client = new ConvexHttpClient(CONVEX_URL);

async function clearData() {
  console.log("🗑️  Clearing all data from Convex...\n");

  try {
    // Get all data
    const plans = await client.query(api.weeklyPlans.listPlans, { limit: 100 });
    const recipes = await client.query(api.recipes.listTried, {});
    const toTryRecipes = await client.query(api.recipes.listToTry, {});

    console.log(`Found ${plans.length} plans, ${recipes.length} tried recipes, ${toTryRecipes.highPriority.length + toTryRecipes.someday.length} to-try recipes\n`);

    // Delete all plans (this will cascade delete meals due to relationships)
    for (const plan of plans) {
      await client.mutation(api.weeklyPlans.remove, { planId: plan._id });
      console.log(`✓ Deleted plan: ${plan.startDate} - ${plan.endDate}`);
    }

    // Delete all recipes
    for (const recipe of [...recipes, ...toTryRecipes.highPriority, ...toTryRecipes.someday]) {
      await client.mutation(api.recipes.remove, { recipeId: recipe._id });
      console.log(`✓ Deleted recipe: ${recipe.name}`);
    }

    console.log("\n✅ All data cleared successfully!");
    console.log("\n💡 Now run: node scripts/migrate-data.ts");

  } catch (error) {
    console.error("\n❌ Clear failed:", error);
    process.exit(1);
  }
}

// Run clear
clearData();
