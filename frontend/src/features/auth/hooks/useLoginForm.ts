import { useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { authApi } from "@/features/auth/api/auth.api";
import { getAuthErrorCode } from "@/lib/api-error";
import { loginSchema, type LoginInput } from "@/features/auth/schemas/authSchemas";

const DEFAULT_REDIRECT = "/";

export function useLoginForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    mode: "onTouched",
    defaultValues: { email: "", password: "" },
  });

  const { setError } = form;

  const onSubmit = useCallback(
    async (data: LoginInput) => {
      try {
        await authApi.login(data);

        const from = (location.state as { from?: string } | null)?.from;
        navigate(from ?? DEFAULT_REDIRECT, { replace: true });
      } catch (error: unknown) {
        const code = getAuthErrorCode(error);
        const message = t(`auth.errors.${code}`, {
          defaultValue: t("errors.unknown"),
        });

        if (code === "invalid_credentials") {
          setError("root.serverError", { type: code, message });
          return;
        }

        toast.error(message);
      }
    },
    [location.state, navigate, setError, t],
  );

  return { form, onSubmit };
}
