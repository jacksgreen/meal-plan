import { ChefHat, ExternalLink } from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

// Skeleton component
function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`skeleton ${className}`} />;
}

// Loading skeleton
function RecipesPageSkeleton() {
  return (
    <div className="animate-fade-in">
      <div className="mb-10">
        <Skeleton className="h-8 w-40 mb-2" />
        <Skeleton className="h-5 w-72" />
      </div>
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="card p-6">
            <Skeleton className="h-6 w-48 mb-2" />
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
    <div className="animate-fade-in">
      <div className="mb-10">
        <h1 className="text-2xl font-medium text-charcoal mb-2">Recipes</h1>
        <p className="text-muted-foreground">Your personal recipe collection.</p>
      </div>

      <div className="card empty-state">
        <div className="empty-state-icon">
          <ChefHat strokeWidth={1.5} />
        </div>
        <h3>No recipes yet</h3>
        <p>As you try new recipes and add them to meal plans, they'll appear here.</p>
      </div>
    </div>
  );
}

// Recipe card
function RecipeCard({ recipe, index }: { recipe: any; index: number }) {
  return (
    <div className={`recipe-card animate-fade-in-up opacity-0 stagger-${Math.min(index + 1, 7)}`}>
      <div className="mb-3">
        <h3 className="text-lg font-medium text-charcoal mb-1">{recipe.name}</h3>
        {recipe.sourceUrl ? (
          <a
            href={recipe.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="link link-external text-sm"
          >
            {recipe.source}
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        ) : (
          <p className="text-sm text-muted-foreground">{recipe.source}</p>
        )}
      </div>

      {recipe.notes && (
        <p className="text-muted-foreground text-sm mb-4">{recipe.notes}</p>
      )}

      {recipe.tags && recipe.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {recipe.tags.map((tag: string) => (
            <span key={tag} className="tag text-xs">{tag}</span>
          ))}
        </div>
      )}

      {recipe.usedWith && recipe.usedWith.length > 0 && (
        <div className="pt-4 border-t border-border">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-charcoal">Used with:</span>{' '}
            {recipe.usedWith.join(', ')}
          </p>
        </div>
      )}
    </div>
  );
}

export function RecipesPage() {
  const recipes = useQuery(api.recipes.listTried);

  if (recipes === undefined) {
    return <RecipesPageSkeleton />;
  }

  if (recipes.length === 0) {
    return <EmptyState />;
  }

  return (
    <div>
      <div className="mb-10 animate-fade-in-up opacity-0">
        <h1 className="text-2xl font-medium text-charcoal mb-2">Recipes</h1>
        <p className="text-muted-foreground">
          Your personal recipe collection. These are dishes you've cooked and enjoyed.
        </p>
      </div>

      <p className="text-sm text-muted-foreground mb-6 animate-fade-in-up opacity-0 stagger-1">
        {recipes.length} {recipes.length === 1 ? 'recipe' : 'recipes'} in your collection
      </p>

      <div className="space-y-4">
        {recipes.map((recipe, index) => (
          <RecipeCard key={recipe._id} recipe={recipe} index={index} />
        ))}
      </div>
    </div>
  );
}
