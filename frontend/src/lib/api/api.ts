import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: false,
});

export const tokenStore = {
  get access() { return localStorage.getItem("access_token"); },
  get refresh() { return localStorage.getItem("refresh_token"); },
  set(access: string, refresh?: string) {
    localStorage.setItem("access_token", access);
    if (refresh) localStorage.setItem("refresh_token", refresh);
  },
  clear() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  },
};

api.interceptors.request.use((config) => {
  const t = tokenStore.access;
  if (t) config.headers.Authorization = `Bearer ${t}`;
  return config;
});

let refreshing: Promise<string> | null = null;

api.interceptors.response.use(
  (r) => r,
  async (error) => {
    const original = error.config;
    const isAuthRoute = original?.url?.includes("/api/v1/auth/login") || original?.url?.includes("/api/v1/auth/refresh");
    if (error.response?.status === 401 && !original._retry && !isAuthRoute && tokenStore.refresh) {
      original._retry = true;
      refreshing ??= api
        .post("/api/v1/auth/refresh", { refresh_token: tokenStore.refresh })
        .then((res) => {
          tokenStore.set(res.data.access_token, res.data.refresh_token);
          return res.data.access_token as string;
        })
        .finally(() => { refreshing = null; });
      try {
        const newToken = await refreshing;
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch {
        tokenStore.clear();
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);