export { getGatewayBaseUrl } from './config';
export { GatewayError } from './errors';
export {
  login,
  signup,
  refresh,
  logout,
  getCurrentUser,
  extractSessionTokens,
} from './auth.service';
export {
  loadSession,
  saveSession,
  clearSession,
  isExpired,
  sessionFromTokens,
  type StoredSession,
} from './session';
export type { GatewayUser, TokenSession, SignupResponse } from './schemas/auth';
