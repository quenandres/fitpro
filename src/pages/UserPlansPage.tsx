import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronLeft, Plus, Sparkles } from 'lucide-react';
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useDataStore } from '../store/useDataStore';
import type { Rutina, Usuario } from '../types';
import usuariosData from '../data/usuarios.json';
import { CreatePlanWizard } from '../components/userPlans/CreatePlanWizard';
import { PlanViewSwitcher, type PlanView } from '../components/userPlans/PlanViewSwitcher';
import { VistaSemana } from '../components/userPlans/VistaSemana';
import { VistaMes } from '../components/userPlans/VistaMes';
import { VistaTotal } from '../components/userPlans/VistaTotal';
import { VistaDia } from '../components/userPlans/VistaDia';
import { DiaCard } from '../components/userPlans/DiaCard';
import { parseDragId, parseEjId } from '../components/userPlans/dragIds';
import { usePlanMutations, type DiaRef } from '../hooks/usePlanMutations';
import { ROUTES } from '../routes/paths';

const ACCENT = '#a371f7';

const UserPlansPage = () => {
  const navigate = useNavigate();
  const { rutinas, ejercicios } = useDataStore();
  const [usuarios, setUsuarios] = useState<Usuario[]>(usuariosData as Usuario[]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null);
  const [showWizard, setShowWizard] = useState(false);
  const [view, setView] = useState<PlanView>('semana');
  const [previousView, setPreviousView] = useState<PlanView>('semana');
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [selectedDiaIndex, setSelectedDiaIndex] = useState(0);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  const handleChangeView = (newView: PlanView) => {
    if (newView === 'dia') setPreviousView(view);
    setView(newView);
  };

  const handleBack = () => {
    if (view === 'dia') {
      setView(previousView);
    } else {
      setSelectedUser(null);
    }
  };

  const filteredUsers = useMemo(() => {
    if (!searchTerm) return usuarios;
    const term = searchTerm.toLowerCase();
    return usuarios.filter(
      (u) =>
        u.nombre.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term) ||
        u.objetivo.toLowerCase().includes(term)
    );
  }, [usuarios, searchTerm]);

  const handleUpdateUser = useCallback(
    (updated: Usuario) => {
      setUsuarios((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      setSelectedUser(updated);
    },
    []
  );

  const mutations = usePlanMutations(selectedUser, handleUpdateUser);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleCreateUser = (newUser: Usuario) => {
    setUsuarios((prev) => [...prev, newUser]);
    setSelectedUser(newUser);
    setShowWizard(false);
    setView('semana');
    setSelectedWeek(1);
  };

  const handleOpenDia = (semana: number, diaIndex: number) => {
    setPreviousView(view);
    setSelectedWeek(semana);
    setSelectedDiaIndex(diaIndex);
    setView('dia');
  };

  const handleDragStart = (e: DragStartEvent) => {
    setActiveDragId(String(e.active.id));
  };

  const handleDragEnd = (e: DragEndEvent) => {
    setActiveDragId(null);
    const { active, over } = e;
    if (!over) return;
    const activeId = String(active.id);
    const overId = String(over.id);
    if (activeId === overId) return;

    const ejActive = parseEjId(activeId);
    const ejOver = parseEjId(overId);
    if (ejActive && ejOver && ejActive.semana === ejOver.semana && ejActive.diaIndex === ejOver.diaIndex) {
      const semanaPlan = selectedUser?.plan.programacion_semanal.find((s) => s.semana === ejActive.semana);
      const dia = semanaPlan?.dias[ejActive.diaIndex];
      if (!dia) return;
      const newOrder = arrayMove(
        dia.ejercicios_personalizados.map((_, i) => i),
        ejActive.ejIndex,
        ejOver.ejIndex
      );
      if (newOrder[ejOver.ejIndex] === ejActive.ejIndex) return;
      mutations.reorderEjerciciosInDia(
        { semana: ejActive.semana, diaIndex: ejActive.diaIndex },
        ejActive.ejIndex,
        ejOver.ejIndex
      );
      return;
    }

    const diaActive = parseDragId(activeId);
    const diaOver = parseDragId(overId);
    if (diaActive && diaOver) {
      mutations.moveDia(diaActive as DiaRef, diaOver as DiaRef);
    }
  };

  const activeDragDia = useMemo(() => {
    if (!activeDragId || !selectedUser) return null;
    const ref = parseDragId(activeDragId);
    if (!ref) return null;
    const semana = selectedUser.plan.programacion_semanal.find((s) => s.semana === ref.semana);
    const dia = semana?.dias[ref.diaIndex];
    if (!dia) return null;
    return { dia, ...ref };
  }, [activeDragId, selectedUser]);

  const renderListaUsuarios = () => (
    <div>
      <div
        className="fp-card"
        style={{
          padding: 14,
          marginBottom: 18,
          display: 'flex',
          gap: 10,
          flexWrap: 'wrap',
          alignItems: 'center',
          borderRadius: 13,
        }}
      >
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search
            size={14}
            color="var(--text-muted)"
            style={{
              position: 'absolute',
              left: 11,
              top: '50%',
              transform: 'translateY(-50%)',
              pointerEvents: 'none',
            }}
          />
          <input
            className="fp-input"
            style={{ paddingLeft: 32 }}
            placeholder="Buscar usuarios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button
          onClick={() => navigate(ROUTES.library.ia)}
          className="fp-btn fp-btn-secondary"
          style={{ gap: 6, fontSize: 12 }}
        >
          <Sparkles size={14} /> Rutina IA
        </button>
        <button
          onClick={() => setShowWizard(true)}
          className="fp-btn fp-btn-primary"
          style={{ gap: 6, fontSize: 12 }}
        >
          <Plus size={14} /> Nuevo Plan
        </button>
      </div>

      <div
        style={{
          display: 'grid',
          gap: 12,
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        }}
      >
        {filteredUsers.map((user) => (
          <div
            key={user.id}
            className="fp-card fp-card-hover"
            onClick={() => {
              setSelectedUser(user);
              setView('semana');
              setSelectedWeek(1);
            }}
            style={{
              padding: 16,
              borderRadius: 13,
              cursor: 'pointer',
              border: '2px solid transparent',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: 'linear-gradient(135deg,#a371f7,#7c3aed)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>
                  {user.nombre
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </span>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                  {user.nombre}
                </p>
                <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{user.email}</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  padding: '3px 8px',
                  borderRadius: 6,
                  background: '#22c55e20',
                  color: '#22c55e',
                }}
              >
                {user.objetivo}
              </span>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  padding: '3px 8px',
                  borderRadius: 6,
                  background: '#58a6ff20',
                  color: '#58a6ff',
                }}
              >
                {user.nivel}
              </span>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  padding: '3px 8px',
                  borderRadius: 6,
                  background: '#f0883e20',
                  color: '#f0883e',
                }}
              >
                {user.plan.semanas} sem
              </span>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  padding: '3px 8px',
                  borderRadius: 6,
                  background: `${ACCENT}20`,
                  color: ACCENT,
                }}
              >
                {user.dias_entrenar} días/sem
              </span>
            </div>
          </div>
        ))}
        {filteredUsers.length === 0 && (
          <div
            style={{
              padding: 40,
              textAlign: 'center',
              background: 'var(--bg-overlay)',
              borderRadius: 12,
              gridColumn: '1 / -1',
            }}
          >
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              No hay usuarios que coincidan. Crea un nuevo plan para empezar.
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const renderCalendario = () => {
    if (!selectedUser) return null;

    return (
      <div>
        <div className="flex flex-col gap-3 mb-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={handleBack}
              className="fp-btn fp-btn-ghost shrink-0 p-2"
              aria-label={view === 'dia' ? 'Volver a la vista anterior' : 'Volver a usuarios'}
            >
              <ChevronLeft size={20} />
            </button>
            <div className="flex-1 min-w-0">
              <h2 className="font-sora text-base font-bold text-primary tracking-tight truncate">
                {selectedUser.nombre}
              </h2>
              <p className="text-xs truncate" style={{ color: ACCENT }}>{selectedUser.plan.nombre}</p>
            </div>
          </div>
          <PlanViewSwitcher
            view={view}
            onChange={handleChangeView}
            totalSemanas={selectedUser.plan.semanas}
          />
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: 8,
            marginBottom: 18,
          }}
        >
          <div style={{ padding: 10, borderRadius: 8, background: '#22c55e15' }}>
            <p style={{ fontSize: 9, color: '#22c55e', fontWeight: 700, letterSpacing: '0.08em' }}>
              OBJETIVO
            </p>
            <p style={{ fontSize: 11, fontWeight: 600 }}>{selectedUser.objetivo}</p>
          </div>
          <div style={{ padding: 10, borderRadius: 8, background: '#58a6ff15' }}>
            <p style={{ fontSize: 9, color: '#58a6ff', fontWeight: 700, letterSpacing: '0.08em' }}>
              NIVEL
            </p>
            <p style={{ fontSize: 11, fontWeight: 600 }}>{selectedUser.nivel}</p>
          </div>
          <div style={{ padding: 10, borderRadius: 8, background: '#f0883e15' }}>
            <p style={{ fontSize: 9, color: '#f0883e', fontWeight: 700, letterSpacing: '0.08em' }}>
              DÍAS/SEM
            </p>
            <p style={{ fontSize: 11, fontWeight: 600 }}>
              {selectedUser.plan.dias_entrenar_semana}
            </p>
          </div>
          <div style={{ padding: 10, borderRadius: 8, background: `${ACCENT}15` }}>
            <p style={{ fontSize: 9, color: ACCENT, fontWeight: 700, letterSpacing: '0.08em' }}>
              DURACIÓN
            </p>
            <p style={{ fontSize: 11, fontWeight: 600 }}>
              {selectedUser.plan.semanas} sem ·{' '}
              {Math.ceil(selectedUser.plan.semanas / 4)}{' '}
              {Math.ceil(selectedUser.plan.semanas / 4) === 1 ? 'mes' : 'meses'}
            </p>
          </div>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          {view === 'semana' && (
            <VistaSemana
              user={selectedUser}
              selectedWeek={selectedWeek}
              onSelectWeek={setSelectedWeek}
              onOpenDia={handleOpenDia}
              rutinas={rutinas}
            />
          )}
          {view === 'mes' && (
            <VistaMes user={selectedUser} onOpenDia={handleOpenDia} rutinas={rutinas} />
          )}
          {view === 'total' && (
            <VistaTotal
              user={selectedUser}
              onOpenDia={handleOpenDia}
              rutinas={rutinas}
              ejercicios={ejercicios}
            />
          )}
          {view === 'dia' && (
            <VistaDia
              user={selectedUser}
              semana={selectedWeek}
              diaIndex={selectedDiaIndex}
              onChangeSemana={setSelectedWeek}
              onChangeDia={setSelectedDiaIndex}
              onBack={() => setView(previousView)}
              onToggleEntreno={() =>
                mutations.toggleDiaEntreno({ semana: selectedWeek, diaIndex: selectedDiaIndex })
              }
              onSelectRutina={(r: Rutina) =>
                mutations.selectRutinaForDia(
                  { semana: selectedWeek, diaIndex: selectedDiaIndex },
                  r
                )
              }
              onAddEjercicio={(ej, replicar) =>
                (replicar ? mutations.addEjercicioReplicado : mutations.addEjercicio)(
                  { semana: selectedWeek, diaIndex: selectedDiaIndex },
                  ej
                )
              }
              onRemoveEjercicio={(idx) =>
                mutations.removeEjercicio(
                  { semana: selectedWeek, diaIndex: selectedDiaIndex },
                  idx
                )
              }
              onUpdateEjercicio={(idx, updates) =>
                mutations.updateEjercicio(
                  { semana: selectedWeek, diaIndex: selectedDiaIndex },
                  idx,
                  updates
                )
              }
              onResync={(rutina) =>
                mutations.resincronizarDesdeRutina(
                  { semana: selectedWeek, diaIndex: selectedDiaIndex },
                  rutina
                )
              }
              rutinas={rutinas}
              ejercicios={ejercicios}
            />
          )}

          <DragOverlay>
            {activeDragDia ? (
              <DiaCard
                dia={activeDragDia.dia}
                semana={activeDragDia.semana}
                diaIndex={activeDragDia.diaIndex}
                variant={view === 'mes' ? 'compact' : view === 'total' ? 'mini' : 'full'}
                draggable={false}
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    );
  };

  return (
    <>
      {!selectedUser && (
        <div className="flex items-center justify-between gap-3 mb-5">
          <div className="min-w-0">
            <p className="font-sora text-sm font-bold text-primary leading-tight">
              Planes de Entrenamiento
            </p>
            <p className="text-[10px] font-semibold" style={{ color: ACCENT }}>
              Calendario y gestión
            </p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0 rounded-lg border border-line bg-overlay px-2.5 py-1">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: ACCENT }} />
            <span className="text-[11px] font-semibold text-secondary">{usuarios.length}</span>
          </div>
        </div>
      )}

      {selectedUser ? renderCalendario() : renderListaUsuarios()}

      {showWizard && (
        <CreatePlanWizard
          rutinas={rutinas}
          nextUserId={Math.max(0, ...usuarios.map((u) => u.id)) + 1}
          onClose={() => setShowWizard(false)}
          onCreate={handleCreateUser}
        />
      )}
    </>
  );
};

export { UserPlansPage };
