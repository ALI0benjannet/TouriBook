import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, MapPin, Tags, CalendarCheck,
  CreditCard, Users, Star, LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { cn } from "@/lib/utils";
import { paths } from "@/routes/paths";

const NAV = [
  { to: "/admin/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { to: "/admin/activities", label: "Activités", icon: MapPin },
  { to: "/admin/categories", label: "Catégories", icon: Tags },
  { to: "/admin/bookings", label: "Réservations", icon: CalendarCheck },
  { to: "/admin/payments", label: "Paiements", icon: CreditCard },
  { to: "/admin/users", label: "Utilisateurs", icon: Users },
  { to: "/admin/reviews", label: "Avis", icon: Star },
];

export function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-dvh bg-muted/30">
      <aside className="hidden w-64 shrink-0 flex-col border-e bg-background md:flex">
        <div className="flex h-16 items-center gap-2 border-b px-4 font-semibold">
          <MapPin className="size-5 text-primary" />
          <span>TouriBook Admin</span>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )
              }
            >
              <Icon className="size-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t p-3">
          <p className="truncate px-3 pb-2 text-xs text-muted-foreground">
            {user?.email}
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start"
            onClick={() => {
              logout();
              navigate(paths.login, { replace: true });
            }}
          >
            <LogOut className="size-4" />
            <span className="ms-2">Déconnexion</span>
          </Button>
        </div>
      </aside>

      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
}