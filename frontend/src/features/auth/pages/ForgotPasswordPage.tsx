import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Loader2, Mail } from "lucide-react";
import { TextField } from "@/components/form/TextField";
import { useForgotPasswordForm } from "@/features/auth/hooks/useForgotPasswordForm";
import { paths } from "@/routes/paths";

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const { form, onSubmit } = useForgotPasswordForm();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form;

  const serverError = errors.root?.serverError?.message;

  return (
    <main className="flex min-h-dvh items-center justify-center p-6 sm:p-8">
      <form
        noValidate
        onSubmit={handleSubmit(onSubmit)}
        aria-busy={isSubmitting}
        className="w-full max-w-md space-y-6 rounded-3xl border border-slate-200 bg-white/80 p-8 shadow-xl backdrop-blur"
      >
        <header className="space-y-3">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-900">
            <Mail aria-hidden="true" className="size-5" />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">{t("auth.forgotPassword.title")}</h1>
            <p className="text-sm text-slate-500">{t("auth.forgotPassword.subtitle")}</p>
          </div>
        </header>

        {serverError && (
          <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {serverError}
          </div>
        )}

        <fieldset disabled={isSubmitting} className="space-y-5 border-0 p-0">
          <TextField
            {...register("email")}
            type="email"
            inputMode="email"
            autoComplete="email"
            autoFocus
            label={t("auth.forgotPassword.email")}
            error={errors.email?.message ? t(errors.email.message) : undefined}
          />
        </fieldset>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 disabled:opacity-60"
        >
          {isSubmitting && <Loader2 aria-hidden className="size-4 animate-spin" />}
          {isSubmitting ? t("auth.forgotPassword.submitting") : t("auth.forgotPassword.submit")}
        </button>

        <p className="text-center text-sm text-slate-600">
          <Link to={paths.login} className="font-medium text-slate-950 underline underline-offset-4">
            {t("auth.forgotPassword.back_to_login")}
          </Link>
        </p>
      </form>
    </main>
  );
}
