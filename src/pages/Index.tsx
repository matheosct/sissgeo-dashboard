import { useRegistros } from '@/hooks/useRegistros';
import { ThemeToggle } from '@/components/ThemeToggle';
import { StatCards } from '@/components/StatCards';
import { RecentRegistros } from '@/components/RecentRegistros';
import { TopAnimals } from '@/components/TopAnimals';
import { TimeChart } from '@/components/TimeChart';
import { BrazilMap } from '@/components/BrazilMap';
import { Loader2, Activity } from 'lucide-react';

const Index = () => {
  const { data, loading } = useRegistros();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-background/80 border-b border-border">
        <div className="container mx-auto flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-bold">Painel de Registros</h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Stat cards */}
        <StatCards data={data} />

        {/* Middle row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentRegistros data={data} />
          <TopAnimals data={data} />
        </div>

        {/* Time chart */}
        <TimeChart data={data} />

        {/* Map */}
        <BrazilMap data={data} />
      </main>
    </div>
  );
};

export default Index;
