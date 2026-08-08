import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { env } from "@/lib/env";
import { tokenStorage } from "@/lib/storage";

export const api = axios.create({
  baseURL: env.VITE_API_URL,
  timeout: 20_000,
  withCredentials: true, // indispensable pour le cookie refresh httpOnly
  headers: { "Content-Type": "application/json" },
});

/* ---------- Requête : injection du JWT + langue ---------- */
api.interceptors.request.use((config) => {
  const token = tokenStorage.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  config.headers["Accept-Language"] = localStorage.getItem("i18nextLng") ?? "fr";
  return config;
});

/* ---------- Réponse : refresh automatique sur 401 ---------- */
type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

let isRefreshing = false;
let waiters: Array<(token: string | null) => void> = [];

const notifyWaiters = (token: string | null) => {
  waiters.forEach((resolve) => resolve(token));
  waiters = [];
};

/** Callback branché par le AuthProvider pour déconnecter proprement. */
let onSessionExpired: () => void = () => {};
export const setSessionExpiredHandler = (fn: () => void) => {
  onSessionExpired = fn;
};

const NO_REFRESH_PATHS = ["/api/v1/auth/login", "/api/v1/auth/refresh", "/api/v1/auth/register"];

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetriableConfig | undefined;
    const status = error.response?.status;

    const shouldRefresh =
      status === 401 &&
      original &&
      !original._retry &&
      !NO_REFRESH_PATHS.some((p) => original.url?.includes(p));

    if (!shouldRefresh) return Promise.reject(error);

    original._retry = true;

    // Un refresh est déjà en cours → on attend son résultat
    if (isRefreshing) {
      const token = await new Promise<string | null>((r) => waiters.push(r));
      if (!token) return Promise.reject(error);
      original.headers.Authorization = `Bearer ${token}`;
      return api(original);
    }

    isRefreshing = true;
    try {
      // Instance nue : évite une boucle infinie d'intercepteurs
      const { data } = await axios.post(
        `${env.VITE_API_URL}/api/v1/auth/refresh`,
        {},
        { withCredentials: true },
      );
      const newToken: string = data.access_token;
      tokenStorage.set(newToken);
      notifyWaiters(newToken);
      original.headers.Authorization = `Bearer ${newToken}`;
      return api(original);
    } catch (refreshError) {
      notifyWaiters(null);
      tokenStorage.clear();
      onSessionExpired();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);