import { QueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { toApiError } from "@/lib/api-error";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        const status = (error as AxiosError).response?.status ?? 0;
        if (status >= 400 && status < 500) return false; // pas de retry sur 4xx
        return failureCount < 2;
      },
    },
    mutations: {
      onError: (error) => toast.error(toApiError(error).message),
    },
  },
});