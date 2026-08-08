export const endpoints = {
  auth: {
    register: "/api/v1/auth/register",
    login: "/api/v1/auth/login",
    logout: "/api/v1/auth/logout",
    refresh: "/api/v1/auth/refresh",
    me: "/api/v1/auth/me",
    verifyEmail: "/api/v1/auth/verify-email",
    resendVerification: "/api/v1/auth/resend-verification",
    forgotPassword: "/api/v1/auth/forgot-password",
    resetPassword: "/api/v1/auth/reset-password",
    changePassword: "/api/v1/auth/change-password",
  },
  activities: { list: "/activities", detail: (id: string) => `/activities/${id}` },
  categories: { list: "/categories" },
  bookings: { list: "/bookings", create: "/bookings" },
} as const;