import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Search, ChevronLeft, Plus, Sparkles, Users } from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { useDataStore } from '../store/useDataStore';
import { useUsuariosStore } from '../store/useUsuariosStore';
import type { Usuario } from '../types';
import { CreatePlanWizard } from '../components/userPlans/CreatePlanWizard';
import { usePlanMutations } from '../hooks/usePlanMutations';
import { UserProgressPanel } from '../components/users/UserProgressPanel';
import { UserDetailTabSwitcher, type UserDetailTab } from '../components/users/UserDetailTabSwitcher';
import { UserCard } from '../components/users/UserCard';
import { UserPlanWorkspace } from '../components/users/UserPlanWorkspace';
import { ROUTES } from '../routes/paths';

const ACCENT = '#58a6ff';

function parseDetailTab(raw: string | null): UserDetailTab {
  return raw === 'entrenamientos' ? 'entrenamientos' : 'progreso';
}

function parseSemana(raw: string | null, max: number): number {
  const n = raw ? Number(raw) : 1;
  if (Number.isNaN(n) || n < 1) return 1;
  return Math.min(max, Math.floor(n));
}

function parseDiaIndex(raw: string | null): number | null {
  if (raw == null || raw === '') return null;
  const n = Number(raw);
  if (Number.isNaN(n) || n < 0 || n > 6) return null;
  return Math.floor(n);
}

export function UsuariosPage() {
  const navigate = useNavigate();
  const { userId: userIdParam } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { rutinas, ejercicios } = useDataStore();
  const usuarios = useUsuariosStore((s) => s.usuarios);
  const updateUsuario = useUsuariosStore((s) => s.updateUsuario);
  const addUsuario = useUsuariosStore((s) => s.addUsuario);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null);
  const [showWizard, setShowWizard] = useState(false);
  const [selectedDiaIndex, setSelectedDiaIndex] = useState(0);

  const detailTab = parseDetailTab(searchParams.get('tab'));

  const selectedUserLive = useMemo(
    () => (selectedUser ? usuarios.find((u) => u.id === selectedUser.id) ?? null : null),
    [usuarios, selectedUser],
  );

  const maxSemanas = selectedUserLive?.plan.semanas ?? 1;
  const semana = parseSemana(searchParams.get('semana'), maxSemanas);
  const diaEditorIndex = parseDiaIndex(searchParams.get('dia'));

  const setDetailTab = useCallback(
    (tab: UserDetailTab) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (tab === 'progreso') next.delete('tab');
          else next.set('tab', tab);
          next.delete('dia');
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const setSemana = useCallback(
    (n: number) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (n <= 1) next.delete('semana');
          else next.set('semana', String(n));
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const setDiaEditorIndex = useCallback(
    (diaIndex: number | null) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (diaIndex == null) next.delete('dia');
          else next.set('dia', String(diaIndex));
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  useEffect(() => {
    if (!userIdParam) {
      setSelectedUser(null);
      return;
    }
    const id = Number(userIdParam);
    if (Number.isNaN(id)) {
      navigate(ROUTES.usuarios, { replace: true });
      return;
    }
    const user = usuarios.find((u) => u.id === id);
    if (user) {
      setSelectedUser(user);
    } else if (usuarios.length > 0) {
      navigate(ROUTES.usuarios, { replace: true });
    }
  }, [userIdParam, usuarios, navigate]);

  useEffect(() => {
    if (selectedUserLive && diaEditorIndex != null) {
      setSelectedDiaIndex(diaEditorIndex);
    }
  }, [diaEditorIndex, selectedUserLive]);

  const handleBack = () => {
    setSelectedUser(null);
    navigate(ROUTES.usuarios);
  };

  const handleSelectUser = (user: Usuario) => {
    setSelectedUser(user);
    setSelectedDiaIndex(0);
    navigate(ROUTES.usuario(user.id));
  };

  const filteredUsers = useMemo(() => {
    if (!searchTerm) return usuarios;
    const term = searchTerm.toLowerCase();
    return usuarios.filter(
      (u) =>
        u.nombre.toLowerCase().includes(term)
        || u.email.toLowerCase().includes(term)
        || u.objetivo.toLowerCase().includes(term),
    );
  }, [usuarios, searchTerm]);

  const handleUpdateUser = useCallback(
    (updated: Usuario) => {
      updateUsuario(updated.id, () => updated);
      setSelectedUser(updated);
    },
    [updateUsuario],
  );

  const mutations = usePlanMutations(selectedUserLive, handleUpdateUser);

  const handleCreateUser = (newUser: Usuario) => {
    addUsuario(newUser);
    setShowWizard(false);
    handleSelectUser(newUser);
  };

  return (
    <AppShell width="wide">
      <div className="animate-slide-up min-w-0">
        {!selectedUser ? (
          <section style={{ paddingTop: 12, paddingBottom: 16 }}>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-1">
              <div className="min-w-0">
                <span className="badge badge-blue" style={{ fontSize: 11, padding: '3px 9px' }}>
                  <Users size={10} style={{ marginRight: 3 }} />
                  Clientes
                </span>
                <h1
                  className="font-sora text-[22px] sm:text-2xl mt-2"
                  style={{
                    fontWeight: 700,
                    lineHeight: 1.2,
                    letterSpacing: '-.02em',
                    color: 'var(--text-primary)',
                  }}
                >
                  Usuarios
                </h1>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
                  Progreso, planes y entrenamientos asignados.
                </p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0 rounded-lg border border-line bg-overlay px-2.5 py-1">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: ACCENT }} />
                <span className="text-[11px] font-semibold text-secondary">{usuarios.length}</span>
              </div>
            </div>
          </section>
        ) : null}

        {!selectedUser ? (
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
              <div className="fp-input-group flex-1" style={{ minWidth: 200 }}>
                <Search size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                <input
                  type="search"
                  placeholder="Buscar usuarios…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  aria-label="Buscar usuarios"
                />
              </div>
              <button
                type="button"
                onClick={() => navigate(ROUTES.library.ia)}
                className="fp-btn fp-btn-secondary"
                style={{ gap: 6, fontSize: 12 }}
              >
                <Sparkles size={14} />
                Rutina IA
              </button>
              <button
                type="button"
                onClick={() => setShowWizard(true)}
                className="fp-btn fp-btn-primary"
                style={{ gap: 6, fontSize: 12 }}
              >
                <Plus size={14} />
                Nuevo cliente
              </button>
            </div>

            <div
              style={{
                display: 'grid',
                gap: 12,
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              }}
            >
              {filteredUsers.map((user) => (
                <UserCard key={user.id} user={user} onClick={() => handleSelectUser(user)} />
              ))}
              {filteredUsers.length === 0 ? (
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
                    No hay usuarios que coincidan. Crea un nuevo cliente para empezar.
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        ) : selectedUserLive ? (
          <div>
            <div className="flex flex-col gap-3 mb-4">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  type="button"
                  onClick={handleBack}
                  className="fp-btn fp-btn-ghost shrink-0 p-2"
                  aria-label="Volver a usuarios"
                >
                  <ChevronLeft size={20} />
                </button>
                <div className="flex-1 min-w-0">
                  <h2 className="font-sora text-base font-bold text-primary tracking-tight truncate">
                    {selectedUserLive.nombre}
                  </h2>
                  <p className="text-xs truncate" style={{ color: ACCENT }}>
                    {selectedUserLive.plan.nombre}
                  </p>
                </div>
              </div>
              <UserDetailTabSwitcher tab={detailTab} onChange={setDetailTab} />
            </div>

            {detailTab === 'progreso' ? (
              <UserProgressPanel usuarioId={selectedUserLive.id} />
            ) : (
              <UserPlanWorkspace
                user={selectedUserLive}
                rutinas={rutinas}
                ejercicios={ejercicios}
                mutations={mutations}
                semana={semana}
                onSemanaChange={setSemana}
                diaEditorIndex={diaEditorIndex}
                onDiaEditorChange={setDiaEditorIndex}
                selectedDiaIndex={selectedDiaIndex}
                onSelectedDiaChange={setSelectedDiaIndex}
              />
            )}
          </div>
        ) : null}

        {showWizard ? (
          <CreatePlanWizard
            rutinas={rutinas}
            nextUserId={Math.max(0, ...usuarios.map((u) => u.id)) + 1}
            onClose={() => setShowWizard(false)}
            onCreate={handleCreateUser}
          />
        ) : null}
      </div>
    </AppShell>
  );
}
