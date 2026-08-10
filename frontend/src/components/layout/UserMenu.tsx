import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CalendarCheck, Heart, LogOut, Settings, UserRound } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { paths } from "@/routes/paths";

export function UserMenu() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate(paths.login);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {/* ICÔNE DE PROFIL : avatar cliquable */}
        <button
          type="button"
          aria-label={t("nav.account", "Mon compte")}
          className="group inline-flex items-center gap-2 rounded-full p-0.5 transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Avatar
            src={user?.avatar_url}
            name={user?.full_name}
            email={user?.email}
            size="md"
            className="ring-2 ring-transparent transition group-hover:ring-primary/30"
          />
          <span className="me-1 hidden max-w-[10rem] truncate text-sm font-medium text-foreground lg:inline">
            {user?.full_name ?? user?.email}
          </span>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <div className="flex items-center gap-3 border-b border-slate-100 px-3 pb-3 pt-1">
          <Avatar src={user?.avatar_url} name={user?.full_name} email={user?.email} size="md" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">
              {user?.full_name ?? t("nav.account", "Mon compte")}
            </p>
            <p className="truncate text-xs text-slate-500">{user?.email}</p>
          </div>
        </div>

        <div className="pt-2">
          <DropdownMenuItem onSelect={() => navigate(paths.profile)}>
            <span className="flex items-center gap-2">
              <UserRound className="size-4 text-slate-400" />
              {t("nav.profile", "Mon profil")}
            </span>
          </DropdownMenuItem>

          <DropdownMenuItem onSelect={() => navigate(paths.bookings)}>
            <span className="flex items-center gap-2">
              <CalendarCheck className="size-4 text-slate-400" />
              {t("nav.bookings", "Mes réservations")}
            </span>
          </DropdownMenuItem>

          <DropdownMenuItem onSelect={() => navigate(paths.favorites)}>
            <span className="flex items-center gap-2">
              <Heart className="size-4 text-slate-400" />
              {t("nav.favorites", "Mes favoris")}
            </span>
          </DropdownMenuItem>

          <DropdownMenuItem onSelect={() => navigate(paths.profile)}>
            <span className="flex items-center gap-2">
              <Settings className="size-4 text-slate-400" />
              {t("nav.settings", "Paramètres")}
            </span>
          </DropdownMenuItem>
        </div>

        <div className="mt-2 border-t border-slate-100 pt-2">
          <DropdownMenuItem className="text-red-600 hover:bg-red-50" onSelect={() => void handleLogout()}>
            <span className="flex items-center gap-2">
              <LogOut className="size-4" />
              {t("nav.logout", "Déconnexion")}
            </span>
          </DropdownMenuItem>
        </div>

        {/* Lien direct de secours (SEO/accessibilité) */}
        <Link to={paths.profile} className="sr-only">
          {t("nav.profile", "Mon profil")}
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}