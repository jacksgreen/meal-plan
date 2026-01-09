import { Sparkles, Star, ExternalLink, Bookmark } from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

// Skeleton component
function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`skeleton ${className}`} />;
}

// Loading skeleton
function ToTryPageSkeleton() {
  return (
    <div className="animate-fade-in">
      <div className="mb-10">
        <Skeleton className="h-8 w-32 mb-2" />
        <Skeleton className="h-5 w-64" />
      </div>
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="card p-6">
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
    <div className="animate-fade-in">
      <div className="mb-10">
        <h1 className="text-2xl font-medium text-charcoal mb-2">To Try</h1>
        <p className="text-muted-foreground">Your wishlist of recipes to explore.</p>
      </div>

      <div className="card empty-state">
        <div className="empty-state-icon">
          <Bookmark strokeWidth={1.5} />
        </div>
        <h3>Nothing here yet</h3>
        <p>
          Save recipes you'd like to try using the "Add to try list" command.
          No pressure to try them all.
        </p>
      </div>
    </div>
  );
}

// Recipe card
function ToTryCard({ recipe, isPriority, index }: { recipe: any; isPriority: boolean; index: number }) {
  return (
    <div className={`card p-5 animate-fade-in-up opacity-0 stagger-${Math.min(index + 1, 7)}`}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-medium text-charcoal mb-1">{recipe.name}</h3>
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

        {isPriority && (
          <div className="shrink-0 w-7 h-7 rounded-full bg-gold-light flex items-center justify-center">
            <Star className="w-3.5 h-3.5 text-gold fill-gold" />
          </div>
        )}
      </div>

      {recipe.notes && (
        <p className="text-sm text-muted-foreground mb-3">{recipe.notes}</p>
      )}

      {recipe.tags && recipe.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {recipe.tags.map((tag: string) => (
            <span key={tag} className="tag text-xs">{tag}</span>
          ))}
        </div>
      )}
    </div>
  );
}

export function ToTryPage() {
  const toTry = useQuery(api.recipes.listToTry);

  if (toTry === undefined) {
    return <ToTryPageSkeleton />;
  }

  const hasRecipes = toTry.highPriority.length > 0 || toTry.someday.length > 0;

  if (!hasRecipes) {
    return <EmptyState />;
  }

  return (
    <div>
      <div className="mb-10 animate-fade-in-up opacity-0">
        <h1 className="text-2xl font-medium text-charcoal mb-2">To Try</h1>
        <p className="text-muted-foreground">
          Your wishlist of recipes to explore. Take your time with these.
        </p>
      </div>

      <div className="space-y-10">
        {/* High Priority */}
        {toTry.highPriority.length > 0 && (
          <section className="animate-fade-in-up opacity-0 stagger-1">
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-4 h-4 text-gold fill-gold" />
              <h2 className="text-sm font-medium text-charcoal">
                Want to try soon
              </h2>
              <span className="text-sm text-muted-foreground">
                ({toTry.highPriority.length})
              </span>
            </div>

            <div className="space-y-3">
              {toTry.highPriority.map((recipe, index) => (
                <ToTryCard key={recipe._id} recipe={recipe} isPriority index={index} />
              ))}
            </div>
          </section>
        )}

        {/* Someday */}
        {toTry.someday.length > 0 && (
          <section className="animate-fade-in-up opacity-0 stagger-3">
            <div className="flex items-center gap-2 mb-4">
              <Bookmark className="w-4 h-4 text-muted-foreground" />
              <h2 className="text-sm font-medium text-muted-foreground">
                Someday
              </h2>
              <span className="text-sm text-muted-foreground">
                ({toTry.someday.length})
              </span>
            </div>

            <div className="space-y-3">
              {toTry.someday.map((recipe, index) => (
                <ToTryCard key={recipe._id} recipe={recipe} isPriority={false} index={index} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
