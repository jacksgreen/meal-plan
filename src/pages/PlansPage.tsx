import { ChevronDown, Clock, ExternalLink, BookOpen, Plus, MoreVertical, Trash2, Pencil } from 'lucide-react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { format, parseISO } from 'date-fns';
import { useState, useRef, useEffect } from 'react';
import { PlanForm, MealForm, DeleteConfirmModal } from '../components/forms';
import type { Id } from '../../convex/_generated/dataModel';

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
        <h1 className="text-2xl font-medium text-ink mb-2">Past Plans</h1>
        <p className="text-stone">Your meal planning history will appear here.</p>
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

type MealData = {
  _id: Id<"meals">;
  weeklyPlanId: Id<"weeklyPlans">;
  date: string;
  dayOfWeek: string;
  name: string;
  notes?: string;
  recipeUrl?: string;
  estimatedTime?: number;
  tags: string[];
};

type PlanData = {
  _id: Id<"weeklyPlans">;
  weekNumber: number;
  year: number;
  startDate: string;
  endDate: string;
  mealCount: number;
  status: string;
};

// Action menu component
function ActionMenu({
  onDelete
}: {
  onDelete: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="action-menu" ref={menuRef}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="action-menu-trigger"
        aria-label="More options"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="action-menu-dropdown">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
              onDelete();
            }}
            className="action-menu-item action-menu-item--danger"
          >
            <Trash2 className="w-4 h-4" />
            Delete plan
          </button>
        </div>
      )}
    </div>
  );
}

// Plan card
function PlanCard({
  plan,
  index,
  onDelete
}: {
  plan: PlanData;
  index: number;
  onDelete: () => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={`expandable-card animate-fade-in-up opacity-0 stagger-${Math.min(index + 1, 7)}`}>
      <div className="expandable-card-header flex items-center gap-2">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex-1 text-left"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-1">
                <h3 className="text-lg font-medium text-ink">
                  {format(parseISO(plan.startDate), 'MMM d')} - {format(parseISO(plan.endDate), 'MMM d, yyyy')}
                </h3>
                <StatusBadge status={plan.status} />
              </div>
              <p className="text-sm text-stone">
                {plan.mealCount} {plan.mealCount === 1 ? 'meal' : 'meals'} planned
              </p>
            </div>

            <div
              className={`flex-shrink-0 w-8 h-8 rounded-full bg-ivory flex items-center justify-center transition-transform duration-300 ${
                isExpanded ? 'rotate-180' : ''
              }`}
            >
              <ChevronDown className="w-4 h-4 text-stone" />
            </div>
          </div>
        </button>

        <ActionMenu onDelete={onDelete} />
      </div>

      {isExpanded && <MealsView planId={plan._id} planStartDate={plan.startDate} />}
    </div>
  );
}

// Meals grid
function MealsView({
  planId,
  planStartDate
}: {
  planId: Id<"weeklyPlans">;
  planStartDate: string;
}) {
  const planData = useQuery(api.weeklyPlans.getPlan, { planId });
  const deleteMeal = useMutation(api.meals.remove);

  // Modal state
  const [editingMeal, setEditingMeal] = useState<{ date: string; meal: MealData | null } | null>(null);
  const [deletingMeal, setDeletingMeal] = useState<MealData | null>(null);

  if (!planData) {
    return (
      <div className="expandable-card-content pt-5">
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-ivory rounded-xl p-4">
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
            className="border-b border-linen last:border-b-0 p-4 transition-colors duration-200 animate-fade-in opacity-0 group"
            style={{ animationDelay: `${index * 40}ms`, animationFillMode: 'forwards' }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-ink">
                    {format(parseISO(meal.date), 'EEEE')}
                  </span>
                  <span className="text-sm text-stone">
                    {format(parseISO(meal.date), 'MMM d')}
                  </span>
                </div>
                <h4 className="text-sm text-graphite mb-1">{meal.name}</h4>
                {meal.notes && (
                  <p className="text-xs text-stone">{meal.notes}</p>
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

                {/* Edit/Delete buttons */}
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setEditingMeal({ date: meal.date, meal: meal as MealData })}
                    className="icon-button icon-button--sm"
                    aria-label="Edit meal"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeletingMeal(meal as MealData)}
                    className="icon-button icon-button--sm icon-button--danger"
                    aria-label="Delete meal"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add meal button */}
      <button
        onClick={() => setEditingMeal({ date: planStartDate, meal: null })}
        className="mt-4 w-full flex items-center justify-center gap-2 py-3 text-sm text-copper font-medium border border-linen hover:bg-ivory rounded transition-colors"
      >
        <Plus className="w-4 h-4" />
        Add meal to this week
      </button>

      {/* Meal Form Modal */}
      <MealForm
        isOpen={!!editingMeal}
        onClose={() => setEditingMeal(null)}
        date={editingMeal?.date || planStartDate}
        meal={editingMeal?.meal}
        onDelete={editingMeal?.meal ? () => {
          setDeletingMeal(editingMeal.meal);
          setEditingMeal(null);
        } : undefined}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deletingMeal}
        onClose={() => setDeletingMeal(null)}
        onConfirm={async () => {
          if (deletingMeal) {
            await deleteMeal({ mealId: deletingMeal._id });
          }
        }}
        title="Delete Meal"
        message="Are you sure you want to delete this meal? This action cannot be undone."
        itemName={deletingMeal?.name}
      />
    </div>
  );
}

export function PlansPage() {
  const plans = useQuery(api.weeklyPlans.listPlans, { limit: 20 });
  const deletePlan = useMutation(api.weeklyPlans.remove);

  // Modal state
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [deletingPlan, setDeletingPlan] = useState<PlanData | null>(null);

  if (plans === undefined) {
    return <PlansPageSkeleton />;
  }

  if (plans.length === 0) {
    return (
      <>
        <EmptyState />
        <div className="fixed bottom-24 right-6 sm:bottom-8">
          <button
            onClick={() => setShowPlanForm(true)}
            className="add-button"
          >
            <Plus className="w-4 h-4" />
            New Plan
          </button>
        </div>
        <PlanForm
          isOpen={showPlanForm}
          onClose={() => setShowPlanForm(false)}
        />
      </>
    );
  }

  return (
    <div>
      <div className="mb-10 animate-fade-in-up opacity-0">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-medium text-ink mb-2">Past Plans</h1>
            <p className="text-stone">
              Browse your meal planning history. Find favorites to repeat.
            </p>
          </div>
          <button
            onClick={() => setShowPlanForm(true)}
            className="add-button"
          >
            <Plus className="w-4 h-4" />
            New Plan
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {plans.map((plan, index) => (
          <PlanCard
            key={plan._id}
            plan={plan as PlanData}
            index={index}
            onDelete={() => setDeletingPlan(plan as PlanData)}
          />
        ))}
      </div>

      {/* Plan Form Modal */}
      <PlanForm
        isOpen={showPlanForm}
        onClose={() => setShowPlanForm(false)}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deletingPlan}
        onClose={() => setDeletingPlan(null)}
        onConfirm={async () => {
          if (deletingPlan) {
            await deletePlan({ planId: deletingPlan._id });
          }
        }}
        title="Delete Plan"
        message="This will delete the weekly plan and all meals associated with it. This action cannot be undone."
        itemName={deletingPlan ? `Week of ${format(parseISO(deletingPlan.startDate), 'MMM d, yyyy')}` : undefined}
      />
    </div>
  );
}
