import { Download, RotateCcw, Upload } from 'lucide-react';
import { useDataStore } from '../../store/useDataStore';

interface Props {
  onExport: () => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onReset: () => void;
}

export const AdminDatosTab = ({ onExport, onImport, onReset }: Props) => {
  const { rutinas, ejercicios, unidades } = useDataStore();

  return (
    <div>
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
        <button className="fp-btn fp-btn-secondary" style={{ gap: 6, fontSize: 12, justifyContent: 'center' }} onClick={onExport}>
          <Download size={13} /> Exportar JSON
        </button>
        <label style={{ cursor: 'pointer' }}>
          <input type="file" accept=".json" onChange={onImport} style={{ display: 'none' }} />
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
          onClick={onReset}
        >
          <RotateCcw size={13} /> Restaurar por defecto
        </button>
      </div>
    </div>
  );
};
