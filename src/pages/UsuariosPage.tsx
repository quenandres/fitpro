import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Search, Plus, Sparkles, Users } from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { EmptyState } from '../components/common/EmptyState';
import { useDataStore } from '../store/useDataStore';
import { useUsuariosStore } from '../store/useUsuariosStore';
import { getUltimaSesion } from '../store/useSesionesStore';
import type { Rutina, Usuario } from '../types';
import { CreatePlanWizard } from '../components/userPlans/CreatePlanWizard';
import { ListPagination } from '../components/common/ListPagination';
import { useClientesSync } from '../hooks/useClientesSync';
import {
  mapClientLinksToUsuarios,
  planTreeToPlanUsuario,
  trainerKeys,
  useTrainerClientPlan,
  usuarioTienePlanDetallado,
} from '../lib/gateway/hooks';
import { clampFrecuencia } from '../utils/planScheduleUtils';
import { TRAINER_CLIENTS_PAGE_SIZE, type TrainerClientsPageResult } from '../lib/gateway/training.service';
import { usePlanMutations } from '../hooks/usePlanMutations';
import { useRutinaEnColaActivation } from '../hooks/useRutinaEnColaActivation';
import { UserProgressPanel } from '../components/users/UserProgressPanel';
import { UserDetailHeader } from '../components/users/UserDetailHeader';
import type { UserDetailTab } from '../components/users/UserDetailTabSwitcher';
import { UserCard } from '../components/users/UserCard';
import { UserMedidasPanel } from '../components/users/UserMedidasPanel';
import { UserEntrenamientosCreationPanel } from '../components/users/UserEntrenamientosCreationPanel';
import { UserRoutineHistoryPanel } from '../components/users/UserRoutineHistoryPanel';
import { recencyToneFromSesion } from '../utils/userSummary';
import { ROUTES } from '../routes/paths';
import { useToastHook } from '../components/common/Toast';
import { gatewayErrorMessage } from '../lib/gateway/errors';
import { isMockMode } from '../lib/mock-mode';
import { createPlan, type ClientLink } from '../lib/gateway/training.service';
import { planUsuarioToCreatePlanBody } from '../utils/planGatewayAdapter';

function parseDetailTab(raw: string | null): UserDetailTab {
  if (raw === 'entrenamientos') return 'entrenamientos';
  if (raw === 'medidas') return 'medidas';
  if (raw === 'historial') return 'historial';
  return 'progreso';
}

function parseSemana(raw: string | null, max: number): number {
  const n = raw ? Number(raw) : 1;
  if (Number.isNaN(n) || n < 1) return 1;
  return Math.min(max, Math.floor(n));
}

export function UsuariosPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToastHook();
  const { userId: userIdParam } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [listPage, setListPage] = useState(1);
  const { query: clientsQuery, isLoading: clientsLoading } = useClientesSync(
    listPage,
    TRAINER_CLIENTS_PAGE_SIZE,
  );
  const persistTimer = useRef<number | null>(null);
  const hydratedClientPlanKeyRef = useRef<string | null>(null);
  const { rutinas } = useDataStore();
  const usuarios = useUsuariosStore((s) => s.usuarios);
  const updateUsuario = useUsuariosStore((s) => s.updateUsuario);
  const addUsuario = useUsuariosStore((s) => s.addUsuario);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null);
  const [showWizard, setShowWizard] = useState(false);

  const detailTab = parseDetailTab(searchParams.get('tab'));

  const selectedUserLive = useMemo(
    () => (selectedUser ? usuarios.find((u) => u.id === selectedUser.id) ?? null : null),
    [usuarios, selectedUser],
  );

  const needsFullPlan =
    Boolean(selectedUserLive?.client_uuid)
    && !isMockMode()
    && selectedUserLive != null
    && !usuarioTienePlanDetallado(selectedUserLive);
  const clientPlanQuery = useTrainerClientPlan(selectedUserLive?.client_uuid, needsFullPlan);

  useEffect(() => {
    hydratedClientPlanKeyRef.current = null;
  }, [selectedUserLive?.id]);

  useEffect(() => {
    const tree = clientPlanQuery.data;
    const userId = selectedUserLive?.id;
    if (!tree || userId == null) return;

    const hydrationKey = `${userId}:${tree.id}:${clientPlanQuery.dataUpdatedAt}`;
    if (hydratedClientPlanKeyRef.current === hydrationKey) return;

    const user = useUsuariosStore.getState().usuarios.find((u) => u.id === userId);
    if (!user) return;
    if (usuarioTienePlanDetallado(user)) {
      hydratedClientPlanKeyRef.current = hydrationKey;
      return;
    }

    const plan = planTreeToPlanUsuario(userId, tree);
    hydratedClientPlanKeyRef.current = hydrationKey;
    updateUsuario(userId, (current) => ({
      ...current,
      plan,
      dias_entrenar: clampFrecuencia(plan.dias_entrenar_semana),
    }));
    setSelectedUser((current) =>
      current?.id === userId
        ? { ...current, plan, dias_entrenar: plan.dias_entrenar_semana }
        : current,
    );
  }, [
    clientPlanQuery.data,
    clientPlanQuery.dataUpdatedAt,
    selectedUserLive?.id,
    updateUsuario,
  ]);

  const maxSemanas = selectedUserLive?.plan.semanas ?? 1;
  const semana = parseSemana(searchParams.get('semana'), maxSemanas);
  const setDetailTab = useCallback(
    (tab: UserDetailTab) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (tab === 'progreso') next.delete('tab');
          else next.set('tab', tab);
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

  const handleSelectUser = (user: Usuario) => {
    setSelectedUser(user);
    navigate(ROUTES.usuario(user.id));
  };

  const rosterUsers = useMemo(() => {
    if (isMockMode()) return usuarios;
    const clients = clientsQuery.data?.clients;
    if (!clients) return [];
    return mapClientLinksToUsuarios(clients, usuarios);
  }, [clientsQuery.data?.clients, usuarios]);

  const filteredUsers = useMemo(() => {
    if (!searchTerm) return rosterUsers;
    const term = searchTerm.toLowerCase();
    return rosterUsers.filter(
      (u) =>
        u.nombre.toLowerCase().includes(term)
        || u.email.toLowerCase().includes(term)
        || u.objetivo.toLowerCase().includes(term)
        || u.plan.nombre.toLowerCase().includes(term),
    );
  }, [rosterUsers, searchTerm]);

  const pagination = clientsQuery.data?.pagination;
  const totalRecords = pagination?.total_records ?? rosterUsers.length;

  const frios = useMemo(
    () => usuarios.filter((u) => recencyToneFromSesion(getUltimaSesion(u.id)) === 'cold').length,
    [usuarios],
  );

  useEffect(() => () => {
    if (persistTimer.current != null) window.clearTimeout(persistTimer.current);
  }, []);

  const handleUpdateUser = useCallback(
    (updated: Usuario) => {
      updateUsuario(updated.id, () => updated);
      setSelectedUser(updated);
      if (!updated.client_uuid) return;
      if (persistTimer.current != null) window.clearTimeout(persistTimer.current);
      const clientId = updated.client_uuid;
      const plan = updated.plan;
      persistTimer.current = window.setTimeout(() => {
        if (isMockMode()) return;
        void createPlan(planUsuarioToCreatePlanBody(clientId, plan)).catch((err: unknown) => {
          toast.error(
            'No se guardó el plan',
            gatewayErrorMessage(err, 'Revisa que los ejercicios estén en el catálogo.'),
          );
        });
      }, 800);
    },
    [toast, updateUsuario],
  );

  const mutations = usePlanMutations(selectedUserLive, handleUpdateUser);
  useRutinaEnColaActivation(selectedUserLive, mutations);

  const rutinaCreadaProcesada = useRef<string | null>(null);
  const [pendingLibraryRutina, setPendingLibraryRutina] = useState<Rutina | null>(null);
  useEffect(() => {
    const rutinaCreadaRaw = searchParams.get('rutinaCreada');
    if (!rutinaCreadaRaw || !selectedUserLive) return;
    if (rutinaCreadaProcesada.current === rutinaCreadaRaw) return;
    rutinaCreadaProcesada.current = rutinaCreadaRaw;

    const rutinaId = Number(rutinaCreadaRaw);
    const rutina = rutinas.find((r) => r.id === rutinaId);
    if (rutina) {
      setPendingLibraryRutina(rutina);
    } else {
      toast.error('No se pudo asignar la rutina', 'Vuelve a intentarlo desde Entrenamientos.');
    }

    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete('rutinaCreada');
        next.delete('paraSesion');
        return next;
      },
      { replace: true },
    );
  }, [searchParams, selectedUserLive, rutinas, toast, setSearchParams]);

  const handleCreateUser = (newUser: Usuario) => {
    addUsuario(newUser);
    if (newUser.client_uuid) {
      const clientId = newUser.client_uuid;
      queryClient.setQueryData<TrainerClientsPageResult>(
        trainerKeys.clients(1, TRAINER_CLIENTS_PAGE_SIZE),
        (current) => {
          const row: ClientLink = {
            id: clientId,
            client_id: clientId,
            status: 'active',
            profile: {
              id: clientId,
              full_name: newUser.nombre,
              role: 'client',
            },
            plan: null,
          };
          const base = current ?? {
            clients: [],
            count: 0,
            pagination: {
              page: 1,
              size: TRAINER_CLIENTS_PAGE_SIZE,
              total_records: 0,
              total_pages: 1,
            },
          };
          if (base.clients.some((item) => item.client_id === clientId)) return base;
          const clients = [row, ...base.clients].slice(0, TRAINER_CLIENTS_PAGE_SIZE);
          const total = base.pagination.total_records + 1;
          return {
            clients,
            count: clients.length,
            pagination: {
              ...base.pagination,
              total_records: total,
              total_pages: Math.max(1, Math.ceil(total / TRAINER_CLIENTS_PAGE_SIZE)),
            },
          };
        },
      );
    }
    setShowWizard(false);
    setSelectedUser(newUser);
    navigate(ROUTES.usuarioEntrenamientos(newUser.id));
  };

  return (
    <AppShell width="wide">
      <div className="animate-slide-up min-w-0 my-3">
        {!selectedUser ? (
          <section style={{ paddingTop: 12, paddingBottom: 16 }}>
            <h1
              className="font-sora text-[22px] sm:text-2xl"
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
              {totalRecords} fichas
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
                  placeholder="Nombre cliente"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setListPage(1);
                  }}
                  aria-label="Buscar usuarios"
                />
              </div>
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

            {clientsLoading && !isMockMode() ? (
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>Cargando clientes…</p>
            ) : null}

            <div
              style={{
                display: 'grid',
                gap: 12,
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              }}
            >
              {filteredUsers.map((user) => (
                <UserCard key={user.client_uuid ?? user.id} user={user} onClick={() => handleSelectUser(user)} />
              ))}
              {filteredUsers.length === 0 && !clientsLoading ? (
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

            {pagination && !searchTerm ? (
              <ListPagination
                className="mt-5"
                page={pagination.page}
                totalPages={pagination.total_pages}
                totalRecords={pagination.total_records}
                pageSize={pagination.size}
                onPageChange={setListPage}
              />
            ) : null}
          </div>
        ) : selectedUserLive ? (
          <div>
            <UserDetailHeader
              user={selectedUserLive}
              tab={detailTab}
              onTabChange={setDetailTab}
            />

            {detailTab === 'progreso' ? (
              <UserProgressPanel usuarioId={selectedUserLive.id} />
            ) : detailTab === 'medidas' ? (
              <UserMedidasPanel user={selectedUserLive} />
            ) : detailTab === 'historial' ? (
              <UserRoutineHistoryPanel
                user={selectedUserLive}
                rutinas={rutinas}
                onGoToEntrenamientos={() => setDetailTab('entrenamientos')}
              />
            ) : (
              <UserEntrenamientosCreationPanel
                user={selectedUserLive}
                rutinas={rutinas}
                semana={semana}
                mutations={mutations}
                onGoToHistorial={() => setDetailTab('historial')}
                pendingLibraryRutina={pendingLibraryRutina}
                onPendingLibraryRutinaHandled={() => setPendingLibraryRutina(null)}
              />
            )}
          </div>
        ) : null}

        {showWizard ? (
          <CreatePlanWizard
            nextUserId={Math.max(0, ...usuarios.map((u) => u.id)) + 1}
            onClose={() => setShowWizard(false)}
            onCreate={handleCreateUser}
          />
        ) : null}
      </div>
    </AppShell>
  );
}
