import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { RolDashboard } from '../types/adminDashboard';

interface RoleOverrideStore {
  /** `null` = usar el rol real que devuelve el gateway. */
  rolOverride: RolDashboard | null;
  setRolOverride: (rol: RolDashboard | null) => void;
}

/**
 * Override local del rol de plataforma, editable desde `/perfil`.
 * Es una herramienta de pruebas: solo cambia lo que renderiza el frontend,
 * nunca los permisos reales (el RBAC vive server-side en `gym-gateway`).
 */
export const useRoleOverrideStore = create<RoleOverrideStore>()(
  persist(
    (set) => ({
      rolOverride: null,
      setRolOverride: (rol) => set({ rolOverride: rol }),
    }),
    { name: 'fitpro-role-override' },
  ),
);

export const clearRoleOverride = (): void => {
  useRoleOverrideStore.getState().setRolOverride(null);
};
