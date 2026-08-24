import { Link } from 'react-router-dom';
import { LayoutTemplate, X } from 'lucide-react';
import { ROUTES } from '../../../routes/paths';

interface Props {
  presetName: string;
}

export const PresetBanner = ({ presetName }: Props) => (
  <div
    className="fp-card animate-slide-down"
    style={{
      marginBottom: 14,
      padding: '10px 12px',
      borderRadius: 12,
      borderColor: 'rgba(88,166,255,.35)',
      background: 'rgba(88,166,255,.08)',
      display: 'flex',
      alignItems: 'center',
      gap: 10,
    }}
  >
    <LayoutTemplate size={16} color="#58a6ff" className="shrink-0" />
    <div style={{ flex: 1, minWidth: 0 }}>
      <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>
        Basado en plantilla: {presetName}
      </p>
      <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
        Puedes editar ejercicios y valores antes de guardar.
      </p>
    </div>
    <Link
      to={ROUTES.library.rutinasPlantillas}
      className="fp-btn fp-btn-ghost"
      style={{ gap: 4, fontSize: 11, padding: '5px 8px', flexShrink: 0 }}
    >
      <X size={12} /> Cambiar
    </Link>
  </div>
);
