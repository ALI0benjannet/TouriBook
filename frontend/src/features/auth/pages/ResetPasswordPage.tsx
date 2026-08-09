import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { TextField } from "@/components/form/TextField";
import { PasswordStrength } from "@/features/auth/components/PasswordStrength";
import { useResetPasswordForm } from "@/features/auth/hooks/useResetPasswordForm";
import { verifyCodeSchema, type VerifyCodeInput } from "@/features/auth/schemas/authSchemas";
import { authApi } from "@/features/auth/api/auth.api";
import { paths } from "@/routes/paths";

export default function ResetPasswordPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const email = searchParams.get("email") ?? "";
  const [isResending, setIsResending] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null);
  const [isTokenChecking, setIsTokenChecking] = useState(false);
  const [tokenValidationError, setTokenValidationError] = useState<string | null>(null);

  const { form, onSubmit, password } = useResetPasswordForm();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form;

  const codeForm = useForm<VerifyCodeInput>({
    resolver: zodResolver(verifyCodeSchema),
    mode: "onTouched",
    defaultValues: { code: "" },
  });

  const {
    register: registerCode,
    handleSubmit: handleSubmitCode,
    formState: { errors: codeErrors, isSubmitting: isCodeSubmitting },
  } = codeForm;

  const onSubmitCode = useCallback(
    (data: VerifyCodeInput) => {
      const searchParams = new URLSearchParams();
      searchParams.set("token", data.code);
      if (email) searchParams.set("email", email);
      navigate({ pathname: paths.resetPassword, search: searchParams.toString() });
    },
    [navigate, email],
  );

  useEffect(() => {
    if (!token) {
      setIsTokenValid(false);
      setTokenValidationError(null);
      return;
    }

    setIsTokenChecking(true);
    setTokenValidationError(null);

    authApi
      .validateResetToken(token)
      .then(() => {
        setIsTokenValid(true);
      })
      .catch(() => {
        setIsTokenValid(false);
        setTokenValidationError(t("auth.resetPassword.invalid_token", "Code invalide ou expiré."));
      })
      .finally(() => {
        setIsTokenChecking(false);
      });
  }, [token, t]);

  const onResend = useCallback(async () => {
    if (!email) {
      toast.error("Impossible de renvoyer le code sans adresse e-mail.");
      return;
    }

    setIsResending(true);
    try {
      await authApi.forgotPassword({ email });
      toast.success("Un nouveau code a été envoyé à votre adresse e-mail.");
    } catch {
      toast.error("Impossible de renvoyer le code pour le moment. Réessayez plus tard.");
    } finally {
      setIsResending(false);
    }
  }, [email]);

  return (
    <main className="flex min-h-dvh items-center justify-center p-6 sm:p-8">
      <div className="w-full max-w-md space-y-6 rounded-3xl border border-slate-200 bg-white/80 p-8 shadow-xl backdrop-blur">
        <header className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">{t("auth.resetPassword.title")}</h1>
          <p className="text-sm text-slate-500">{t("auth.resetPassword.subtitle")}</p>
        </header>

        {(!token || isTokenValid === false) ? (
          <form
            noValidate
            onSubmit={handleSubmitCode(onSubmitCode)}
            aria-busy={isCodeSubmitting || isTokenChecking}
            className="space-y-6"
          >
            <div className="space-y-3">
              <h2 className="text-lg font-semibold">{t("auth.resetPassword.code_step", "Entrer le code de réinitialisation")}</h2>
              <fieldset disabled={isCodeSubmitting} className="space-y-5 border-0 p-0">
                <TextField
                  {...registerCode("code")}
                  type="text"
                  inputMode="numeric"
                  maxLength={4}
                  label={t("auth.resetPassword.code_label", "Code de réinitialisation")}
                  error={codeErrors.code?.message ? t(codeErrors.code.message) : undefined}
                />
              </fieldset>
            </div>

            <button
              type="submit"
              disabled={isCodeSubmitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 disabled:opacity-60"
            >
              {isCodeSubmitting ? "Vérification…" : t("auth.resetPassword.verify_code", "Valider le code")}
            </button>

            <button
              type="button"
              onClick={onResend}
              disabled={isResending || !email}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-900 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 disabled:opacity-60"
            >
              {isResending ? "Envoi en cours…" : t("auth.resetPassword.resend_code", "Renvoyer le code par e-mail")}
            </button>

            {tokenValidationError && (
              <p className="text-sm text-red-600">{tokenValidationError}</p>
            )}
          </form>
        ) : isTokenChecking ? (
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center text-slate-600">
            {t("auth.resetPassword.validating", "Vérification du code…")}
          </div>
        ) : (
          <form
            noValidate
            onSubmit={handleSubmit(onSubmit)}
            aria-busy={isSubmitting}
            className="space-y-6"
          >
            {errors.root?.serverError?.message && (
              <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {t(errors.root.serverError.message)}
              </div>
            )}

            <div className="space-y-3">
              <h2 className="text-lg font-semibold">{t("auth.resetPassword.new_password_step", "Créer un nouveau mot de passe")}</h2>
              <fieldset disabled={isSubmitting} className="space-y-5 border-0 p-0">
                <TextField
                  {...register("new_password")}
                  type="password"
                  autoComplete="new-password"
                  label={t("auth.resetPassword.new_password")}
                  error={errors.new_password?.message ? t(errors.new_password.message) : undefined}
                />
                <PasswordStrength password={password} />
                <TextField
                  {...register("confirm_password")}
                  type="password"
                  autoComplete="new-password"
                  label={t("auth.resetPassword.confirm_password")}
                  error={errors.confirm_password?.message ? t(errors.confirm_password.message) : undefined}
                />
              </fieldset>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 disabled:opacity-60"
            >
              {isSubmitting ? t("auth.resetPassword.submitting") : t("auth.resetPassword.submit")}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
