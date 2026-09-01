export { getGatewayBaseUrl } from './config';
export { GatewayError } from './errors';
export { gatewayFetch, gatewayRequest, gatewayList, gatewayRequestVoid } from './httpClient';
export {
  login,
  signup,
  refresh,
  logout,
  getCurrentUser,
  extractSessionTokens,
} from './auth.service';
export { getAuthContext } from './context.service';
export {
  loadSession,
  saveSession,
  clearSession,
  isExpired,
  sessionFromTokens,
  type StoredSession,
} from './session';
export type { GatewayUser, TokenSession, SignupResponse, AuthContext } from './schemas/auth';
export { useAuthContext, useInvalidateAuthContext, useRefreshAuthContext } from './hooks/useAuthContext';
export {
  useExercises,
  useExercisesInfinite,
  useExerciseCatalog,
  useExerciseDetail,
  useGatewayBodyParts,
  useGatewayEquipments,
  useGatewayMuscles,
  useGatewayExerciseBrowse,
} from './hooks/useExercises';
export { useTemplates, useTemplate, useTemplateMutations } from './hooks/useTemplates';
export { useUnits } from './hooks/useUnits';
