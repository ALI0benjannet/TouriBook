import { MailCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useResendCooldown } from "@/features/auth/hooks/useResendCooldown";
import { paths } from "@/routes/paths";

export default function CheckEmailPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { secondsLeft, canResend, start } = useResendCooldown();
  const email = (location.state as { email?: string } | null)?.email ?? "";

  const handleGoToVerify = () => {
    if (!email) return;
    navigate(`${paths.resetPassword}?email=${encodeURIComponent(email)}`);
  };

  return (
    <main className="flex min-h-dvh items-center justify-center p-6 sm:p-8">
      <section className="w-full max-w-md space-y-6 rounded-3xl border border-slate-200 bg-white/80 p-8 shadow-xl backdrop-blur">
        <header className="space-y-3">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-900">
            <MailCheck aria-hidden="true" className="size-5" />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">{t("auth.checkEmail.title")}</h1>
            <p className="text-sm text-slate-500">
              {t("auth.checkEmail.description", { email: email || t("auth.checkEmail.fallback_email") })}
            </p>
          </div>
        </header>

        <div className="space-y-3">
          {email ? (
            <button
              type="button"
              onClick={handleGoToVerify}
              className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
            >
              {t("auth.checkEmail.open_verification", "Saisir le code reçu")}
            </button>
          ) : null}

          <button
            type="button"
            onClick={start}
            disabled={!canResend}
            className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 disabled:opacity-60"
          >
            {canResend ? t("auth.checkEmail.resend") : t("auth.checkEmail.resend_wait", { seconds: secondsLeft })}
          </button>

          <p className="text-center text-sm text-slate-600">
            <Link to={paths.login} className="font-medium text-slate-950 underline underline-offset-4">
              {t("auth.checkEmail.back_to_login")}
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
