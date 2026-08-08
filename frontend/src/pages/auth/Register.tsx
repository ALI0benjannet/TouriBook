import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { authApi } from "@/features/auth/api/auth.api";
import { getAuthErrorCode } from "@/lib/api-error";
import { toApiError } from "@/lib/api/errors";
import { paths } from "@/routes/paths";
import { registerSchema, type RegisterInput } from "@/features/auth/schemas/authSchemas";

export default function Register() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data: RegisterInput) => {
    try {
      await authApi.register({
        nom: data.nom,
        prenom: data.prenom,
        email: data.email,
        password: data.password,
      });
      nav(`${paths.verifyEmail}?email=${encodeURIComponent(data.email)}`);
    } catch (error: unknown) {
      const apiError = toApiError(error);

      if (apiError.fieldErrors) {
        for (const [field, message] of Object.entries(apiError.fieldErrors)) {
          setError(field as keyof RegisterInput, {
            type: "server",
            message: t(message, { defaultValue: message }),
          });
        }
        return;
      }

      const code = getAuthErrorCode(error);
      toast.error(t(`auth.errors.${code}`, { defaultValue: t("errors.unexpected") }));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-md mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Créer un compte</h1>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <input {...register("prenom")} placeholder="Prénom" aria-label="Prénom" className="w-full border rounded p-2" />
          <p role="alert" className="text-red-600 text-sm">{errors.prenom?.message}</p>
        </div>
        <div>
          <input {...register("nom")} placeholder="Nom" aria-label="Nom" className="w-full border rounded p-2" />
          <p role="alert" className="text-red-600 text-sm">{errors.nom?.message}</p>
        </div>
      </div>
      <input {...register("email")} placeholder="E-mail" aria-label="E-mail" className="w-full border rounded p-2" />
      <p role="alert" className="text-red-600 text-sm">{errors.email?.message}</p>
      <input type="password" {...register("password")} placeholder="Mot de passe" aria-label="Mot de passe" className="w-full border rounded p-2" />
      <p role="alert" className="text-red-600 text-sm">{errors.password?.message}</p>
      <input type="password" {...register("confirm")} placeholder="Confirmer" aria-label="Confirmer" className="w-full border rounded p-2" />
      <p role="alert" className="text-red-600 text-sm">{errors.confirm?.message}</p>
      <button disabled={isSubmitting} className="w-full bg-blue-600 text-white rounded p-2">
        {isSubmitting ? "Envoi…" : "S'inscrire"}
      </button>
      <Link to={paths.login} className="text-sm underline">Déjà un compte ?</Link>
    </form>
  );
}