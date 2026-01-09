import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Calendar, BookOpen, ChefHat, Sparkles } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'This Week', icon: Calendar },
    { path: '/plans', label: 'Past Plans', icon: BookOpen },
    { path: '/recipes', label: 'Recipes', icon: ChefHat },
    { path: '/to-try', label: 'To Try', icon: Sparkles },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Header */}
      <header className="hidden md:block nav-header sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              <div className="w-9 h-9 bg-forest rounded-xl flex items-center justify-center">
                <ChefHat className="w-5 h-5 text-white" strokeWidth={1.5} />
              </div>
              <span className="text-lg font-medium text-charcoal">Meal Plan</span>
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
                    <Icon className="w-[18px] h-[18px]" strokeWidth={1.5} />
                    <span className="text-sm">{item.label}</span>
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
            <div className="w-8 h-8 bg-forest rounded-lg flex items-center justify-center">
              <ChefHat className="w-4 h-4 text-white" strokeWidth={1.5} />
            </div>
            <span className="text-base font-medium text-charcoal">Meal Plan</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-5 md:px-6 py-8 md:py-10 pb-28 md:pb-10">
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
                <span>{item.label.split(' ').pop()}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
