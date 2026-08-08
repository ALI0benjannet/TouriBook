import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import { qk } from '@/lib/query-keys'
import type { User } from '@/features/auth/stores/auth.store'

export const useMe = (enabled = true) =>
  useQuery({
    queryKey: qk.auth.me,
    queryFn: async () => (await api.get<{ user: User }>('/api/v1/auth/me')).data.user,
    enabled,
    staleTime: 5 * 60_000,
  })
