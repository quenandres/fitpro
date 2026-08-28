import { X } from 'lucide-react';
import type { Ejercicio, EjercicioPersonalizado, Rutina, Usuario } from '../../types';
import { Sheet } from '../common/Sheet';
import { VistaDia } from '../userPlans/VistaDia';
import type { DiaRef } from '../../hooks/usePlanMutations';

interface Props {
  open: boolean;
  user: Usuario;
  diaRef: DiaRef;
  rutinas: Rutina[];
  ejercicios: Ejercicio[];
  onClose: () => void;
  onToggleEntreno: () => void;
  onSelectRutina: (rutina: Rutina) => void;
  onAddEjercicio: (ejercicio: EjercicioPersonalizado, replicar: boolean) => void;
  onRemoveEjercicio: (index: number) => void;
  onUpdateEjercicio: (index: number, updates: Partial<EjercicioPersonalizado>) => void;
  onResync: (rutina: Rutina) => void;
}

export function DiaEditorSheet({
  open,
  user,
  diaRef,
  rutinas,
  ejercicios,
  onClose,
  onToggleEntreno,
  onSelectRutina,
  onAddEjercicio,
  onRemoveEjercicio,
  onUpdateEjercicio,
  onResync,
}: Props) {
  const semanaPlan = user.plan.programacion_semanal.find((s) => s.semana === diaRef.semana);
  const dia = semanaPlan?.dias[diaRef.diaIndex];
  const titulo = dia ? `${dia.nombre} · Semana ${diaRef.semana}` : 'Editar día';

  return (
    <Sheet open={open} onClose={onClose} flexColumn immersive ariaLabel={titulo}>
      <div className="flex items-center justify-between gap-3 px-5 pt-5 pb-3 shrink-0 border-b border-line">
        <div className="min-w-0">
          <p className="font-sora text-base font-bold text-primary truncate">{titulo}</p>
          <p className="text-xs text-muted truncate">{user.nombre}</p>
        </div>
        <button type="button" className="fp-btn fp-btn-ghost shrink-0 p-2" onClick={onClose} aria-label="Cerrar">
          <X size={18} />
        </button>
      </div>

      <div className="overflow-y-auto min-h-0 flex-1 px-5 py-4">
        <VistaDia
          embedded
          user={user}
          semana={diaRef.semana}
          diaIndex={diaRef.diaIndex}
          onChangeSemana={() => {}}
          onChangeDia={() => {}}
          onToggleEntreno={onToggleEntreno}
          onSelectRutina={onSelectRutina}
          onAddEjercicio={onAddEjercicio}
          onRemoveEjercicio={onRemoveEjercicio}
          onUpdateEjercicio={onUpdateEjercicio}
          onResync={onResync}
          rutinas={rutinas}
          ejercicios={ejercicios}
        />
      </div>
    </Sheet>
  );
}
