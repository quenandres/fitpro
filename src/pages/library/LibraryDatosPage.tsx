import { useDataStore } from '../../store/useDataStore';
import { useTemplates } from '../../lib/gateway/hooks/useTemplates';
import { useExerciseCatalog } from '../../lib/gateway/hooks/useExercises';

export const LibraryDatosPage = () => {
  const unidades = useDataStore((s) => s.unidades);
  const { data: rutinas = [] } = useTemplates();
  const { data: ejercicios = [] } = useExerciseCatalog();

  const exportData = () =>
    JSON.stringify({ rutinas, ejercicios, unidades, exportedAt: new Date().toISOString() }, null, 2);

  return (
    <div className="fp-card p-4">
      <h1 className="font-sora text-xl font-bold mb-2">Exportar datos</h1>
      <p className="text-sm text-secondary mb-4">
        Rutinas y ejercicios provienen del gateway (no se importan desde localStorage).
        Solo las unidades siguen siendo locales.
      </p>
      <pre className="text-xs overflow-auto max-h-64 p-3 rounded-lg bg-overlay mb-3">
        {exportData()}
      </pre>
    </div>
  );
};
