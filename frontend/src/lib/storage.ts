// src/lib/storage.ts
// ⚠️ Façade de compatibilité uniquement.
// La source de vérité des tokens est authStore (Zustand + persist).
// Ce fichier ne stocke rien lui-même : il délègue tout.
// À SUPPRIMER une fois que plus aucun fichier n'importe "@/lib/storage".

import { authStore } from "@/features/auth/stores/auth.store";

export const tokenStorage = {
  /** Jeton d'accès courant (ou null). */
  get: (): string | null => authStore.getState().accessToken,
  getAccessToken: (): string | null => authStore.getState().accessToken,
  getRefreshToken: (): string | null => authStore.getState().refreshToken,

  /** Enregistre le jeton d'accès (et optionnellement le refresh). */
  set: (accessToken: string, refreshToken?: string | null): void =>
    authStore.getState().setTokens(accessToken, refreshToken),
  setTokens: (accessToken: string, refreshToken?: string | null): void =>
    authStore.getState().setTokens(accessToken, refreshToken),

  /** Efface la session. */
  clear: (): void => authStore.getState().logout(),
  clearTokens: (): void => authStore.getState().logout(),

  has: (): boolean => Boolean(authStore.getState().accessToken),
};

export default tokenStorage;