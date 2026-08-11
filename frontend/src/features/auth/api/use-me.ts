import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api/axios';
import { qk } from '@/lib/query-keys'
import type { User } from '@/types/user';
import type { UserRead } from '@/features/auth/types/auth.types'

export const useMe = (enabled = true) =>
  useQuery({
    queryKey: qk.auth.me,
    queryFn: async () => {
      const { data } = await api.get<UserRead>("/api/v1/auth/me");
      return {
        id: data.id.toString(),
        email: data.email,
        nom: data.nom,
        prenom: data.prenom,
        full_name: `${data.prenom} ${data.nom}`,
        role: data.role,
        is_verified: data.is_verified,
        avatar_url: data.avatar_url,
      } satisfies User;
    },
    enabled,
    staleTime: 5 * 60_000,
  })
