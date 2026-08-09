import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

import { TextField } from "@/components/form/TextField";
import { authApi } from "@/features/auth/api/auth.api";
import { verifyEmailSchema, type VerifyEmailInput } from "@/features/auth/schemas/authSchemas";
import { getAuthErrorCode } from "@/lib/api-error";
import { toApiError } from "@/lib/api/errors";
import { paths } from "@/routes/paths";

export default function VerifyEmailPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const emailParam = searchParams.get("email") ?? "";

  const [isResending, setIsResending] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<VerifyEmailInput>({
    resolver: zodResolver(verifyEmailSchema),
    mode: "onTouched",
    defaultValues: { email: emailParam, token: "" },
  });

  const onResend = useCallback(async () => {
    const email = new URLSearchParams(window.location.search).get("email") ?? emailParam;
    if (!email) {
      toast.error(t("auth.verifyEmail.no_email", "Impossible de renvoyer le code sans e-mail."));
      return;
    }

    setIsResending(true);
    try {
      await authApi.resendVerification({ email });
      toast.success(t("auth.verifyEmail.resend_success", "Un nouveau code a été envoyé à votre adresse e-mail."));
    } catch {
      toast.error(t("auth.verifyEmail.resend_error", "Impossible de renvoyer le code pour le moment. Réessayez plus tard."));
    } finally {
      setIsResending(false);
    }
  }, [emailParam, t]);

  const onSubmit = async (data: VerifyEmailInput) => {
    try {
      await authApi.verifyEmail({ email: data.email, token: data.token });
      toast.success(t("auth.verifyEmail.success", { defaultValue: "Vérification réussie !" }));
      navigate(paths.login);
    } catch (error: unknown) {
      const apiError = toApiError(error);
      const code = getAuthErrorCode(error);

      if (apiError.status === 404) {
        setError("email", {
          type: "server",
          message: "auth.errors.email_not_found",
        });
        return;
      }

      if (code === "invalid_token") {
        setError("token", {
          type: "server",
          message: "auth.verifyEmail.invalid",
        });
        return;
      }

      if (apiError.fieldErrors) {
        for (const [field, message] of Object.entries(apiError.fieldErrors)) {
          setError(field as keyof VerifyEmailInput, {
            type: "server",
            message,
          });
        }
        return;
      }

      toast.error(
        t(apiError.message, { defaultValue: t("errors.unexpected") }),
      );
    }
  };

  return (
    <main className="flex min-h-dvh items-center justify-center p-6 sm:p-8">
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="w-full max-w-md space-y-6 rounded-3xl border border-slate-200 bg-white/80 p-8 shadow-xl backdrop-blur"
      >
        <header className="space-y-3">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-900">
            <ShieldAlert aria-hidden="true" className="size-5" />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              {t("auth.verifyEmail.title", "Vérification de l’e-mail")}
            </h1>
            <p className="text-sm text-slate-500">
              {t(
                "auth.verifyEmail.subtitle",
                "Saisissez votre e-mail et le code à 4 chiffres reçu par e-mail.",
              )}
            </p>
          </div>
        </header>

        <fieldset disabled={isSubmitting} className="space-y-5 border-0 p-0">
          <TextField
            {...register("email")}
            type="email"
            inputMode="email"
            autoComplete="email"
            label={t("auth.verifyEmail.email", "Adresse e-mail")}
            error={errors.email?.message ? t(errors.email.message, { defaultValue: errors.email.message as string }) : undefined}
          />

          <TextField
            {...register("token")}
            type="text"
            inputMode="numeric"
            maxLength={4}
            label={t("auth.verifyEmail.code", "Code de vérification")}
            hint={t("auth.verifyEmail.code_hint", "4 chiffres reçus par e-mail")}
            error={errors.token?.message ? t(errors.token.message, { defaultValue: errors.token.message as string }) : undefined}
          />
        </fieldset>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 disabled:opacity-60"
        >
          {isSubmitting ? (
            <>
              <Loader2 aria-hidden="true" className="size-4 animate-spin" />
              {t("auth.verifyEmail.submitting", "Vérification…")}
            </>
          ) : (
            t("auth.verifyEmail.confirm", "Confirmer")
          )}
        </button>

        <button
          type="button"
          onClick={onResend}
          disabled={isResending}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-900 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 disabled:opacity-60"
        >
          {isResending ? t("auth.verifyEmail.resending", "Envoi en cours…") : t("auth.verifyEmail.resend", "Renvoyer le code")}
        </button>
      </form>
    </main>
  );
}
