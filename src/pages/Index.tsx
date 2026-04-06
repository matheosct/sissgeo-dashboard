import { useRegistros } from '@/hooks/useRegistros';
import { ThemeToggle } from '@/components/ThemeToggle';
import { StatCards } from '@/components/StatCards';
import { RecentRegistros } from '@/components/RecentRegistros';
import { TopAnimals } from '@/components/TopAnimals';
import { TimeChart } from '@/components/TimeChart';
import { BrazilMap } from '@/components/BrazilMap';
import { CSVUpload } from '@/components/CSVUpload';
import { Loader2, Activity } from 'lucide-react';

const Index = () => {
  const { data, loading, updateFromCSV } = useRegistros();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 backdrop-blur-md bg-background/80 border-b border-border">
        <div className="container mx-auto flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            <h1 className="text-lg font-bold">Dashboard SISS-Geo</h1>
          </div>
          <div className="flex items-center gap-2">
            <CSVUpload onUpload={updateFromCSV} />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        <StatCards data={data} />

        {/* Recent records full width */}
        <RecentRegistros data={data} />

        {/* Top animals + Map side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TopAnimals data={data} />
          <BrazilMap data={data} />
        </div>

        <TimeChart data={data} />
      </main>
    </div>
  );
};

export default Index;
