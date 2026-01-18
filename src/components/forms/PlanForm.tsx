import { useState, useEffect } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { format, startOfWeek, endOfWeek, getWeek, getYear, parseISO, addDays } from 'date-fns';
import { Modal, Button, Input } from '../ui';

interface PlanFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PlanForm({ isOpen, onClose }: PlanFormProps) {
  const [dateInput, setDateInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPlan = useMutation(api.weeklyPlans.create);

  // Reset form when opening
  useEffect(() => {
    if (isOpen) {
      // Default to next Monday
      const today = new Date();
      const nextMonday = startOfWeek(addDays(today, 7), { weekStartsOn: 1 });
      setDateInput(format(nextMonday, 'yyyy-MM-dd'));
      setError(null);
    }
  }, [isOpen]);

  // Calculate week info from selected date
  const getWeekInfo = (dateStr: string) => {
    if (!dateStr) return null;
    try {
      const date = parseISO(dateStr);
      const weekStart = startOfWeek(date, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(date, { weekStartsOn: 1 });
      return {
        weekNumber: getWeek(date, { weekStartsOn: 1 }),
        year: getYear(date),
        startDate: format(weekStart, 'yyyy-MM-dd'),
        endDate: format(weekEnd, 'yyyy-MM-dd'),
        startLabel: format(weekStart, 'MMMM d'),
        endLabel: format(weekEnd, 'MMMM d, yyyy'),
      };
    } catch {
      return null;
    }
  };

  const weekInfo = getWeekInfo(dateInput);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!weekInfo) {
      setError('Please select a valid date');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await createPlan({
        weekNumber: weekInfo.weekNumber,
        year: weekInfo.year,
        startDate: weekInfo.startDate,
        endDate: weekInfo.endDate,
      });

      onClose();
    } catch (err) {
      setError('Failed to create plan. A plan for this week may already exist.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Weekly Plan"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            loading={isSubmitting}
            disabled={!weekInfo}
          >
            Create Plan
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        <Input
          label="Select any date in the week"
          name="date"
          type="date"
          value={dateInput}
          onChange={(e) => setDateInput(e.target.value)}
        />

        {weekInfo && (
          <div className="mt-4 p-4 bg-sage rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">This will create a plan for:</p>
            <p className="font-medium text-charcoal">
              Week {weekInfo.weekNumber}, {weekInfo.year}
            </p>
            <p className="text-sm text-muted-foreground">
              {weekInfo.startLabel} - {weekInfo.endLabel}
            </p>
          </div>
        )}
      </form>
    </Modal>
  );
}
