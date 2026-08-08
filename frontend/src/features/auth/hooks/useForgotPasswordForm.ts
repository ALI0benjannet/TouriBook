import { useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { authApi } from "@/features/auth/api/auth.api";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/features/auth/schemas/authSchemas";
import { paths } from "@/routes/paths";
import { getAuthErrorCode } from "@/lib/api-error";
import { toApiError } from "@/lib/api/errors";

export function useForgotPasswordForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onTouched",
    defaultValues: { email: "" },
  });

  const { setError } = form;

  const onSubmit = useCallback(
    async (data: ForgotPasswordInput) => {
      try {
        await authApi.forgotPassword({ email: data.email });
        navigate(paths.checkEmail, { state: { email: data.email }, replace: true });
      } catch (error: unknown) {
        const apiError = toApiError(error);
        const code = getAuthErrorCode(error);
        const message = apiError.message ?? t(`auth.errors.${code}`, { defaultValue: t("errors.unknown") });

        setError("root.serverError", { type: code, message });
        toast.error(message);
      }
    },
    [navigate, setError, t],
  );

  return {
    form,
    onSubmit,
    emailFromState: (location.state as { email?: string } | null)?.email ?? "",
  };
}
