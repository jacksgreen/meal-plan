import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import * as fs from "fs";
import * as path from "path";
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

// Week 1 data (Sunday Jan 4 - Saturday Jan 10)
const week1Meals = [
  {
    date: "2026-01-04",
    dayOfWeek: "Sunday",
    name: "Chickpea Curry + Rice",
    notes: "Make extra rice for Monday",
    recipeUrl: undefined,
    estimatedTime: 35,
    tags: ["curry", "quick"],
  },
  {
    date: "2026-01-05",
    dayOfWeek: "Monday",
    name: "Veggie Tray Bake with Tofu",
    notes: "Use leftover rice, ginger garlic miso tahini dressing",
    recipeUrl: undefined,
    estimatedTime: 30,
    tags: ["quick", "leftovers"],
  },
  {
    date: "2026-01-06",
    dayOfWeek: "Tuesday",
    name: "Tofu/Veg Leftovers & Bulgur",
    notes: "Use up tray bake leftovers",
    recipeUrl: undefined,
    estimatedTime: 20,
    tags: ["quick", "leftovers"],
  },
  {
    date: "2026-01-07",
    dayOfWeek: "Wednesday",
    name: "Egg Wraps",
    notes: "Wraps, eggs, cheese, tomatoes, kale/greens",
    recipeUrl: undefined,
    estimatedTime: 20,
    tags: ["quick", "breakfast-for-dinner"],
  },
  {
    date: "2026-01-08",
    dayOfWeek: "Thursday",
    name: "Lentil Pasta",
    notes: "Quick weeknight meal",
    recipeUrl: undefined,
    estimatedTime: 25,
    tags: ["quick", "pasta"],
  },
  {
    date: "2026-01-09",
    dayOfWeek: "Friday",
    name: "Tomato Soup",
    notes: "Weekend comfort food",
    recipeUrl: undefined,
    estimatedTime: 40,
    tags: ["weekend", "comfort-food", "soup"],
  },
  {
    date: "2026-01-10",
    dayOfWeek: "Saturday",
    name: "Mushroom & Tofu Skewers + Couscous",
    notes: "Weekend grilling - marinated tofu, mushrooms, peppers, zucchini. Prep extra couscous",
    recipeUrl: undefined,
    estimatedTime: 45,
    tags: ["weekend", "grilling"],
  },
];

// Week 2 data (Sunday Jan 11 - Saturday Jan 17)
// Note: Only 6 meals planned (Sun-Fri), Saturday has no meal yet
const week2Meals = [
  {
    date: "2026-01-11",
    dayOfWeek: "Sunday",
    name: "Lentil Bolognese",
    notes: "Make a big batch - use for leftovers",
    recipeUrl: "https://www.asaucykitchen.com/20-minute-vegetarian-lentil-bolognese/",
    estimatedTime: 30,
    tags: ["pasta", "batch-cooking"],
  },
  {
    date: "2026-01-12",
    dayOfWeek: "Monday",
    name: "Leftover Bolognese + Garlic Bread",
    notes: "Quick reheat, use leftover couscous as side or save for Tue",
    recipeUrl: undefined,
    estimatedTime: 15,
    tags: ["quick", "leftovers"],
  },
  {
    date: "2026-01-13",
    dayOfWeek: "Tuesday",
    name: "Shakshuka",
    notes: "Eggs poached in spiced tomato sauce, serve with bread",
    recipeUrl: undefined,
    estimatedTime: 30,
    tags: ["quick", "eggs", "middle-eastern"],
  },
  {
    date: "2026-01-14",
    dayOfWeek: "Wednesday",
    name: "Crispy Tofu Rice Bowl",
    notes: "Airfryer tofu, rice, quick pickled veg, soy-sesame dressing",
    recipeUrl: undefined,
    estimatedTime: 30,
    tags: ["quick", "asian", "rice-bowl"],
  },
  {
    date: "2026-01-15",
    dayOfWeek: "Thursday",
    name: "Pasta Aglio e Olio with Broccoli",
    notes: "15-min meal - garlic, olive oil, chili flakes, broccoli",
    recipeUrl: undefined,
    estimatedTime: 15,
    tags: ["quick", "pasta", "italian"],
  },
  {
    date: "2026-01-16",
    dayOfWeek: "Friday",
    name: "Stuffed Peppers",
    notes: "Bell peppers stuffed with rice, beans, cheese",
    recipeUrl: undefined,
    estimatedTime: 45,
    tags: ["weekend", "baked"],
  },
];

// Ginger dressing recipe
const gingerDressingRecipe = {
  name: "Ginger Garlic Miso Tahini Dressing",
  source: "Minimalist Baker",
  sourceUrl: "https://minimalistbaker.com/quick-ginger-garlic-miso-tahini-dressing/",
  status: "tried" as const,
  priority: undefined,
  notes: "Great with roasted veg and tofu. Would also work well with rice bowls.",
  usedWith: ["Veggie Tray Bake with Tofu (Week 01)"],
  tags: ["dressing", "asian", "sauce"],
};

async function migrateData() {
  console.log("🚀 Starting data migration...\n");

  try {
    // 1. Create Week 1 plan (Sunday Jan 4 - Saturday Jan 10)
    console.log("📅 Creating Week 1 plan (starts Sunday)...");
    const week1PlanId = await client.mutation(api.weeklyPlans.create, {
      weekNumber: 1,
      year: 2026,
      startDate: "2026-01-04",  // Sunday
      endDate: "2026-01-10",    // Saturday
    });
    console.log(`✅ Created Week 1 plan (ID: ${week1PlanId})\n`);

    // 2. Add Week 1 meals
    console.log("🍽️  Adding Week 1 meals...");
    for (const meal of week1Meals) {
      await client.mutation(api.meals.create, {
        weeklyPlanId: week1PlanId,
        ...meal,
      });
      console.log(`   ✓ ${meal.name} (${meal.dayOfWeek})`);
    }
    console.log(`✅ Added ${week1Meals.length} meals for Week 1\n`);

    // 3. Create Week 2 plan (Sunday Jan 11 - Saturday Jan 17)
    console.log("📅 Creating Week 2 plan (starts Sunday)...");
    const week2PlanId = await client.mutation(api.weeklyPlans.create, {
      weekNumber: 2,
      year: 2026,
      startDate: "2026-01-11",  // Sunday
      endDate: "2026-01-17",    // Saturday
      // Status will be calculated: "in-progress" (only 6 of 7 days have meals)
    });
    console.log(`✅ Created Week 2 plan (ID: ${week2PlanId})\n`);

    // 4. Add Week 2 meals
    console.log("🍽️  Adding Week 2 meals...");
    for (const meal of week2Meals) {
      await client.mutation(api.meals.create, {
        weeklyPlanId: week2PlanId,
        ...meal,
      });
      console.log(`   ✓ ${meal.name} (${meal.dayOfWeek})`);
    }
    console.log(`✅ Added ${week2Meals.length} meals for Week 2\n`);

    // 5. Add ginger dressing recipe
    console.log("📖 Adding recipe...");
    await client.mutation(api.recipes.create, gingerDressingRecipe);
    console.log(`✅ Added recipe: ${gingerDressingRecipe.name}\n`);

    // 6. Archive old markdown files
    console.log("📦 Archiving markdown files...");
    const archiveDir = path.join(process.cwd(), "archive");

    // Create archive directories
    if (!fs.existsSync(archiveDir)) {
      fs.mkdirSync(archiveDir);
    }
    const archivePlansDir = path.join(archiveDir, "plans", "2026");
    const archiveRecipesDir = path.join(archiveDir, "recipes", "tried");

    fs.mkdirSync(archivePlansDir, { recursive: true });
    fs.mkdirSync(archiveRecipesDir, { recursive: true });

    // Move files
    const filesToArchive = [
      { from: "plans/2026/week-01.md", to: "archive/plans/2026/week-01.md" },
      { from: "plans/2026/week-02.md", to: "archive/plans/2026/week-02.md" },
      { from: "recipes/tried/ginger-garlic-miso-tahini-dressing.md", to: "archive/recipes/tried/ginger-garlic-miso-tahini-dressing.md" },
    ];

    for (const file of filesToArchive) {
      const fromPath = path.join(process.cwd(), file.from);
      const toPath = path.join(process.cwd(), file.to);

      if (fs.existsSync(fromPath)) {
        fs.copyFileSync(fromPath, toPath);
        fs.unlinkSync(fromPath);
        console.log(`   ✓ Archived ${file.from}`);
      }
    }
    console.log("✅ Archived all markdown files\n");

    console.log("🎉 Migration completed successfully!");
    console.log("\n📊 Summary:");
    console.log(`   - 2 weekly plans created`);
    console.log(`   - ${week1Meals.length + week2Meals.length} meals added`);
    console.log(`   - 1 recipe added`);
    console.log(`   - Original files archived to ./archive/`);
    console.log("\n💡 Next steps:");
    console.log(`   1. Check your app at http://localhost:5173`);
    console.log(`   2. View the data in Convex dashboard`);
    console.log(`   3. Try creating a new meal plan using Claude Code`);

  } catch (error) {
    console.error("\n❌ Migration failed:", error);
    process.exit(1);
  }
}

// Run migration
migrateData();
