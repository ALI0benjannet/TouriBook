export const qk = {
  auth: {
    me: ["auth", "me"] as const,
  },
  activities: {
    all: ["activities"] as const,
    list: (filters: Record<string, unknown>) => ["activities", "list", filters] as const,
    detail: (id: string) => ["activities", "detail", id] as const,
  },
  bookings: {
    mine: ["bookings", "mine"] as const,
  },
} as const;