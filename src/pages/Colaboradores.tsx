import { useRegistros } from '@/hooks/useRegistros';
import { useColaboradores } from '@/hooks/useColaboradores';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ColaboradoresTable } from '@/components/ColaboradoresTable';
import { CSVUpload } from '@/components/CSVUpload';
import { Loader2, Activity } from 'lucide-react';
import { AppNavLink } from '@/components/AppNavLink';

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
      <header className="sticky top-0 z-40 backdrop-blur-md bg-background/80 border-b border-border">
        <div className="container mx-auto flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Activity className="h-6 w-6 text-primary" />
              <h1 className="text-lg font-bold">Dashboard SISS-Geo</h1>
            </div>
            <nav className="flex items-center gap-1">
              <AppNavLink to="/" label="Registros" />
              <AppNavLink to="/colaboradores" label="Colaboradores" active />
              <AppNavLink to="/insights" label="Insights" />
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <CSVUpload onUpload={() => 0} />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        <ColaboradoresTable colaboradores={colaboradores} registros={registros} />
      </main>
    </div>
  );
};

export default Colaboradores;
