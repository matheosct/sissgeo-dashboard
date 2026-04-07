import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface Props {
  to: string;
  label: string;
  active?: boolean; // override auto-detection
}

export function AppNavLink({ to, label, active: forceActive }: Props) {
  const { pathname } = useLocation();
  const isActive = forceActive ?? pathname === to;

  return (
    <Link
      to={to}
      className={cn(
        'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
        isActive
          ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
      )}
    >
      {label}
    </Link>
  );
}
