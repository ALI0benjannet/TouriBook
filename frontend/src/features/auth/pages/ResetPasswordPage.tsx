import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { TextField } from "@/components/form/TextField";
import { PasswordStrength } from "@/features/auth/components/PasswordStrength";
import { useResetPasswordForm } from "@/features/auth/hooks/useResetPasswordForm";

export default function ResetPasswordPage() {
  const { t } = useTranslation();
  const { form, onSubmit, tokenMissing, password } = useResetPasswordForm();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form;

  return (
    <main className="flex min-h-dvh items-center justify-center p-6 sm:p-8">
      <form
        noValidate
        onSubmit={handleSubmit(onSubmit)}
        aria-busy={isSubmitting}
        className="w-full max-w-md space-y-6 rounded-3xl border border-slate-200 bg-white/80 p-8 shadow-xl backdrop-blur"
      >
        <header className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">{t("auth.resetPassword.title")}</h1>
          <p className="text-sm text-slate-500">{t("auth.resetPassword.subtitle")}</p>
        </header>

        {tokenMissing && (
          <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {t("auth.errors.invalid_token")}
          </div>
        )}

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

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 disabled:opacity-60"
        >
          {isSubmitting && <Loader2 aria-hidden className="size-4 animate-spin" />}
          {isSubmitting ? t("auth.resetPassword.submitting") : t("auth.resetPassword.submit")}
        </button>
      </form>
    </main>
  );
}
