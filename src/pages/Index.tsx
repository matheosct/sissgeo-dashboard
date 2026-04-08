import { useRegistros } from '@/hooks/useRegistros';
import { useColaboradores } from '@/hooks/useColaboradores';
import { StatCards } from '@/components/StatCards';
import { RecentRegistros } from '@/components/RecentRegistros';
import { TopAnimals } from '@/components/TopAnimals';
import { TimeChart } from '@/components/TimeChart';
import { BrazilMap } from '@/components/BrazilMap';
import { Loader2 } from 'lucide-react';
import { AppHeader } from '@/components/AppHeader';

const Index = () => {
  const { data: registros, loading: loadingReg, updateFromCSV: updateRegistros } = useRegistros();
  const { loading: loadingColab } = useColaboradores();

  if (loadingReg || loadingColab) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader showUpload onUpload={updateRegistros} />
      <main className="container mx-auto px-4 py-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <StatCards data={registros} />
          <TopAnimals data={registros} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div style={{ height: '460px' }}>
            <RecentRegistros data={registros} />
          </div>
          <BrazilMap data={registros} />
        </div>
        <TimeChart data={registros} />
      </main>
    </div>
  );
};

export default Index;
