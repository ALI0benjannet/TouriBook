export type Role = "tourist" | "admin";

export type User = {
  id: string;
  email: string;
  full_name: string;
  role: Role;
  is_verified: boolean;
  preferred_language?: string;
};
