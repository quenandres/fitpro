import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Search, Plus, Sparkles, Users } from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { EmptyState } from '../components/common/EmptyState';
import { useDataStore } from '../store/useDataStore';
import { useUsuariosStore } from '../store/useUsuariosStore';
import { getUltimaSesion } from '../store/useSesionesStore';
import type { Usuario } from '../types';
import { CreatePlanWizard } from '../components/userPlans/CreatePlanWizard';
import { usePlanMutations } from '../hooks/usePlanMutations';
import { UserProgressPanel } from '../components/users/UserProgressPanel';
import { UserDetailHeader } from '../components/users/UserDetailHeader';
import type { UserDetailTab } from '../components/users/UserDetailTabSwitcher';
import { UserCard } from '../components/users/UserCard';
import { UserMedidasPanel } from '../components/users/UserMedidasPanel';
import { UserPlanWorkspace } from '../components/users/UserPlanWorkspace';
import { recencyToneFromSesion } from '../utils/userSummary';
import { ROUTES } from '../routes/paths';

function parseDetailTab(raw: string | null): UserDetailTab {
  if (raw === 'entrenamientos') return 'entrenamientos';
  if (raw === 'medidas') return 'medidas';
  return 'progreso';
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
          if (tab !== 'entrenamientos') next.delete('dia');
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
        || u.objetivo.toLowerCase().includes(term)
        || u.plan.nombre.toLowerCase().includes(term),
    );
  }, [usuarios, searchTerm]);

  const frios = useMemo(
    () => usuarios.filter((u) => recencyToneFromSesion(getUltimaSesion(u.id)) === 'cold').length,
    [usuarios],
  );

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
            <span className="badge badge-blue" style={{ fontSize: 11, padding: '3px 9px' }}>
              <Users size={10} style={{ marginRight: 3 }} />
              Roster
            </span>
            <h1
              className="font-sora text-[22px] sm:text-2xl mt-2"
              style={{
                fontWeight: 800,
                lineHeight: 1.15,
                letterSpacing: '-.03em',
                color: 'var(--text-primary)',
              }}
            >
              Tus clientes
            </h1>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 6 }}>
              {usuarios.length} fichas
              {frios > 0 ? ` · ${frios} se están enfriando` : ' · todos con rastro reciente'}
            </p>
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
                  placeholder="Nombre, plan u objetivo…"
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
                <div style={{ gridColumn: '1 / -1' }}>
                  <EmptyState
                    icon={Users}
                    title={searchTerm ? 'Nadie coincide' : 'Aún no hay clientes'}
                    description={
                      searchTerm
                        ? 'Prueba otro nombre, objetivo o plan.'
                        : 'Crea un cliente para asignarle un plan y ver su progreso.'
                    }
                    action={
                      !searchTerm ? (
                        <button type="button" className="fp-btn fp-btn-primary" onClick={() => setShowWizard(true)}>
                          <Plus size={14} />
                          Nuevo cliente
                        </button>
                      ) : undefined
                    }
                  />
                </div>
              ) : null}
            </div>
          </div>
        ) : selectedUserLive ? (
          <div>
            <UserDetailHeader
              user={selectedUserLive}
              tab={detailTab}
              onTabChange={setDetailTab}
              onBack={handleBack}
            />

            {detailTab === 'progreso' ? (
              <UserProgressPanel usuarioId={selectedUserLive.id} />
            ) : detailTab === 'medidas' ? (
              <UserMedidasPanel user={selectedUserLive} />
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
