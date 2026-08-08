import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { authApi } from "@/features/auth/api/auth.api";
import { verifyCodeSchema, type VerifyCodeInput } from "@/features/auth/schemas/authSchemas";
import { paths } from "@/routes/paths";

function useQueryParams() {
  return new URLSearchParams(useLocation().search);
}

export default function VerifyEmailPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const query = useQueryParams();
  const email = query.get("email") ?? "";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<VerifyCodeInput>({
    resolver: zodResolver(verifyCodeSchema),
    defaultValues: { code: "" },
  });

  useEffect(() => {
    if (!email) {
      toast.error(t("auth.errors.invalid_token", { defaultValue: "E-mail invalide." }));
      navigate(paths.login);
    }
  }, [email, navigate, t]);

  const onSubmit = async (data: VerifyCodeInput) => {
    try {
      await authApi.verifyEmail({ email, token: data.code });
      toast.success(t("auth.verifyEmail.success", { defaultValue: "Vérification réussie !" }));
      navigate(paths.home);
    } catch (error: unknown) {
      toast.error(t("auth.verifyEmail.error", { defaultValue: "Code invalide ou expiré." }));
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
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Vérification de l’e-mail</h1>
            <p className="text-sm text-slate-500">
              Entrez le code à 4 chiffres reçu sur {email}.
            </p>
          </div>
        </header>

        <div className="space-y-2">
          <label htmlFor="code" className="block text-sm font-medium text-slate-700">
            Code de vérification
          </label>
          <input
            id="code"
            type="text"
            inputMode="numeric"
            maxLength={4}
            {...register("code")}
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-lg outline-none transition focus:border-slate-900"
          />
          {errors.code?.message && (
            <p className="text-sm text-red-600">{t(errors.code.message)}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-60"
        >
          {isSubmitting ? "Vérification…" : "Confirmer le code"}
        </button>
      </form>
    </main>
  );
}
