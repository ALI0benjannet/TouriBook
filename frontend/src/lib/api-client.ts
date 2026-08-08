import axios, { AxiosError, type AxiosRequestHeaders, type InternalAxiosRequestConfig } from "axios";
import { env } from "@/lib/env";
import { authStore } from "@/features/auth/stores/auth.store";

export const api = axios.create({
  baseURL: env.VITE_API_URL,
  withCredentials: true, // si le refresh token est en cookie httpOnly
  headers: { "Content-Type": "application/json" },
  timeout: 20_000,
});

/* ---------- Requête : injection du JWT + langue ---------- */
api.interceptors.request.use((config) => {
  const token = authStore.getState().accessToken;
  if (!config.headers) {
    config.headers = new axios.AxiosHeaders();
  }

  const headers = config.headers as AxiosRequestHeaders;
  headers["Accept-Language"] = localStorage.getItem("i18nextLng") ?? "fr";
  if (token) headers.Authorization = `Bearer ${token}`;
  return config;
});

/* ---------- Réponse : refresh automatique sur 401 ---------- */
type Retriable = InternalAxiosRequestConfig & { _retry?: boolean };

let isRefreshing = false;
let queue: Array<(token: string | null) => void> = [];

const flushQueue = (token: string | null) => {
  queue.forEach((cb) => cb(token));
  queue = [];
};

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as Retriable | undefined;

    const isAuthRoute = original?.url?.includes("/api/v1/auth/login")
      || original?.url?.includes("/api/v1/auth/refresh");

    if (error.response?.status !== 401 || !original || original._retry || isAuthRoute) {
      return Promise.reject(error);
    }

    original._retry = true;

    // Un refresh est déjà en cours → on met la requête en file d'attente
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        queue.push((token) => {
          if (!token) return reject(error);
          const originalHeaders = original.headers ?? {};
          original.headers = {
            ...originalHeaders,
            Authorization: `Bearer ${token}`,
          } as typeof original.headers;
          resolve(api(original));
        });
      });
    }

    isRefreshing = true;
    try {
      const { data } = await axios.post(
        `${env.VITE_API_URL}/auth/refresh`,
        { refresh_token: authStore.getState().refreshToken },
        { withCredentials: true },
      );

      authStore.getState().setTokens(data.access_token, data.refresh_token);
      flushQueue(data.access_token);

      original.headers.Authorization = `Bearer ${data.access_token}`;
      return api(original);
    } catch (refreshError) {
      flushQueue(null);
      authStore.getState().logout();
      window.location.href = `/login?reason=session_expired`;
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);