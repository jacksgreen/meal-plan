import { useState, useEffect } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { format, parseISO, startOfWeek, endOfWeek, getWeek, getYear } from 'date-fns';
import { Modal, Button, Input, Textarea, TagInput } from '../ui';
import type { Id } from '../../../convex/_generated/dataModel';

interface MealData {
  _id: Id<"meals">;
  weeklyPlanId: Id<"weeklyPlans">;
  date: string;
  dayOfWeek: string;
  name: string;
  notes?: string;
  recipeUrl?: string;
  estimatedTime?: number;
  tags: string[];
}

interface MealFormProps {
  isOpen: boolean;
  onClose: () => void;
  date: string; // ISO date string YYYY-MM-DD
  meal?: MealData | null;
  onDelete?: () => void;
}

export function MealForm({ isOpen, onClose, date, meal, onDelete }: MealFormProps) {
  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');
  const [recipeUrl, setRecipeUrl] = useState('');
  const [estimatedTime, setEstimatedTime] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createMeal = useMutation(api.meals.create);
  const updateMeal = useMutation(api.meals.update);
  const createPlan = useMutation(api.weeklyPlans.create);
  const existingPlan = useQuery(api.weeklyPlans.getPlanByDate, { date });

  const isEdit = !!meal;

  // Reset form when opening
  useEffect(() => {
    if (isOpen) {
      if (meal) {
        setName(meal.name);
        setNotes(meal.notes || '');
        setRecipeUrl(meal.recipeUrl || '');
        setEstimatedTime(meal.estimatedTime ? String(meal.estimatedTime) : '');
        setTags(meal.tags || []);
      } else {
        setName('');
        setNotes('');
        setRecipeUrl('');
        setEstimatedTime('');
        setTags([]);
      }
      setError(null);
    }
  }, [isOpen, meal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('Please enter a meal name');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      if (isEdit && meal) {
        // Update existing meal
        await updateMeal({
          mealId: meal._id,
          name: name.trim(),
          notes: notes.trim() || undefined,
          recipeUrl: recipeUrl.trim() || undefined,
          estimatedTime: estimatedTime ? parseInt(estimatedTime) : undefined,
          tags,
        });
      } else {
        // Create new meal - first ensure we have a plan
        let planId = existingPlan?._id;

        if (!planId) {
          // Create a new weekly plan for this date
          const dateObj = parseISO(date);
          const weekStart = startOfWeek(dateObj, { weekStartsOn: 1 }); // Monday
          const weekEnd = endOfWeek(dateObj, { weekStartsOn: 1 }); // Sunday

          planId = await createPlan({
            weekNumber: getWeek(dateObj, { weekStartsOn: 1 }),
            year: getYear(dateObj),
            startDate: format(weekStart, 'yyyy-MM-dd'),
            endDate: format(weekEnd, 'yyyy-MM-dd'),
          });
        }

        // Create the meal
        const dateObj = parseISO(date);
        await createMeal({
          weeklyPlanId: planId,
          date,
          dayOfWeek: format(dateObj, 'EEEE'),
          name: name.trim(),
          notes: notes.trim() || undefined,
          recipeUrl: recipeUrl.trim() || undefined,
          estimatedTime: estimatedTime ? parseInt(estimatedTime) : undefined,
          tags,
        });
      }

      onClose();
    } catch (err) {
      setError('Failed to save meal. Please try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const dateObj = parseISO(date);
  const dayLabel = format(dateObj, 'EEEE');
  const dateLabel = format(dateObj, 'MMMM d, yyyy');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Meal' : 'Add Meal'}
      footer={
        <>
          {isEdit && onDelete && (
            <Button variant="danger" onClick={onDelete}>
              Delete
            </Button>
          )}
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            loading={isSubmitting}
          >
            {isEdit ? 'Save Changes' : 'Add Meal'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        <div className="mb-5 pb-4 border-b border-border">
          <p className="text-sm text-muted-foreground">{dayLabel}</p>
          <p className="font-medium text-charcoal">{dateLabel}</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        <Input
          label="Meal name"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onClear={() => setName('')}
          placeholder="What's for dinner?"
          autoFocus
        />

        <Textarea
          label="Notes (optional)"
          name="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onClear={() => setNotes('')}
          placeholder="Any special instructions or variations?"
          rows={3}
        />

        <Input
          label="Recipe URL (optional)"
          name="recipeUrl"
          type="url"
          value={recipeUrl}
          onChange={(e) => setRecipeUrl(e.target.value)}
          onClear={() => setRecipeUrl('')}
          placeholder="https://..."
        />

        <Input
          label="Estimated time (minutes)"
          name="estimatedTime"
          type="number"
          value={estimatedTime}
          onChange={(e) => setEstimatedTime(e.target.value)}
          onClear={() => setEstimatedTime('')}
          placeholder="30"
          min="0"
        />

        <TagInput
          label="Tags"
          value={tags}
          onChange={setTags}
          placeholder="quick, vegetarian, etc."
        />
      </form>
    </Modal>
  );
}
