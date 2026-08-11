import { useEffect } from "react";
import { authStore } from "@/features/auth/stores/auth.store";
import { useMe } from "@/features/auth/api/use-me";

export function useAuth() {
  const accessToken = authStore((state) => state.accessToken);
  const user = authStore((state) => state.user);
  const setUser = authStore((state) => state.setUser);
  const logout = authStore((state) => state.logout);

  const { data, isLoading, isError, refetch } = useMe(Boolean(accessToken) && !user);

  useEffect(() => {
    if (data && !user) {
      setUser(data);
    }
  }, [data, setUser, user]);

  return {
    user: user ?? data ?? null,
    isAuthenticated: Boolean(accessToken) && !isError,
    isAdmin: (user ?? data)?.role === "admin",
    isLoading: Boolean(accessToken) && !user && isLoading,
    logout,
    refreshUser: refetch,
  };
}