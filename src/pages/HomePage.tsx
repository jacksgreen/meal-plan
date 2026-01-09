import { Clock, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { format, parseISO, isToday, isTomorrow, isYesterday, isPast, addDays } from 'date-fns';
import { useState, useMemo, useRef, useEffect } from 'react';

// Skeleton component
function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`skeleton ${className}`} />;
}

// Loading skeleton
function HomePageSkeleton() {
  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-8 w-20" />
      </div>
      <div className="flex gap-4 overflow-hidden">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="card p-6 min-w-[280px]">
            <Skeleton className="h-5 w-24 mb-2" />
            <Skeleton className="h-6 w-40 mb-3" />
            <Skeleton className="h-4 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Get friendly day label
function getDayLabel(dateStr: string): string {
  const date = parseISO(dateStr);
  if (isToday(date)) return 'Today';
  if (isTomorrow(date)) return 'Tomorrow';
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'EEEE');
}

// Day card in carousel
function DayCard({
  date,
  meal,
  isCenter
}: {
  date: Date;
  meal: any | null;
  isCenter: boolean;
}) {
  const dateStr = format(date, 'yyyy-MM-dd');
  const dayLabel = getDayLabel(dateStr);
  const isCurrentDay = isToday(date);
  const isPastDay = isPast(date) && !isCurrentDay;

  return (
    <div
      className={`card shrink-0 w-[280px] md:w-[340px] p-5 transition-opacity duration-300 ${
        isCenter ? '' : 'opacity-50 hover:opacity-70'
      } ${isCurrentDay && isCenter ? 'ring-2 ring-forest/30' : ''}`}
    >
      {/* Day header */}
      <div className="flex items-center gap-2 mb-3">
        <div>
          <p className={`font-medium text-base ${isCurrentDay ? 'text-forest' : 'text-charcoal'}`}>
            {dayLabel}
          </p>
          <p className="text-sm text-muted-foreground">
            {format(date, 'MMMM d')}
          </p>
        </div>
        {isCurrentDay && (
          <span className="badge-today text-xs ml-auto">today</span>
        )}
      </div>

      {/* Meal content */}
      {meal ? (
        <div>
          <h3 className={`font-medium text-lg mb-2 ${isPastDay ? 'text-muted-foreground' : 'text-charcoal'}`}>
            {meal.name}
          </h3>

          {meal.notes && (
            <p className={`text-sm text-muted-foreground mb-3 transition-opacity duration-300 ${isCenter ? 'opacity-100' : 'opacity-0 h-0 mb-0 overflow-hidden'}`}>
              {meal.notes}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2">
            {meal.estimatedTime && (
              <div className="time-indicator text-sm">
                <Clock className="w-4 h-4" strokeWidth={1.5} />
                <span>{meal.estimatedTime}m</span>
              </div>
            )}

            {meal.tags && meal.tags.length > 0 && (
              <div className={`flex flex-wrap gap-1.5 transition-opacity duration-300 ${isCenter ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>
                {meal.tags.slice(0, 3).map((tag: string) => (
                  <span key={tag} className="tag text-xs">{tag}</span>
                ))}
              </div>
            )}
          </div>

          {meal.recipeUrl && (
            <a
              href={meal.recipeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`btn-primary inline-flex items-center gap-2 mt-4 text-sm py-2 px-4 transition-opacity duration-300 ${isCenter ? 'opacity-100' : 'opacity-0 h-0 mt-0 overflow-hidden'}`}
            >
              View recipe
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      ) : (
        <div>
          <p className="text-muted-foreground italic text-base">
            {isPastDay ? 'No meal recorded' : 'Nothing planned'}
          </p>
          {isCenter && !isPastDay && (
            <p className="text-sm text-muted-foreground mt-2">
              That's okay.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export function HomePage() {
  const todayStr = new Date().toISOString().split('T')[0];
  const [centerIndex, setCenterIndex] = useState(3); // Start with today in center (index 3 of 7)
  const [snapEnabled, setSnapEnabled] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true);

  // Get meals around today
  const mealsData = useQuery(api.meals.getMealsAroundDate, {
    centerDate: todayStr,
    daysBefore: 3,
    daysAfter: 3,
  });

  // Generate all dates in range
  const daysWithMeals = useMemo(() => {
    if (!mealsData) return null;

    const days: Array<{ date: Date; dateStr: string; meal: any | null }> = [];
    const today = parseISO(todayStr);

    // Generate 7 days: 3 before + today + 3 after
    for (let i = -3; i <= 3; i++) {
      const date = addDays(today, i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const meal = mealsData.meals.find(m => m.date === dateStr) || null;
      days.push({ date, dateStr, meal });
    }

    return days;
  }, [mealsData, todayStr]);

  // Scroll to center card on mount and when centerIndex changes
  useEffect(() => {
    if (carouselRef.current && daysWithMeals) {
      const scrollToCenter = () => {
        const container = carouselRef.current;
        if (!container) return;
        const cards = container.children;
        if (cards[centerIndex]) {
          const card = cards[centerIndex] as HTMLElement;

          if (isInitialMount.current) {
            // Initial mount: use scrollIntoView for reliable centering
            card.scrollIntoView({ inline: 'center', behavior: 'instant' });
            isInitialMount.current = false;
            // Enable snap after scroll completes
            setTimeout(() => setSnapEnabled(true), 50);
          } else {
            card.scrollIntoView({ inline: 'center', behavior: 'smooth' });
          }
        }
      };

      // Use double RAF to ensure DOM has painted with updated card sizes
      requestAnimationFrame(() => {
        requestAnimationFrame(scrollToCenter);
      });
    }
  }, [centerIndex, daysWithMeals]);

  // Navigation
  const goBack = () => {
    if (centerIndex > 0) {
      setCenterIndex(centerIndex - 1);
    }
  };

  const goForward = () => {
    if (daysWithMeals && centerIndex < daysWithMeals.length - 1) {
      setCenterIndex(centerIndex + 1);
    }
  };

  const goToToday = () => {
    setCenterIndex(3); // Today is at index 3
  };

  const isViewingToday = centerIndex === 3;

  // Loading
  if (!mealsData || !daysWithMeals) {
    return <HomePageSkeleton />;
  }

  const currentDay = daysWithMeals[centerIndex];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6 animate-fade-in-up opacity-0">
        <div>
          <p className="text-lg font-medium text-charcoal">
            {getDayLabel(currentDay.dateStr)}
          </p>
          <p className="text-sm text-muted-foreground">
            {format(currentDay.date, 'MMMM d, yyyy')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={goBack}
            disabled={centerIndex === 0}
            className="week-nav-btn"
            aria-label="Previous day"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={goToToday}
            disabled={isViewingToday}
            className={`text-sm py-1.5 px-3 min-w-[60px] rounded-lg transition-colors ${
              isViewingToday
                ? 'text-muted-foreground/40 cursor-default'
                : 'text-charcoal hover:bg-muted'
            }`}
          >
            Today
          </button>

          <button
            onClick={goForward}
            disabled={centerIndex === daysWithMeals.length - 1}
            className="week-nav-btn"
            aria-label="Next day"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Carousel */}
      <div
        ref={carouselRef}
        className={`flex gap-4 overflow-x-auto hide-scrollbar pb-4 -mx-5 px-5 md:-mx-6 md:px-6 ${snapEnabled ? 'snap-x snap-mandatory' : ''}`}
      >
        {daysWithMeals.map((day, index) => (
          <div
            key={day.dateStr}
            className="snap-center"
            onClick={() => setCenterIndex(index)}
          >
            <DayCard
              date={day.date}
              meal={day.meal}
              isCenter={index === centerIndex}
            />
          </div>
        ))}
      </div>

      {/* Dots indicator */}
      <div className="flex justify-center gap-1.5 mt-4">
        {daysWithMeals.map((day, index) => (
          <button
            key={day.dateStr}
            onClick={() => setCenterIndex(index)}
            className={`w-2 h-2 rounded-full transition-all duration-200 ${
              index === centerIndex
                ? 'bg-forest w-4'
                : isToday(day.date)
                ? 'bg-gold'
                : 'bg-muted hover:bg-muted-foreground/30'
            }`}
            aria-label={`Go to ${getDayLabel(day.dateStr)}`}
          />
        ))}
      </div>
    </div>
  );
}
