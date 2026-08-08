import { useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { authApi } from "@/features/auth/api/auth.api";
import { changePasswordSchema, updateProfileSchema, type ChangePasswordInput, type UpdateProfileInput } from "@/features/auth/schemas/authSchemas";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { authStore } from "@/features/auth/stores/auth.store";
import { getAuthErrorCode } from "@/lib/api-error";
import { toApiError } from "@/lib/api/errors";

export function useProfileForm() {
  const { t } = useTranslation();
  const { user } = useAuth();

  const profileForm = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    mode: "onTouched",
    defaultValues: { nom: "", prenom: "" },
  });

  const passwordForm = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    mode: "onTouched",
    defaultValues: { old_password: "", new_password: "", confirm_new_password: "" },
  });

  useEffect(() => {
    if (user) {
      profileForm.reset({ nom: user.nom ?? "", prenom: user.prenom ?? "" });
    }
  }, [profileForm, user]);

  const onSubmitProfile = useCallback(
    async (data: UpdateProfileInput) => {
      try {
        const updatedUser = await authApi.updateProfile({ nom: data.nom, prenom: data.prenom });
        authStore.getState().setUser({
          ...user,
          nom: updatedUser.nom,
          prenom: updatedUser.prenom,
        } as typeof user);
        toast.success(t("auth.profile.success"));
      } catch (error: unknown) {
        const apiError = toApiError(error);
        const message = apiError.message ?? t("errors.unknown");
        profileForm.setError("root.serverError", { type: "update_profile", message });
        toast.error(message);
      }
    },
    [profileForm, t, user],
  );

  const onSubmitPassword = useCallback(
    async (data: ChangePasswordInput) => {
      try {
        const tokens = await authApi.changePassword({
          old_password: data.old_password,
          new_password: data.new_password,
          refresh_token: authStore.getState().refreshToken ?? "",
        });
        authStore.setState({ accessToken: tokens.access_token, refreshToken: tokens.refresh_token });
        passwordForm.reset();
        toast.success(t("auth.password.success"));
      } catch (error: unknown) {
        const apiError = toApiError(error);
        const code = getAuthErrorCode(error);
        const message = apiError.message ?? t(`auth.errors.${code}`, { defaultValue: t("errors.unknown") });
        passwordForm.setError("root.serverError", { type: code, message });
        toast.error(message);
      }
    },
    [passwordForm, t],
  );

  return { profileForm, onSubmitProfile, passwordForm, onSubmitPassword };
}
