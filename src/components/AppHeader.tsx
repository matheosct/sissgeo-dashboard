import { useState } from 'react';
import { Activity, Menu, X } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { AppNavLink } from '@/components/AppNavLink';
import { CSVUpload } from '@/components/CSVUpload';
import { Button } from '@/components/ui/button';

interface Props {
  onUpload?: (text: string) => number;
  showUpload?: boolean;
}

const NAV_ITEMS = [
  { to: '/', label: 'Registros' },
  { to: '/colaboradores', label: 'Colaboradores' },
  { to: '/insights', label: 'Insights' },
  { to: '/robots', label: 'Robots' },
];

export function AppHeader({ onUpload, showUpload }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-background/80 border-b border-border">
      <div className="container mx-auto flex items-center justify-between h-14 px-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            <h1 className="text-lg font-bold hidden sm:block">Dashboard SISS-Geo</h1>
          </div>
          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map(n => (
              <AppNavLink key={n.to} to={n.to} label={n.label} />
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          {showUpload && onUpload && <CSVUpload onUpload={onUpload} />}
          <ThemeToggle />
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen(v => !v)}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>
      {/* Mobile nav */}
      {mobileOpen && (
        <nav className="md:hidden border-t border-border bg-background px-4 py-2 flex flex-col gap-1">
          {NAV_ITEMS.map(n => (
            <AppNavLink key={n.to} to={n.to} label={n.label} />
          ))}
        </nav>
      )}
    </header>
  );
}
