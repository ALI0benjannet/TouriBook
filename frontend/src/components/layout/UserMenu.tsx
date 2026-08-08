import { Link } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { paths } from "@/routes/paths";

export function UserMenu() {
  const { user, logout } = useAuth();

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">{user?.full_name ?? user?.email}</span>
      <Link to={paths.profile} className="text-sm font-medium">Profil</Link>
      <button type="button" onClick={logout} className="text-sm font-medium">
        Déconnexion
      </button>
    </div>
  );
}
