import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Calendar, BookOpen, ChefHat } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'This Week', shortLabel: 'Week', icon: Calendar },
    { path: '/plans', label: 'Past Plans', shortLabel: 'Plans', icon: BookOpen },
    { path: '/recipes', label: 'Recipes', shortLabel: 'Recipes', icon: ChefHat },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-dvh bg-cream flex flex-col overflow-x-hidden">
      {/* Desktop Header */}
      <header className="hidden md:block nav-header sticky top-0 z-50">
        <div className="max-w-4xl xl:max-w-6xl mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Wordmark */}
            <Link to="/" className="flex items-center gap-3">
              <span className="text-xl text-ink" style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}>
                Meal Plan
              </span>
            </Link>

            {/* Navigation */}
            <nav className="flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`nav-link flex items-center gap-2 ${active ? 'active' : ''}`}
                  >
                    <Icon className="w-4 h-4" strokeWidth={1.5} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* Mobile Header */}
      <header className="md:hidden nav-header sticky top-0 z-50">
        <div className="px-5 py-4">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="text-lg text-ink" style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}>
              Meal Plan
            </span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col max-w-4xl xl:max-w-6xl mx-auto w-full px-5 md:px-8 py-6 md:py-10 pb-24 md:pb-10 min-h-0">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bottom-nav safe-area-bottom">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`bottom-nav-item flex-1 ${active ? 'active' : ''}`}
              >
                <Icon className="w-5 h-5" strokeWidth={1.5} />
                <span>{item.shortLabel}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
