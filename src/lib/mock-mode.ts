/** Clave localStorage: valor `"1"` = demo sin login ni gateway. Ver `/mockdata`. */
export const MOCK_MODE_STORAGE_KEY = 'fitpro-mock-mode';

export function isMockMode(): boolean {
  if (typeof localStorage === 'undefined') return false;
  return localStorage.getItem(MOCK_MODE_STORAGE_KEY) === '1';
}

export function setMockMode(enabled: boolean): void {
  if (typeof localStorage === 'undefined') return;
  if (enabled) {
    localStorage.setItem(MOCK_MODE_STORAGE_KEY, '1');
  } else {
    localStorage.removeItem(MOCK_MODE_STORAGE_KEY);
  }
}

export const DEMO_TRAINER_USER = {
  id: 'demo-trainer-laura',
  email: 'laura.mendez@demo.gymapp',
  role: 'trainer',
} as const;
