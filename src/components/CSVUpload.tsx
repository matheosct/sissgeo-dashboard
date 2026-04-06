import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  onUpload: (text: string) => number;
}

export function CSVUpload({ onUpload }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const count = onUpload(text);
      if (count > 0) {
        toast.success(`${count.toLocaleString('pt-BR')} registros carregados com sucesso!`);
      } else {
        toast.error('Nenhum registro encontrado no arquivo.');
      }
    };
    reader.readAsText(file, 'iso-8859-1');
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <>
      <input ref={inputRef} type="file" accept=".csv" className="hidden" onChange={handleFile} />
      <Button variant="outline" size="sm" onClick={() => inputRef.current?.click()} className="gap-2">
        <Upload className="h-4 w-4" />
        <span className="hidden sm:inline">Atualizar CSV</span>
      </Button>
    </>
  );
}
