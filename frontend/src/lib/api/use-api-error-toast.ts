import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { toApiError } from "@/lib/api/errors";

export function useApiErrorToast() {
  const { t } = useTranslation();
  return useCallback(
    (error: unknown, fallbackKey = "errors.unknown") => {
      const apiError = toApiError(error);
      // Si le backend renvoie une phrase lisible, on l'affiche telle quelle
      const message = apiError.message.startsWith("errors.")
        ? t(apiError.message, { defaultValue: t(fallbackKey) })
        : apiError.message;
      toast.error(message);
      return apiError;
    },
    [t],
  );
}