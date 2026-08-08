import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";
import { authStore } from "@/features/auth/stores/auth.store";
import { useMe } from "@/features/auth/api/use-me";

export function useAuth() {
  const { accessToken, user, setUser, logout } = authStore(
    useShallow((state) => ({
      accessToken: state.accessToken,
      user: state.user,
      setUser: state.setUser,
      logout: state.logout,
    })),
  );

  const { data, isLoading, isError } = useMe(Boolean(accessToken) && !user);

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
  };
}