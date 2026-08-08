import { api } from "@/lib/api/axios";
import { endpoints } from "@/lib/api/endpoints";
import type {
  ChangePasswordPayload,
  ForgotPasswordPayload,
  LoginPayload,
  RefreshPayload,
  RegisterPayload,
  ResendVerificationPayload,
  ResetPasswordPayload,
  Token,
  UpdateProfilePayload,
  UserRead,
  VerifyEmailPayload,
} from "@/features/auth/types/auth.types";

export const authApi = {
  login: (payload: LoginPayload) =>
    api.post<Token>(endpoints.auth.login, payload).then((response) => response.data),
  logout: (refreshToken?: string) =>
    api.post(endpoints.auth.logout, { token: refreshToken }).then((response) => response.data),
  me: () => api.get<UserRead>(endpoints.auth.me).then((response) => response.data),
  register: (payload: RegisterPayload) =>
    api.post<UserRead>(endpoints.auth.register, payload).then((response) => response.data),
  refresh: (payload: RefreshPayload) =>
    api.post<Token>(endpoints.auth.refresh, payload).then((response) => response.data),
  verifyEmail: (payload: VerifyEmailPayload) =>
    api.post(endpoints.auth.verifyEmail, payload).then((response) => response.data),
  resendVerification: (payload: ResendVerificationPayload) =>
    api.post(endpoints.auth.resendVerification, payload).then((response) => response.data),
  forgotPassword: (payload: ForgotPasswordPayload) =>
    api.post(endpoints.auth.forgotPassword, payload).then((response) => response.data),
  resetPassword: (payload: ResetPasswordPayload) =>
    api.post(endpoints.auth.resetPassword, payload).then((response) => response.data),
  updateProfile: (payload: UpdateProfilePayload) =>
    api.patch<UserRead>(endpoints.auth.me, payload).then((response) => response.data),
  changePassword: (payload: ChangePasswordPayload) =>
    api.post<Token>(endpoints.auth.changePassword, payload).then((response) => response.data),
};