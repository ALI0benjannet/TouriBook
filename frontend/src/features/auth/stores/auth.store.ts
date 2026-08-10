import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Role = "tourist" | "admin";
export type User = {
  id: string;
  email: string;
  full_name: string;
  nom: string;
  prenom: string;
  role: Role;
  is_verified: boolean;
  preferred_language?: string;
  avatar_url?: string | null;
};

type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  hydrated: boolean;
  setTokens: (access: string, refresh?: string) => void;
  setUser: (user: User | null) => void;
  logout: () => void;
};

export const authStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      hydrated: false,
      setTokens: (accessToken: string, refreshToken?: string) =>
        set((state) => ({ accessToken, refreshToken: refreshToken ?? state.refreshToken })),
      setUser: (user: User | null) => set({ user }),
      logout: () => set({ accessToken: null, refreshToken: null, user: null }),
    }),
    {
      name: "touribook-auth",
      partialize: (s: AuthState) => ({ accessToken: s.accessToken, refreshToken: s.refreshToken }),
      onRehydrateStorage: () => (state: AuthState | undefined) => { state && (state.hydrated = true); },
    },
  ),
);