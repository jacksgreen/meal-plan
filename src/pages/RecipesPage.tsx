import { ChefHat, ExternalLink, Star, Check, Plus, Pencil, Trash2 } from 'lucide-react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useState } from 'react';
import { RecipeForm, DeleteConfirmModal } from '../components/forms';
import type { Id } from '../../convex/_generated/dataModel';

// Skeleton component
function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`skeleton ${className}`} />;
}

// Loading skeleton
function RecipesPageSkeleton() {
  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <Skeleton className="h-8 w-40 mb-2" />
        <Skeleton className="h-5 w-72" />
      </div>
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card p-5">
            <Skeleton className="h-5 w-48 mb-2" />
            <Skeleton className="h-4 w-32 mb-3" />
            <Skeleton className="h-4 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Empty state
function EmptyState() {
  return (
    <div className="card empty-state">
      <div className="empty-state-icon">
        <ChefHat strokeWidth={1.5} />
      </div>
      <h3>No recipes yet</h3>
      <p>Save recipes you'd like to try or have already cooked.</p>
    </div>
  );
}

type RecipeData = {
  _id: Id<"recipes">;
  name: string;
  source: string;
  sourceUrl?: string;
  status: 'to-try' | 'tried';
  priority?: 'high' | 'someday';
  notes?: string;
  usedWith: string[];
  tags: string[];
};

// Recipe card
function RecipeCard({
  recipe,
  index,
  onEdit,
  onDelete
}: {
  recipe: RecipeData;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const isTried = recipe.status === 'tried';
  const isPriority = recipe.priority === 'high';

  return (
    <div className={`recipe-card card-editable animate-fade-in-up opacity-0 stagger-${Math.min(index + 1, 7)}`}>
      {/* Edit/Delete overlay */}
      <div className="card-edit-overlay flex gap-1">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="icon-button icon-button--sm"
          aria-label="Edit recipe"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="icon-button icon-button--sm icon-button--danger"
          aria-label="Delete recipe"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="text-base font-medium text-charcoal">{recipe.name}</h3>
            {isTried ? (
              <span className="tried-badge">
                <Check className="w-3 h-3" />
                Tried
              </span>
            ) : isPriority ? (
              <span className="priority-badge">
                <Star className="w-3 h-3 fill-current" />
              </span>
            ) : null}
          </div>
          {recipe.sourceUrl ? (
            <a
              href={recipe.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="link link-external text-sm"
            >
              {recipe.source || 'View recipe'}
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          ) : recipe.source ? (
            <p className="text-sm text-muted-foreground">{recipe.source}</p>
          ) : null}

          {recipe.notes && (
            <p className="text-sm text-muted-foreground mt-2">{recipe.notes}</p>
          )}

          {recipe.tags && recipe.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {recipe.tags.map((tag: string) => (
                <span key={tag} className="tag text-xs">{tag}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function RecipesPage() {
  const triedRecipes = useQuery(api.recipes.listTried);
  const toTryRecipes = useQuery(api.recipes.listToTry);
  const deleteRecipe = useMutation(api.recipes.remove);

  // Modal state
  const [showRecipeForm, setShowRecipeForm] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<RecipeData | null>(null);
  const [deletingRecipe, setDeletingRecipe] = useState<RecipeData | null>(null);

  if (triedRecipes === undefined || toTryRecipes === undefined) {
    return <RecipesPageSkeleton />;
  }

  // Combine all recipes into one list, prioritizing to-try (high priority first, then someday, then tried)
  const allRecipes: RecipeData[] = [
    ...toTryRecipes.highPriority,
    ...toTryRecipes.someday,
    ...triedRecipes,
  ];

  const handleEdit = (recipe: RecipeData) => {
    setEditingRecipe(recipe);
    setShowRecipeForm(true);
  };

  const handleDelete = (recipe: RecipeData) => {
    setDeletingRecipe(recipe);
  };

  const handleCloseForm = () => {
    setShowRecipeForm(false);
    setEditingRecipe(null);
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8 animate-fade-in-up opacity-0">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-medium text-charcoal mb-2">Recipes</h1>
            <p className="text-muted-foreground">
              {allRecipes.length === 0
                ? 'Your recipe collection.'
                : `${allRecipes.length} ${allRecipes.length === 1 ? 'recipe' : 'recipes'} saved`
              }
            </p>
          </div>
          <button
            onClick={() => setShowRecipeForm(true)}
            className="add-button"
          >
            <Plus className="w-4 h-4" />
            Add Recipe
          </button>
        </div>
      </div>

      {/* Recipes list */}
      {allRecipes.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-3">
          {allRecipes.map((recipe, index) => (
            <RecipeCard
              key={recipe._id}
              recipe={recipe}
              index={index}
              onEdit={() => handleEdit(recipe)}
              onDelete={() => handleDelete(recipe)}
            />
          ))}
        </div>
      )}

      {/* Recipe Form Modal */}
      <RecipeForm
        isOpen={showRecipeForm}
        onClose={handleCloseForm}
        recipe={editingRecipe}
        onDelete={editingRecipe ? () => {
          setDeletingRecipe(editingRecipe);
          handleCloseForm();
        } : undefined}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deletingRecipe}
        onClose={() => setDeletingRecipe(null)}
        onConfirm={async () => {
          if (deletingRecipe) {
            await deleteRecipe({ recipeId: deletingRecipe._id });
          }
        }}
        title="Delete Recipe"
        message="Are you sure you want to delete this recipe? This action cannot be undone."
        itemName={deletingRecipe?.name}
      />
    </div>
  );
}
