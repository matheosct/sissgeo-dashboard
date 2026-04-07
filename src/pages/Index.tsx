import { useState } from 'react';
import { useRegistros } from '@/hooks/useRegistros';
import { useColaboradores } from '@/hooks/useColaboradores';
import { ThemeToggle } from '@/components/ThemeToggle';
import { StatCards } from '@/components/StatCards';
import { RecentRegistros } from '@/components/RecentRegistros';
import { TopAnimals } from '@/components/TopAnimals';
import { TimeChart } from '@/components/TimeChart';
import { BrazilMap } from '@/components/BrazilMap';
import { CSVUpload } from '@/components/CSVUpload';
import { ColaboradoresTable } from '@/components/ColaboradoresTable';
import { Loader2, Activity, ClipboardList, Users } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Index = () => {
  const { data: registros, loading: loadingReg, updateFromCSV: updateRegistros } = useRegistros();
  const { data: colaboradores, loading: loadingColab } = useColaboradores();
  const [activeTab, setActiveTab] = useState<'registros' | 'colaboradores'>('registros');

  const loading = loadingReg || loadingColab;

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
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Activity className="h-6 w-6 text-primary" />
              <h1 className="text-lg font-bold">Dashboard SISS-Geo</h1>
            </div>
            <Tabs value={activeTab} onValueChange={v => setActiveTab(v as any)}>
              <TabsList>
                <TabsTrigger value="registros" className="gap-1.5">
                  <ClipboardList className="h-4 w-4" />
                  Registros
                </TabsTrigger>
                <TabsTrigger value="colaboradores" className="gap-1.5">
                  <Users className="h-4 w-4" />
                  Colaboradores
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <div className="flex items-center gap-2">
            <CSVUpload onUpload={updateRegistros} />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {activeTab === 'registros' ? (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <StatCards data={registros} />
              <div className="h-full" style={{ maxHeight: '360px' }}>
                <RecentRegistros data={registros} />
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TopAnimals data={registros} />
              <BrazilMap data={registros} />
            </div>
            <TimeChart data={registros} />
          </>
        ) : (
          <ColaboradoresTable colaboradores={colaboradores} registros={registros} />
        )}
      </main>
    </div>
  );
};

export default Index;
