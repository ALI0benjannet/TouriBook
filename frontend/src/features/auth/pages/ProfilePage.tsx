import { useTranslation } from "react-i18next";
import { KeyRound, Save, UserRound } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/form/TextField";
import { AvatarUploader } from "@/features/auth/components/AvatarUploader";
import { useProfileForm } from "@/features/auth/hooks/useProfileForm";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { authApi } from "@/features/auth/api/auth.api";

export default function ProfilePage() {
  const { t } = useTranslation();
  const { user, refreshUser } = useAuth();
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

  const handleUploadAvatar = async (file: File) => {
    await authApi.uploadAvatar(file);
    await refreshUser?.();
  };

  const handleRemoveAvatar = async () => {
    await authApi.deleteAvatar();
    await refreshUser?.();
  };

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8 space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          {t("auth.profile.title")}
        </h1>
        <p className="text-sm text-slate-500">{t("auth.profile.subtitle")}</p>
      </header>

      <div className="space-y-6">
        {/* Photo de profil */}
        <Card>
          <CardBody>
            <AvatarUploader
              currentUrl={user?.avatar_url}
              name={user?.full_name}
              email={user?.email}
              onUpload={handleUploadAvatar}
              onRemove={handleRemoveAvatar}
            />
          </CardBody>
        </Card>

        {/* Informations personnelles */}
        <Card>
          <CardHeader
            title={
              <span className="inline-flex items-center gap-2">
                <UserRound aria-hidden className="size-4 text-slate-400" />
                {t("auth.profile.personal_info")}
              </span>
            }
            description={t("auth.profile.personal_info_hint", "Ces informations apparaissent sur votre compte.")}
          />
          <CardBody>
            <form
              noValidate
              onSubmit={handleProfileSubmit(onSubmitProfile)}
              aria-busy={isProfileSubmitting}
              className="space-y-5"
            >
              <fieldset disabled={isProfileSubmitting} className="grid gap-5 border-0 p-0 sm:grid-cols-2">
                <TextField
                  {...registerProfile("prenom")}
                  autoComplete="given-name"
                  label={t("auth.profile.first_name")}
                  error={profileErrors.prenom?.message ? t(profileErrors.prenom.message) : undefined}
                />
                <TextField
                  {...registerProfile("nom")}
                  autoComplete="family-name"
                  label={t("auth.profile.last_name")}
                  error={profileErrors.nom?.message ? t(profileErrors.nom.message) : undefined}
                />
              </fieldset>

              <div className="flex justify-end">
                <Button type="submit" loading={isProfileSubmitting} leftIcon={<Save className="size-4" />}>
                  {t("auth.profile.save")}
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>

        {/* Mot de passe */}
        <Card>
          <CardHeader
            title={
              <span className="inline-flex items-center gap-2">
                <KeyRound aria-hidden className="size-4 text-slate-400" />
                {t("auth.profile.password")}
              </span>
            }
            description={t("auth.profile.password_hint", "Utilisez au moins 8 caractères, avec chiffres et symboles.")}
          />
          <CardBody>
            <form
              noValidate
              onSubmit={handlePasswordSubmit(onSubmitPassword)}
              aria-busy={isPasswordSubmitting}
              className="space-y-5"
            >
              <fieldset disabled={isPasswordSubmitting} className="space-y-5 border-0 p-0">
                <TextField
                  {...registerPassword("old_password")}
                  type="password"
                  autoComplete="current-password"
                  label={t("auth.profile.old_password")}
                  error={passwordErrors.old_password?.message ? t(passwordErrors.old_password.message) : undefined}
                />
                <div className="grid gap-5 sm:grid-cols-2">
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
                    error={
                      passwordErrors.confirm_new_password?.message
                        ? t(passwordErrors.confirm_new_password.message)
                        : undefined
                    }
                  />
                </div>
              </fieldset>

              <div className="flex justify-end">
                <Button type="submit" loading={isPasswordSubmitting} leftIcon={<KeyRound className="size-4" />}>
                  {t("auth.profile.update_password")}
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      </div>
    </main>
  );
}