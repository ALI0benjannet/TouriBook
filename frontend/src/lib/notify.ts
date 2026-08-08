import { toast } from "sonner";
import i18n from "@/lib/i18n";
import { toApiError } from "@/lib/api-error";

export const notify = {
  success: (key: string) => toast.success(i18n.t(key, { defaultValue: key })),
  error: (err: unknown) => {
    const { message } = toApiError(err);
    toast.error(i18n.t(message, { defaultValue: message }));
  },
  info: (key: string) => toast(i18n.t(key, { defaultValue: key })),
};
