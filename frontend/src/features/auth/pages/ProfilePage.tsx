import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";
import { TextField } from "@/components/form/TextField";
import { useProfileForm } from "@/features/auth/hooks/useProfileForm";

export default function ProfilePage() {
  const { t } = useTranslation();
  const { profileForm, onSubmitProfile, passwordForm, onSubmitPassword } = useProfileForm();

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors, isSubmitting: isProfileSubmitting },
  } = profileForm;

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors, isSubmitting: isPasswordSubmitting },
  } = passwordForm;

  return (
    <main className="flex min-h-dvh items-center justify-center p-6 sm:p-8">
      <div className="w-full max-w-3xl space-y-8 rounded-3xl border border-slate-200 bg-white/80 p-8 shadow-xl backdrop-blur">
        <header className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">{t("auth.profile.title")}</h1>
          <p className="text-sm text-slate-500">{t("auth.profile.subtitle")}</p>
        </header>

        <section className="space-y-4 rounded-2xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold">{t("auth.profile.personal_info")}</h2>
          <form noValidate onSubmit={handleProfileSubmit(onSubmitProfile)} aria-busy={isProfileSubmitting} className="space-y-4">
            <fieldset disabled={isProfileSubmitting} className="space-y-4 border-0 p-0">
              <TextField
                {...registerProfile("prenom")}
                label={t("auth.profile.first_name")}
                error={profileErrors.prenom?.message ? t(profileErrors.prenom.message) : undefined}
              />
              <TextField
                {...registerProfile("nom")}
                label={t("auth.profile.last_name")}
                error={profileErrors.nom?.message ? t(profileErrors.nom.message) : undefined}
              />
            </fieldset>
            <button type="submit" className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-medium text-white">
              {isProfileSubmitting && <Loader2 aria-hidden className="size-4 animate-spin" />}
              {t("auth.profile.save")}
            </button>
          </form>
        </section>

        <section className="space-y-4 rounded-2xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold">{t("auth.profile.password")}</h2>
          <form noValidate onSubmit={handlePasswordSubmit(onSubmitPassword)} aria-busy={isPasswordSubmitting} className="space-y-4">
            <fieldset disabled={isPasswordSubmitting} className="space-y-4 border-0 p-0">
              <TextField
                {...registerPassword("old_password")}
                type="password"
                autoComplete="current-password"
                label={t("auth.profile.old_password")}
                error={passwordErrors.old_password?.message ? t(passwordErrors.old_password.message) : undefined}
              />
              <TextField
                {...registerPassword("new_password")}
                type="password"
                autoComplete="new-password"
                label={t("auth.profile.new_password")}
                error={passwordErrors.new_password?.message ? t(passwordErrors.new_password.message) : undefined}
              />
              <TextField
                {...registerPassword("confirm_new_password")}
                type="password"
                autoComplete="new-password"
                label={t("auth.profile.confirm_new_password")}
                error={passwordErrors.confirm_new_password?.message ? t(passwordErrors.confirm_new_password.message) : undefined}
              />
            </fieldset>
            <button type="submit" className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-medium text-white">
              {isPasswordSubmitting && <Loader2 aria-hidden className="size-4 animate-spin" />}
              {t("auth.profile.update_password")}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
