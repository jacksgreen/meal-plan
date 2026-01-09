import { ChevronDown, Clock, ExternalLink, BookOpen } from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { format, parseISO } from 'date-fns';
import { useState } from 'react';

// Skeleton component
function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`skeleton ${className}`} />;
}

// Loading skeleton
function PlansPageSkeleton() {
  return (
    <div className="animate-fade-in">
      <div className="mb-10">
        <Skeleton className="h-8 w-40 mb-2" />
        <Skeleton className="h-5 w-80" />
      </div>
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="card p-6">
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-32" />
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
        <h1 className="text-2xl font-medium text-charcoal mb-2">Past Plans</h1>
        <p className="text-muted-foreground">Your meal planning history will appear here.</p>
      </div>

      <div className="card empty-state">
        <div className="empty-state-icon">
          <BookOpen strokeWidth={1.5} />
        </div>
        <h3>No plans yet</h3>
        <p>Once you create meal plans, they'll be saved here for easy reference.</p>
      </div>
    </div>
  );
}

// Status badge
function StatusBadge({ status }: { status: string }) {
  const labels: Record<string, string> = {
    completed: 'completed',
    'in-progress': 'in progress',
    planned: 'planned',
  };

  const badgeClass = {
    completed: 'badge-completed',
    'in-progress': 'badge-in-progress',
    planned: 'badge-planned',
  }[status] || 'badge-planned';

  return <span className={`badge ${badgeClass}`}>{labels[status] || status}</span>;
}

// Plan card
function PlanCard({ plan, index }: { plan: any; index: number }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={`expandable-card animate-fade-in-up opacity-0 stagger-${Math.min(index + 1, 7)}`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="expandable-card-header w-full text-left"
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-1">
              <h3 className="text-lg font-medium text-charcoal">
                {format(parseISO(plan.startDate), 'MMM d')} - {format(parseISO(plan.endDate), 'MMM d, yyyy')}
              </h3>
              <StatusBadge status={plan.status} />
            </div>
            <p className="text-sm text-muted-foreground">
              {plan.mealCount} {plan.mealCount === 1 ? 'meal' : 'meals'} planned
            </p>
          </div>

          <div
            className={`flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center transition-transform duration-300 ${
              isExpanded ? 'rotate-180' : ''
            }`}
          >
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>
      </button>

      {isExpanded && <MealsView planId={plan._id} />}
    </div>
  );
}

// Meals grid
function MealsView({ planId }: { planId: string }) {
  const planData = useQuery(api.weeklyPlans.getPlan, { planId: planId as any });

  if (!planData) {
    return (
      <div className="expandable-card-content pt-5">
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-sage-dark/50 rounded-xl p-4">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-5 w-48" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="expandable-card-content pt-5">
      <div className="space-y-2">
        {planData.meals.map((meal, index) => (
          <div
            key={meal._id}
            className="bg-sage/50 hover:bg-sage rounded-xl p-4 transition-colors duration-200 animate-fade-in opacity-0"
            style={{ animationDelay: `${index * 40}ms`, animationFillMode: 'forwards' }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-charcoal">
                    {format(parseISO(meal.date), 'EEEE')}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {format(parseISO(meal.date), 'MMM d')}
                  </span>
                </div>
                <h4 className="text-sm text-charcoal-light mb-1">{meal.name}</h4>
                {meal.notes && (
                  <p className="text-xs text-muted-foreground">{meal.notes}</p>
                )}
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {meal.estimatedTime && (
                  <div className="time-indicator text-xs">
                    <Clock className="w-3.5 h-3.5" strokeWidth={1.5} />
                    <span>{meal.estimatedTime}m</span>
                  </div>
                )}
                {meal.recipeUrl && (
                  <a
                    href={meal.recipeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link link-external text-xs"
                  >
                    Recipe
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PlansPage() {
  const plans = useQuery(api.weeklyPlans.listPlans, { limit: 20 });

  if (plans === undefined) {
    return <PlansPageSkeleton />;
  }

  if (plans.length === 0) {
    return <EmptyState />;
  }

  return (
    <div>
      <div className="mb-10 animate-fade-in-up opacity-0">
        <h1 className="text-2xl font-medium text-charcoal mb-2">Past Plans</h1>
        <p className="text-muted-foreground">
          Browse your meal planning history. Find favorites to repeat.
        </p>
      </div>

      <div className="space-y-3">
        {plans.map((plan, index) => (
          <PlanCard key={plan._id} plan={plan} index={index} />
        ))}
      </div>
    </div>
  );
}
