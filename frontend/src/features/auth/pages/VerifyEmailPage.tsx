import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2, MailCheck, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { authApi } from "@/features/auth/api/auth.api";
import { useResendCooldown } from "@/features/auth/hooks/useResendCooldown";
import { paths } from "@/routes/paths";

export default function VerifyEmailPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const token = searchParams.get("token") ?? "";
  const [status, setStatus] = useState<"loading" | "success" | "invalid_token" | "missing_params">("loading");
  const hasTriggered = useRef(false);
  const { secondsLeft, canResend, start } = useResendCooldown();

  useEffect(() => {
    if (hasTriggered.current) {
      return;
    }

    hasTriggered.current = true;

    if (!email || !token) {
      setStatus("missing_params");
      return;
    }

    void (async () => {
      try {
        await authApi.verifyEmail({ email, token });
        setStatus("success");
        toast.success(t("auth.verifyEmail.success"));
      } catch {
        setStatus("invalid_token");
      }
    })();
  }, [email, t, token]);

  const handleResend = () => {
    start();
    navigate(`${paths.verifyEmail}?email=${encodeURIComponent(email)}`);
  };

  return (
    <main className="flex min-h-dvh items-center justify-center p-6 sm:p-8">
      <section className="w-full max-w-md space-y-6 rounded-3xl border border-slate-200 bg-white/80 p-8 shadow-xl backdrop-blur">
        <header className="space-y-3">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-900">
            {status === "success" ? (
              <MailCheck aria-hidden="true" className="size-5" />
            ) : (
              <ShieldAlert aria-hidden="true" className="size-5" />
            )}
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">{t("auth.verifyEmail.title")}</h1>
            <p className="text-sm text-slate-500">
              {status === "loading" && t("auth.verifyEmail.loading")}
              {status === "success" && t("auth.verifyEmail.success")}
              {status === "invalid_token" && t("auth.verifyEmail.invalid")}
              {status === "missing_params" && t("auth.verifyEmail.missing")}
            </p>
          </div>
        </header>

        {status === "loading" && (
          <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 px-4 py-6">
            <Loader2 aria-hidden="true" className="size-5 animate-spin text-slate-600" />
          </div>
        )}

        {(status === "invalid_token" || status === "missing_params") && (
          <button
            type="button"
            onClick={handleResend}
            disabled={!canResend}
            className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 disabled:opacity-60"
          >
            {canResend ? t("auth.verifyEmail.resend") : t("auth.verifyEmail.resend_wait", { seconds: secondsLeft })}
          </button>
        )}
      </section>
    </main>
  );
}
