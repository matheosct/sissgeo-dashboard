import { useRegistros } from '@/hooks/useRegistros';
import { useColaboradores } from '@/hooks/useColaboradores';
import { ColaboradoresTable } from '@/components/ColaboradoresTable';
import { Loader2 } from 'lucide-react';
import { AppHeader } from '@/components/AppHeader';

const Colaboradores = () => {
  const { data: registros, loading: loadingReg } = useRegistros();
  const { data: colaboradores, loading: loadingColab } = useColaboradores();

  if (loadingReg || loadingColab) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="container mx-auto px-4 py-6 space-y-6">
        <ColaboradoresTable colaboradores={colaboradores} registros={registros} />
      </main>
    </div>
  );
};

export default Colaboradores;
