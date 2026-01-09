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

// Day card component
function DayCard({
  date,
  meal,
  isCenter,
  onClick
}: {
  date: Date;
  meal: any | null;
  isCenter: boolean;
  onClick?: () => void;
}) {
  const dateStr = format(date, 'yyyy-MM-dd');
  const dayLabel = getDayLabel(dateStr);
  const isCurrentDay = isToday(date);
  const isPastDay = isPast(date) && !isCurrentDay;

  return (
    <div
      onClick={onClick}
      className={`
        card flex flex-col cursor-pointer
        shrink-0 w-[280px] p-5
        md:w-[360px] md:p-6
        lg:w-[420px] lg:p-7
        transition-all duration-300
        ${isCenter
          ? 'shadow-md'
          : 'opacity-60 hover:opacity-90'
        }
        ${isCurrentDay ? 'ring-2 ring-forest/20 ring-offset-2 ring-offset-sage' : ''}
      `}
    >
      {/* Day header */}
      <div className="flex items-center justify-between gap-2 mb-3 md:mb-4">
        <div className="min-w-0">
          <p className={`font-medium text-base md:text-lg leading-tight ${isCurrentDay ? 'text-forest' : 'text-charcoal'}`}>
            {dayLabel}
          </p>
          <p className="text-sm text-muted-foreground mt-0.5">
            {format(date, 'MMM d')}
          </p>
        </div>
        {isCurrentDay && (
          <span className="badge-today shrink-0">today</span>
        )}
      </div>

      {/* Meal content - grows to fill space */}
      <div className="flex-1 flex flex-col">
        {meal ? (
          <>
            <h3 className={`font-medium text-lg md:text-xl leading-snug mb-2 ${isPastDay ? 'text-muted-foreground' : 'text-charcoal'}`}>
              {meal.name}
            </h3>

            {meal.notes && (
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2 md:line-clamp-3">
                {meal.notes}
              </p>
            )}

            {/* Tags & time - always visible */}
            <div className="flex flex-wrap items-center gap-2 mt-auto pt-3">
              {meal.estimatedTime && (
                <div className="time-indicator text-sm">
                  <Clock className="w-4 h-4" strokeWidth={1.5} />
                  <span>{meal.estimatedTime}m</span>
                </div>
              )}

              {meal.tags && meal.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
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
                onClick={(e) => e.stopPropagation()}
                className="btn-primary inline-flex items-center justify-center gap-2 mt-4 text-sm py-2.5 px-4 w-full md:w-auto"
              >
                View recipe
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </>
        ) : (
          <div className="flex-1 flex flex-col justify-center">
            <p className="text-muted-foreground italic text-base">
              {isPastDay ? 'No meal recorded' : 'Nothing planned'}
            </p>
            {!isPastDay && (
              <p className="text-sm text-muted-foreground/70 mt-1">
                That's okay.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function HomePage() {
  const todayStr = new Date().toISOString().split('T')[0];
  const [centerIndex, setCenterIndex] = useState(3); // Start with today in center (index 3 of 7)
  const [snapEnabled, setSnapEnabled] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true);
  const isProgrammaticScroll = useRef(false);

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
          isProgrammaticScroll.current = true;

          if (isInitialMount.current) {
            // Initial mount: use scrollIntoView for reliable centering
            card.scrollIntoView({ inline: 'center', behavior: 'instant' });
            isInitialMount.current = false;
            // Enable snap after scroll completes
            setTimeout(() => {
              setSnapEnabled(true);
              isProgrammaticScroll.current = false;
            }, 50);
          } else {
            card.scrollIntoView({ inline: 'center', behavior: 'smooth' });
            // Reset after smooth scroll completes
            setTimeout(() => {
              isProgrammaticScroll.current = false;
            }, 350);
          }
        }
      };

      // Use double RAF to ensure DOM has painted with updated card sizes
      requestAnimationFrame(() => {
        requestAnimationFrame(scrollToCenter);
      });
    }
  }, [centerIndex, daysWithMeals]);

  // Sync centerIndex when user manually scrolls
  useEffect(() => {
    const container = carouselRef.current;
    if (!container || !daysWithMeals) return;

    let scrollTimeout: number;

    const handleScroll = () => {
      if (isProgrammaticScroll.current) return;

      // Debounce to wait for scroll to settle
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const containerRect = container.getBoundingClientRect();
        const containerCenter = containerRect.left + containerRect.width / 2;

        let closestIndex = 0;
        let closestDistance = Infinity;

        Array.from(container.children).forEach((child, index) => {
          const cardRect = child.getBoundingClientRect();
          const cardCenter = cardRect.left + cardRect.width / 2;
          const distance = Math.abs(containerCenter - cardCenter);

          if (distance < closestDistance) {
            closestDistance = distance;
            closestIndex = index;
          }
        });

        if (closestIndex !== centerIndex) {
          setCenterIndex(closestIndex);
        }
      }, 50);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      container.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [daysWithMeals, centerIndex]);

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
    <div className="flex flex-col flex-1">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-4 md:mb-6 animate-fade-in-up opacity-0">
        <div>
          <p className="text-lg md:text-xl font-medium text-charcoal">
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

      {/* Carousel - all screen sizes */}
      <div
        ref={carouselRef}
        className={`flex-1 flex items-stretch gap-4 md:gap-6 overflow-x-auto hide-scrollbar pb-4 -mx-5 px-5 md:-mx-6 md:px-6 ${snapEnabled ? 'snap-x snap-mandatory' : ''}`}
      >
        {daysWithMeals.map((day, index) => (
          <div
            key={day.dateStr}
            className="snap-center flex"
          >
            <DayCard
              date={day.date}
              meal={day.meal}
              isCenter={index === centerIndex}
              onClick={() => setCenterIndex(index)}
            />
          </div>
        ))}
      </div>

      {/* Dots indicator */}
      <div className="flex justify-center gap-1.5 pt-2 mt-auto">
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
