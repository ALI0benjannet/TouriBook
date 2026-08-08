import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";

import { TextField } from "@/components/form/TextField";
import { useLoginForm } from "@/features/auth/hooks/useLoginForm";

export default function LoginPage() {
  const { t } = useTranslation();
  const { form, onSubmit } = useLoginForm();
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
        <header className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">{t("login.title")}</h1>
          <p className="text-sm text-slate-500">{t("login.subtitle")}</p>
        </header>

        {serverError && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
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
            label={t("login.email")}
            error={errors.email?.message && t(errors.email.message)}
          />

          <TextField
            {...register("password")}
            type="password"
            autoComplete="current-password"
            label={t("login.password")}
            error={errors.password?.message && t(errors.password.message)}
          />
        </fieldset>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 disabled:opacity-60"
        >
          {isSubmitting && <Loader2 aria-hidden className="size-4 animate-spin" />}
          {isSubmitting ? t("login.submitting") : t("login.submit")}
        </button>

        <p className="text-center text-sm text-slate-600">
          {t("login.no_account")} {" "}
          <Link
            to="/register"
            className="font-medium text-slate-950 underline underline-offset-4"
          >
            {t("login.register")}
          </Link>
        </p>
      </form>
    </main>
  );
}
