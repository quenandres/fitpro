import { Download, RotateCcw, Upload } from 'lucide-react';
import { useDataStore } from '../../store/useDataStore';
import { useToastHook } from '../../components/common/Toast';

export const LibraryDatosPage = () => {
  const { exportData, importData, resetToDefault, rutinas, ejercicios, unidades } = useDataStore();
  const toast = useToastHook();

  const handleExport = () => {
    const blob = new Blob([exportData()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fitpro-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Datos exportados');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      importData(ev.target?.result as string)
        ? toast.success('Datos importados correctamente')
        : toast.error('Error al importar datos');
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleReset = () => {
    if (window.confirm('¿Restaurar datos por defecto? Esto eliminará todos los cambios.')) {
      resetToDefault();
      toast.success('Datos restaurados');
    }
  };

  return (
    <div>
        <section className="animate-slide-up" style={{ paddingBottom: 14 }}>
          <span className="badge badge-blue" style={{ fontSize: 11, padding: '3px 9px' }}>
            <Download size={10} style={{ marginRight: 3 }} />
            Respaldo
          </span>
          <h1
            className="font-sora"
            style={{
              fontSize: 24,
              fontWeight: 700,
              letterSpacing: '-.02em',
              color: 'var(--text-primary)',
              marginTop: 8,
              marginBottom: 4,
            }}
          >
            Datos locales
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            Exporta, importa o restaura el estado local de FitPro.
          </p>
        </section>

        <div
          className="fp-card"
          style={{
            padding: 14,
            marginBottom: 14,
            borderRadius: 13,
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 8,
            textAlign: 'center',
          }}
        >
          {[
            { val: rutinas.length, lbl: 'Rutinas', accent: '#f0883e' },
            { val: ejercicios.length, lbl: 'Ejercicios', accent: '#22c55e' },
            { val: unidades.length, lbl: 'Unidades', accent: '#58a6ff' },
          ].map(({ val, lbl, accent }) => (
            <div key={lbl}>
              <p className="font-sora" style={{ fontSize: 22, fontWeight: 700, color: accent }}>{val}</p>
              <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>{lbl}</p>
            </div>
          ))}
        </div>

        <div className="fp-card" style={{ padding: '16px', borderRadius: 13, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
            Respaldo de datos
          </p>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
            Exporta, importa o restaura el estado local de FitPro.
          </p>
          <button className="fp-btn fp-btn-secondary" style={{ gap: 6, fontSize: 12, justifyContent: 'center' }} onClick={handleExport}>
            <Download size={13} /> Exportar JSON
          </button>
          <label style={{ cursor: 'pointer' }}>
            <input type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
            <span
              className="fp-btn fp-btn-secondary"
              style={{
                gap: 6,
                fontSize: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-blue)',
                borderColor: 'rgba(88,166,255,.3)',
                width: '100%',
              }}
            >
              <Upload size={13} /> Importar JSON
            </span>
          </label>
          <button
            className="fp-btn fp-btn-ghost"
            style={{ gap: 6, fontSize: 12, color: 'var(--accent-red)', justifyContent: 'center' }}
            onClick={handleReset}
          >
            <RotateCcw size={13} /> Restaurar por defecto
          </button>
        </div>
    </div>
  );
};
