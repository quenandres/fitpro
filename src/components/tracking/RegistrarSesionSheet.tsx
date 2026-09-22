import { useMemo, useState, type FormEvent } from 'react';
import { Plus } from 'lucide-react';
import type {
  EjercicioEjecutado,
  EjercicioPersonalizado,
  SesionModalidad,
  Usuario,
} from '../../types';
import { Sheet } from '../common/Sheet';
import { DemoBadge } from '../common/DemoBadge';
import { useSesionesStore } from '../../store/useSesionesStore';
import { useDataStore } from '../../store/useDataStore';
import {
  buildSesionEntrenamiento,
  ejercicioPersonalizadoToEjecutado,
  unidadAceptaPeso,
} from '../../utils/sessionSetUtils';
import { fechaLocalISO } from '../../utils/trackingUtils';

interface Props {
  open: boolean;
  onClose: () => void;
  usuarios: Usuario[];
  defaultUsuarioId?: number | null;
  onSaved?: (sesionId: string) => void;
}

function ejerciciosFromSesionPlan(ejercicios: EjercicioPersonalizado[]): EjercicioEjecutado[] {
  return ejercicios.map(ejercicioPersonalizadoToEjecutado);
}

export function RegistrarSesionSheet({
  open,
  onClose,
  usuarios,
  defaultUsuarioId,
  onSaved,
}: Props) {
  const rutinas = useDataStore((s) => s.rutinas);
  const addSesion = useSesionesStore((s) => s.addSesion);

  const [usuarioId, setUsuarioId] = useState<number>(() => defaultUsuarioId ?? usuarios[0]?.id ?? 0);
  const [fecha, setFecha] = useState(() => fechaLocalISO(new Date()));
  const [sesionOrden, setSesionOrden] = useState<string>('');
  const [duracionMin, setDuracionMin] = useState(45);
  const [modalidad, setModalidad] = useState<SesionModalidad>('fuerza');
  const [ejercicios, setEjercicios] = useState<EjercicioEjecutado[]>([]);
  const [error, setError] = useState('');

  const usuario = usuarios.find((u) => u.id === usuarioId) ?? usuarios[0];

  const sesionesPlan = useMemo(() => {
    if (!usuario) return [];
    return usuario.plan.programacion_semanal[0]?.sesiones ?? [];
  }, [usuario]);

  const handleSesionPlanChange = (orden: string) => {
    setSesionOrden(orden);
    if (!orden || !usuario) {
      setEjercicios([]);
      return;
    }
    const sesion = sesionesPlan.find((s) => s.orden === Number(orden));
    if (!sesion) return;

    if (sesion.ejercicios_personalizados.length > 0) {
      setEjercicios(ejerciciosFromSesionPlan(sesion.ejercicios_personalizados));
      return;
    }

    const rutina = rutinas.find((r) => r.id === sesion.rutina_id);
    if (rutina) {
      setEjercicios(rutina.ejercicios.map((e) => ejercicioPersonalizadoToEjecutado({
        ejercicio_id: e.ejercicio_id,
        nombre: e.nombre,
        series: e.series,
        valor: e.valor,
        unidad_id: e.unidad_id,
      })));
    }
  };

  const updateSerie = (
    ejIndex: number,
    serieIndex: number,
    patch: Partial<{ reps: number; peso_kg: number | null }>,
  ) => {
    setEjercicios((prev) =>
      prev.map((ej, i) =>
        i !== ejIndex
          ? ej
          : {
              ...ej,
              series: ej.series.map((s, si) =>
                si !== serieIndex ? s : { ...s, ...patch },
              ),
            },
      ),
    );
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!usuario) {
      setError('Selecciona un cliente.');
      return;
    }
    if (ejercicios.length === 0) {
      setError('Añade al menos un ejercicio con series.');
      return;
    }

    const sesionPlan = sesionOrden
      ? sesionesPlan.find((s) => s.orden === Number(sesionOrden))
      : undefined;
    const rutinaId = sesionPlan?.rutina_id ?? rutinas[0]?.id ?? 0;
    const rutinaNombre =
      sesionPlan?.rutina_nombre ?? rutinas.find((r) => r.id === rutinaId)?.nombre ?? 'Sesión libre';

    const id = `ses_${Date.now().toString(36)}`;
    const sesion = buildSesionEntrenamiento({
      id,
      usuario_id: usuario.id,
      fecha,
      rutina_id: rutinaId,
      rutina_nombre: rutinaNombre,
      modalidad,
      duracion_min: duracionMin,
      sesion_orden: sesionOrden ? Number(sesionOrden) : undefined,
      ejercicios,
    });

    addSesion(sesion);
    onSaved?.(id);
    onClose();
  };

  if (!open) return null;

  return (
    <Sheet open={open} onClose={onClose} ariaLabel="Registrar sesión" flexColumn>
      <form onSubmit={handleSubmit} className="flex flex-col min-h-0 flex-1">
        <div className="shrink-0 mb-4">
          <h2 className="font-sora text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
            Registrar sesión
          </h2>
        </div>
        <div className="overflow-y-auto min-h-0 flex-1 flex flex-col gap-4 pb-4">
          <div className="flex items-center gap-2">
            <DemoBadge label="Demo · mock" />
            <p className="text-xs text-muted">
              Registra lo que el cliente ejecutó. Datos en localStorage hasta conectar backend.
            </p>
          </div>

          <div>
            <label htmlFor="reg-cliente" className="fp-cal-label block mb-1.5">
              Cliente
            </label>
            <select
              id="reg-cliente"
              className="fp-input w-full"
              value={usuarioId}
              onChange={(ev) => {
                setUsuarioId(Number(ev.target.value));
                setSesionOrden('');
                setEjercicios([]);
              }}
            >
              {usuarios.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="reg-fecha" className="fp-cal-label block mb-1.5">
                Fecha
              </label>
              <input
                id="reg-fecha"
                type="date"
                className="fp-input w-full"
                value={fecha}
                onChange={(ev) => setFecha(ev.target.value)}
              />
            </div>
            <div>
              <label htmlFor="reg-duracion" className="fp-cal-label block mb-1.5">
                Duración (min)
              </label>
              <input
                id="reg-duracion"
                type="number"
                min={5}
                max={240}
                className="fp-input w-full"
                value={duracionMin}
                onChange={(ev) => setDuracionMin(Number(ev.target.value))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="reg-sesion" className="fp-cal-label block mb-1.5">
                Sesión del plan
              </label>
              <select
                id="reg-sesion"
                className="fp-input w-full"
                value={sesionOrden}
                onChange={(ev) => handleSesionPlanChange(ev.target.value)}
              >
                <option value="">— Manual —</option>
                {sesionesPlan.map((s) => (
                  <option key={s.orden} value={String(s.orden)}>
                    {s.nombre || `Sesión ${s.orden}`}
                    {s.rutina_nombre ? ` · ${s.rutina_nombre}` : ''}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="reg-modalidad" className="fp-cal-label block mb-1.5">
                Modalidad
              </label>
              <select
                id="reg-modalidad"
                className="fp-input w-full"
                value={modalidad}
                onChange={(ev) => setModalidad(ev.target.value as SesionModalidad)}
              >
                <option value="fuerza">Fuerza</option>
                <option value="isometrico">Isométrico</option>
                <option value="otro">Otro</option>
              </select>
            </div>
          </div>

          {ejercicios.length === 0 ? (
            <p className="text-sm text-muted py-4 text-center">
              Elige una sesión del plan para cargar ejercicios, o selecciona una sesión con rutina asignada.
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              {ejercicios.map((ej, ejIndex) => (
                <div key={`${ej.ejercicio_id}-${ejIndex}`} className="fp-card" style={{ padding: 12 }}>
                  <p className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                    {ej.nombre}
                  </p>
                  <div className="flex flex-col gap-2">
                    {ej.series.map((serie, serieIndex) => (
                      <div key={serie.n} className="grid grid-cols-[auto_1fr_1fr] gap-2 items-center">
                        <span className="text-xs text-muted w-8">S{serie.n}</span>
                        <input
                          type="number"
                          min={0}
                          className="fp-input"
                          placeholder="Reps"
                          value={serie.reps}
                          onChange={(ev) =>
                            updateSerie(ejIndex, serieIndex, { reps: Number(ev.target.value) })
                          }
                        />
                        {unidadAceptaPeso(ej.unidad_id) ? (
                          <input
                            type="number"
                            min={0}
                            step={0.5}
                            className="fp-input"
                            placeholder="Peso (kg)"
                            value={serie.peso_kg ?? ''}
                            onChange={(ev) =>
                              updateSerie(ejIndex, serieIndex, {
                                peso_kg: ev.target.value === '' ? null : Number(ev.target.value),
                              })
                            }
                          />
                        ) : (
                          <span className="text-xs text-muted px-2">—</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {error ? (
            <p className="text-xs" style={{ color: 'var(--accent-red)' }}>
              {error}
            </p>
          ) : null}
        </div>

        <div className="shrink-0 pt-3 border-t border-[var(--border)] flex gap-2">
          <button type="button" className="fp-btn fp-btn-secondary flex-1" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="fp-btn fp-btn-primary flex-1">
            <Plus size={16} />
            Guardar sesión
          </button>
        </div>
      </form>
    </Sheet>
  );
}
