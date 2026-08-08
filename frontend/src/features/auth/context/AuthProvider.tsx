import { createContext, useCallback, useEffect, useMemo, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { authApi } from "@/features/auth/api/auth.api";
import type { LoginPayload } from "@/features/auth/types/auth.types";
import type { User } from "@/types/user";
import { setSessionExpiredHandler } from "@/lib/api/axios";
import { tokenStorage } from "@/lib/storage";
import { queryKeys } from "@/lib/api/query-keys";

type AuthContextValue = {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<User>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const hasToken = Boolean(tokenStorage.get());

  // Restauration de session au rechargement de la page
  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: queryKeys.auth.me,
    queryFn: async () => {
      const me = await authApi.me();
      return {
        id: me.id.toString(),
        email: me.email,
        nom: me.nom,
        prenom: me.prenom,
        full_name: `${me.prenom} ${me.nom}`,
        role: me.role,
        is_verified: me.is_active,
        preferred_language: undefined,
      };
    },
    enabled: hasToken,
    retry: false,
    staleTime: 5 * 60_000,
  });

  const clearSession = useCallback(() => {
    tokenStorage.clear();
    queryClient.setQueryData(queryKeys.auth.me, null);
    queryClient.removeQueries({ queryKey: queryKeys.auth.me });
  }, [queryClient]);

  // Le refresh a échoué → l'intercepteur nous prévient
  useEffect(() => {
    setSessionExpiredHandler(() => {
      clearSession();
      window.location.assign("/login?reason=session_expired");
    });
  }, [clearSession]);

  const login = useCallback(
    async (payload: LoginPayload) => {
      const { access_token } = await authApi.login(payload);
      tokenStorage.set(access_token);
      const me = await authApi.me();
      const userResult: User = {
        id: me.id.toString(),
        email: me.email,
        nom: me.nom,
        prenom: me.prenom,
        full_name: `${me.prenom} ${me.nom}`,
        role: me.role,
        is_verified: me.is_active,
        preferred_language: undefined,
      };
      queryClient.setQueryData(queryKeys.auth.me, userResult);
      return userResult;
    },
    [queryClient],
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      clearSession();
      queryClient.clear();
    }
  }, [clearSession, queryClient]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: user ?? null,
      isAuthenticated: Boolean(user),
      isAdmin: user?.role === "admin",
      isLoading: hasToken && isLoading,
      login,
      logout,
    }),
    [user, hasToken, isLoading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}