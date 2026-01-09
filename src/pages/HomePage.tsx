import { Clock, ExternalLink, ChevronLeft, ChevronRight, CalendarDays, Sparkles, Utensils, Loader2 } from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { format, parseISO, isToday, isTomorrow, isYesterday, isPast, addDays } from 'date-fns';
import { useState, useMemo, useRef, useEffect, useCallback } from 'react';

// Initial range - reasonable defaults
const INITIAL_DAYS_BEFORE = 14;
const INITIAL_DAYS_AFTER = 30;
const LOAD_MORE_DAYS = 14;

// Skeleton component
function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`skeleton ${className}`} />;
}

// Loading skeleton
function HomePageSkeleton() {
  const carouselRef = useRef<HTMLDivElement>(null);
  const centerCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (centerCardRef.current) {
      centerCardRef.current.scrollIntoView({ inline: 'center', behavior: 'instant' });
    }
  }, []);

  return (
    <div className="flex flex-col flex-1 animate-fade-in">
      {/* Header skeleton */}
      <div className="flex items-center justify-between gap-4 mb-4 md:mb-6">
        <div>
          <Skeleton className="h-6 md:h-7 w-24 mb-1.5" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-9 rounded-full" />
          <Skeleton className="h-9 w-[60px] rounded-lg" />
          <Skeleton className="h-9 w-9 rounded-full" />
        </div>
      </div>

      {/* Carousel skeleton */}
      <div
        ref={carouselRef}
        className="flex-1 flex items-stretch gap-4 md:gap-5 overflow-x-auto hide-scrollbar pb-4 -mx-5 px-5 md:-mx-6 md:px-6"
      >
        <div className="shrink-0 w-[calc(50vw-20px-150px)] md:w-[calc(50vw-24px-175px)] lg:w-[calc(50vw-24px-200px)]" />
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            ref={i === 2 ? centerCardRef : null}
            className={`card flex flex-col shrink-0 w-[300px] p-5 md:w-[350px] md:p-6 lg:w-[400px] lg:p-7 ${
              i === 2 ? 'ring-2 ring-forest/20' : 'opacity-50'
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-4">
              <div>
                <Skeleton className="h-5 md:h-6 w-20 mb-1.5" />
                <Skeleton className="h-4 w-12" />
              </div>
              {i === 2 && <Skeleton className="h-6 w-14 rounded-full" />}
            </div>
            <Skeleton className="h-7 w-4/5 mb-3" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4 mb-4" />
            <div className="flex items-center gap-2 mt-auto">
              <Skeleton className="h-6 w-14 rounded-md" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          </div>
        ))}
        <div className="shrink-0 w-[calc(50vw-20px-150px)] md:w-[calc(50vw-24px-175px)] lg:w-[calc(50vw-24px-200px)]" />
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

// Empty state component for unplanned days
function EmptyDayState({ isPastDay }: { isPastDay: boolean }) {
  if (isPastDay) {
    return (
      <div className="empty-day-state">
        <div className="empty-day-icon empty-day-icon--past">
          <CalendarDays className="w-6 h-6" />
        </div>
        <p className="empty-day-title">No meal recorded</p>
        <p className="empty-day-subtitle">This day has passed</p>
      </div>
    );
  }

  return (
    <div className="empty-day-state">
      <div className="empty-day-icon">
        <Sparkles className="w-6 h-6" />
      </div>
      <p className="empty-day-title">Not planned yet</p>
      <p className="empty-day-subtitle">A blank canvas for something delicious</p>
    </div>
  );
}

// Month indicator pill
function MonthIndicator({ date, isNewMonth }: { date: Date; isNewMonth: boolean }) {
  if (!isNewMonth) return null;
  return (
    <div className="month-indicator">
      {format(date, 'MMMM')}
    </div>
  );
}

// Day card component
function DayCard({
  date,
  meal,
  isCenter,
  isNewMonth,
  onClick
}: {
  date: Date;
  meal: any | null;
  isCenter: boolean;
  isNewMonth: boolean;
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
        day-card
        ${isCenter ? 'day-card--center' : 'day-card--side'}
        ${isCurrentDay ? 'day-card--today' : ''}
        ${isPastDay ? 'day-card--past' : ''}
        ${!meal ? 'day-card--empty' : ''}
      `}
    >
      {/* Month indicator for new months */}
      <MonthIndicator date={date} isNewMonth={isNewMonth && !isCenter} />

      {/* Day header */}
      <div className="day-card-header">
        <div className="day-card-date-group">
          <p className={`day-card-label ${isCurrentDay ? 'day-card-label--today' : ''}`}>
            {dayLabel}
          </p>
          <p className="day-card-date">
            {format(date, 'MMM d')}
          </p>
        </div>
        {isCurrentDay && (
          <span className="today-pill">
            <span className="today-pill-dot" />
            now
          </span>
        )}
      </div>

      {/* Meal content */}
      <div className="day-card-body">
        {meal ? (
          <>
            <h3 className={`day-card-meal-name ${isPastDay ? 'day-card-meal-name--past' : ''}`}>
              {meal.name}
            </h3>

            {meal.notes && (
              <p className="day-card-notes">
                {meal.notes}
              </p>
            )}

            {/* Tags & time */}
            <div className="day-card-meta">
              {meal.estimatedTime > 0 && (
                <div className="time-chip">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{meal.estimatedTime}m</span>
                </div>
              )}

              {meal.tags && meal.tags.length > 0 && (
                <div className="day-card-tags">
                  {meal.tags.slice(0, 3).map((tag: string) => (
                    <span key={tag} className="meal-tag">{tag}</span>
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
                className="recipe-button"
              >
                <Utensils className="w-4 h-4" />
                View recipe
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </>
        ) : (
          <EmptyDayState isPastDay={isPastDay} />
        )}
      </div>
    </div>
  );
}

type DayData = { date: Date; dateStr: string; meal: any | null; isNewMonth: boolean };

export function HomePage() {
  const todayStr = format(new Date(), 'yyyy-MM-dd');

  // Query range state
  const [daysBefore, setDaysBefore] = useState(INITIAL_DAYS_BEFORE);
  const [daysAfter, setDaysAfter] = useState(INITIAL_DAYS_AFTER);

  // UI state
  const [centerIndex, setCenterIndex] = useState(INITIAL_DAYS_BEFORE); // Start at today
  const [snapEnabled, setSnapEnabled] = useState(false);
  const [carouselReady, setCarouselReady] = useState(false);
  const [loadingPast, setLoadingPast] = useState(false);
  const [loadingFuture, setLoadingFuture] = useState(false);

  // Data state - this persists while loading more
  const [daysWithMeals, setDaysWithMeals] = useState<DayData[] | null>(null);

  const carouselRef = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true);
  const isProgrammaticScroll = useRef(false);
  const lastCenterIndexRef = useRef(centerIndex);
  const intentionalNavigation = useRef(false);
  const isLoadingMore = useRef(false);
  const lastLoadedRange = useRef({ before: 0, after: 0 });
  const lastMealsData = useRef<any>(null);

  // Query meals for current range
  const mealsDataRaw = useQuery(api.meals.getMealsAroundDate, {
    centerDate: todayStr,
    daysBefore,
    daysAfter,
  });

  // Keep last valid data to prevent flashing when query params change
  // Update ref in effect to follow React rules
  useEffect(() => {
    if (mealsDataRaw) {
      lastMealsData.current = mealsDataRaw;
    }
  }, [mealsDataRaw]);

  const mealsData = mealsDataRaw ?? lastMealsData.current;

  // Build days array helper
  const buildDaysArray = useCallback((before: number, after: number, meals: any[]) => {
    const today = parseISO(todayStr);
    const days: DayData[] = [];
    let lastMonth: number | null = null;

    for (let i = -before; i <= after; i++) {
      const date = addDays(today, i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const meal = meals.find((m: any) => m.date === dateStr) || null;
      const currentMonth = date.getMonth();
      const isNewMonth = lastMonth !== null && lastMonth !== currentMonth;
      lastMonth = currentMonth;

      days.push({ date, dateStr, meal, isNewMonth });
    }

    return days;
  }, [todayStr]);

  // Update days when data arrives
  useEffect(() => {
    if (!mealsData) return;

    // Check if this is new data (range changed)
    const rangeChanged =
      lastLoadedRange.current.before !== daysBefore ||
      lastLoadedRange.current.after !== daysAfter;

    const newDays = buildDaysArray(daysBefore, daysAfter, mealsData.meals);

    if (!daysWithMeals || !rangeChanged) {
      // First load or same range (just data update) - replace
      setDaysWithMeals(newDays);
    } else {
      // Range expanded - merge, keeping scroll position stable
      const wasLoadingPast = loadingPast;
      const addedDays = wasLoadingPast
        ? daysBefore - lastLoadedRange.current.before
        : daysAfter - lastLoadedRange.current.after;

      setDaysWithMeals(newDays);

      // Adjust centerIndex if we added days to the past
      if (wasLoadingPast && addedDays > 0) {
        setCenterIndex(prev => prev + addedDays);
        lastCenterIndexRef.current = lastCenterIndexRef.current + addedDays;
      }
    }

    lastLoadedRange.current = { before: daysBefore, after: daysAfter };
    setLoadingPast(false);
    setLoadingFuture(false);
    isLoadingMore.current = false;
  }, [mealsData, daysBefore, daysAfter, buildDaysArray]);

  // Find today's index
  const todayIndex = useMemo(() => {
    if (!daysWithMeals) return INITIAL_DAYS_BEFORE;
    return daysWithMeals.findIndex(d => d.dateStr === todayStr);
  }, [daysWithMeals, todayStr]);

  // Load more past days
  const loadMorePast = useCallback(() => {
    if (isLoadingMore.current || loadingPast) return;
    isLoadingMore.current = true;
    setLoadingPast(true);
    setDaysBefore(prev => prev + LOAD_MORE_DAYS);
  }, [loadingPast]);

  // Load more future days
  const loadMoreFuture = useCallback(() => {
    if (isLoadingMore.current || loadingFuture) return;
    isLoadingMore.current = true;
    setLoadingFuture(true);
    setDaysAfter(prev => prev + LOAD_MORE_DAYS);
  }, [loadingFuture]);

  // Scroll to center card on mount and when centerIndex changes intentionally
  useEffect(() => {
    if (carouselRef.current && daysWithMeals) {
      const centerIndexChanged = centerIndex !== lastCenterIndexRef.current;
      lastCenterIndexRef.current = centerIndex;

      // Only scroll on initial mount or intentional navigation (button clicks)
      const shouldScroll = isInitialMount.current || intentionalNavigation.current;
      if (!shouldScroll) return;

      const scrollToCenter = () => {
        const container = carouselRef.current;
        if (!container) return;
        const cards = container.querySelectorAll('.day-card-wrapper');
        if (cards[centerIndex]) {
          const card = cards[centerIndex] as HTMLElement;
          isProgrammaticScroll.current = true;

          if (isInitialMount.current) {
            card.scrollIntoView({ inline: 'center', behavior: 'instant' });
            isInitialMount.current = false;
            setTimeout(() => {
              setSnapEnabled(true);
              setCarouselReady(true);
              isProgrammaticScroll.current = false;
            }, 50);
          } else {
            card.scrollIntoView({ inline: 'center', behavior: 'smooth' });
            setTimeout(() => {
              isProgrammaticScroll.current = false;
              intentionalNavigation.current = false;
            }, 350);
          }
        }
      };

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
    const totalDays = daysWithMeals.length;

    const handleScroll = () => {
      // Skip if we're in a programmatic scroll
      if (isProgrammaticScroll.current) return;

      clearTimeout(scrollTimeout);
      scrollTimeout = window.setTimeout(() => {
        if (isProgrammaticScroll.current) return;

        const containerRect = container.getBoundingClientRect();
        const containerCenter = containerRect.left + containerRect.width / 2;

        let closestIndex = 0;
        let closestDistance = Infinity;

        const cards = container.querySelectorAll('.day-card-wrapper');
        cards.forEach((child, index) => {
          const cardRect = child.getBoundingClientRect();
          const cardCenter = cardRect.left + cardRect.width / 2;
          const distance = Math.abs(containerCenter - cardCenter);

          if (distance < closestDistance) {
            closestDistance = distance;
            closestIndex = index;
          }
        });

        // Update centerIndex to match what user is viewing
        if (closestIndex !== centerIndex) {
          setCenterIndex(closestIndex);
        }

        // Check if we need to load more days
        if (closestIndex <= 3 && !isLoadingMore.current) {
          loadMorePast();
        } else if (closestIndex >= totalDays - 4 && !isLoadingMore.current) {
          loadMoreFuture();
        }
      }, 150);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      container.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [daysWithMeals, centerIndex, loadMorePast, loadMoreFuture]);

  // Navigation with debounce protection
  const goBack = useCallback(() => {
    if (isProgrammaticScroll.current || isLoadingMore.current) return;
    if (centerIndex > 0) {
      intentionalNavigation.current = true;
      setCenterIndex(prev => Math.max(0, prev - 1));
    }
    if (centerIndex <= 3) {
      loadMorePast();
    }
  }, [centerIndex, loadMorePast]);

  const goForward = useCallback(() => {
    if (isProgrammaticScroll.current || isLoadingMore.current) return;
    if (daysWithMeals && centerIndex < daysWithMeals.length - 1) {
      intentionalNavigation.current = true;
      setCenterIndex(prev => Math.min((daysWithMeals?.length || 1) - 1, prev + 1));
    }
    if (daysWithMeals && centerIndex >= daysWithMeals.length - 4) {
      loadMoreFuture();
    }
  }, [centerIndex, daysWithMeals, loadMoreFuture]);

  const goToToday = useCallback(() => {
    if (isProgrammaticScroll.current) return;
    intentionalNavigation.current = true;
    setCenterIndex(todayIndex);
  }, [todayIndex]);

  const isViewingToday = centerIndex === todayIndex;

  // Only show skeleton on initial load (before we have any data)
  // Once daysWithMeals is set, keep showing it even while loading more
  if (!daysWithMeals) {
    return <HomePageSkeleton />;
  }

  const currentDay = daysWithMeals[centerIndex];

  return (
    <div className="home-page">
      {/* Header */}
      <div className="home-header animate-fade-in-up">
        <div className="home-header-left">
          <h1 className="home-header-day">
            {getDayLabel(currentDay.dateStr)}
          </h1>
          <p className="home-header-date">
            {format(currentDay.date, 'MMMM d, yyyy')}
          </p>
        </div>

        <div className="home-header-nav">
          <button
            onClick={goBack}
            className="nav-arrow"
            aria-label="Previous day"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={goToToday}
            disabled={isViewingToday}
            className={`today-button ${isViewingToday ? 'today-button--disabled' : ''}`}
          >
            Today
          </button>

          <button
            onClick={goForward}
            className="nav-arrow"
            aria-label="Next day"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Carousel with fade edges */}
      <div className="carousel-container">
        {/* Loading indicator - past */}
        {loadingPast && (
          <div className="carousel-loader carousel-loader--left">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        )}

        <div
          ref={carouselRef}
          className={`carousel hide-scrollbar ${snapEnabled ? 'carousel--snap' : ''} ${carouselReady ? 'carousel--ready' : ''}`}
        >
          {/* Leading spacer */}
          <div className="carousel-spacer" />

          {daysWithMeals.map((day, index) => (
            <div
              key={day.dateStr}
              className="day-card-wrapper snap-center"
            >
              <DayCard
                date={day.date}
                meal={day.meal}
                isCenter={index === centerIndex}
                isNewMonth={day.isNewMonth}
                onClick={() => {
                  if (isProgrammaticScroll.current || isLoadingMore.current) return;
                  if (index !== centerIndex) {
                    intentionalNavigation.current = true;
                    setCenterIndex(index);
                  }
                }}
              />
            </div>
          ))}

          {/* Trailing spacer */}
          <div className="carousel-spacer" />
        </div>

        {/* Loading indicator - future */}
        {loadingFuture && (
          <div className="carousel-loader carousel-loader--right">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        )}
      </div>

      {/* Progress dots - show subset around current */}
      <div className="carousel-dots">
        {daysWithMeals.slice(Math.max(0, centerIndex - 3), Math.min(daysWithMeals.length, centerIndex + 4)).map((day, i) => {
          const actualIndex = Math.max(0, centerIndex - 3) + i;
          return (
            <button
              key={day.dateStr}
              onClick={() => setCenterIndex(actualIndex)}
              className={`carousel-dot ${
                actualIndex === centerIndex
                  ? 'carousel-dot--active'
                  : actualIndex === todayIndex
                  ? 'carousel-dot--today'
                  : ''
              }`}
              aria-label={`Go to ${getDayLabel(day.dateStr)}`}
            />
          );
        })}
      </div>
    </div>
  );
}
