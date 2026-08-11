export const endpoints = {
  auth: {
    register: "/api/v1/auth/register",
    login: "/api/v1/auth/login",
    logout: "/api/v1/auth/logout",
    refresh: "/api/v1/auth/refresh",
    me: "/api/v1/auth/me",
    avatar: "/api/v1/auth/me/avatar",
    verifyEmail: "/api/v1/auth/verify-email",
    resendVerification: "/api/v1/auth/resend-verification",
    forgotPassword: "/api/v1/auth/forgot-password",
    validateResetToken: "/api/v1/auth/validate-reset-token",
    resetPassword: "/api/v1/auth/reset-password",
    changePassword: "/api/v1/auth/change-password",
  },
  admin: {
    stats: "/api/v1/admin/stats",
    users: "/api/v1/admin/users",
    bookings: "/api/v1/admin/bookings",
    activities: "/api/v1/admin/activities",
    payments: "/api/v1/admin/payments",
  },
  activities: {
    list: "/api/v1/activities",
    detail: (id: string | number) => `/api/v1/activities/${id}`,
  },
  categories: { list: "/api/v1/categories" },
  bookings: { list: "/api/v1/bookings", create: "/api/v1/bookings" },
} as const;