import { MailCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthCard } from "@/components/auth/AuthCards";
import { Button } from "@/components/ui/button";
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
    <AuthCard
      icon={<MailCheck aria-hidden className="size-5" />}
      title={t("auth.checkEmail.title")}
      subtitle={t("auth.checkEmail.description", {
        email: email || t("auth.checkEmail.fallback_email"),
      })}
      footer={
        <Link
          to={paths.login}
          className="font-medium text-slate-900 underline decoration-slate-300 underline-offset-4 transition hover:decoration-slate-900"
        >
          {t("auth.checkEmail.back_to_login")}
        </Link>
      }
    >
      <div className="space-y-3">
        {email && (
          <Button fullWidth size="lg" onClick={handleGoToVerify}>
            {t("auth.checkEmail.open_verification", "Saisir le code reçu")}
          </Button>
        )}

        <Button fullWidth size="lg" variant="outline" disabled={!canResend} onClick={start}>
          {canResend
            ? t("auth.checkEmail.resend")
            : t("auth.checkEmail.resend_wait", { seconds: secondsLeft })}
        </Button>
      </div>
    </AuthCard>
  );
}