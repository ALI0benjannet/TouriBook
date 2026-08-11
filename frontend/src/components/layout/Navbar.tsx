import { Link, NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  LogIn,
  Menu,
  UserPlus,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { UserMenu } from "./UserMenu";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { paths } from "@/routes/paths";
import { cn } from "@/lib/utils";

const links = [
  { to: paths.home, key: "nav.home", image: "/accueil.png" },
  { to: paths.activities, key: "nav.activities", image: "/activite.png" },
  { to: paths.favorites, key: "nav.favorites", image: "/favoris.png" },
  { to: paths.bookings, key: "nav.bookings", image: "/reservation.png" },
];

export function Navbar() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();

  const navClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      "group relative rounded-md px-3 py-2 text-sm font-medium transition-colors",
      "hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      isActive ? "text-foreground" : "text-muted-foreground",
    );

  const navUnderline = (isActive: boolean) =>
    cn(
      "pointer-events-none absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-primary transition-all duration-300 ease-out",
      isActive
        ? "scale-x-100 opacity-100"
        : "scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-40",
    );

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <nav className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          to={paths.home}
          className="group flex items-center gap-2.5 text-lg font-bold tracking-tight"
        >
          <img
            src="/icon.png"
            alt=""
            aria-hidden
            className="size-8 transition-transform duration-300 ease-out group-hover:rotate-6 group-hover:scale-105"
          />
          <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            TouriBook
          </span>
        </Link>

        {/* Desktop */}
        <div className="ms-6 hidden items-center gap-1 md:flex">
          {links.map(({ to, key, image }) => (
            <NavLink key={to} to={to} className={navClass}>
              {({ isActive }) => (
                <span className="flex items-center gap-2">
                  <img src={image} alt="" aria-hidden="true" className="size-4 object-contain" />
                  {t(key)}
                  <span className={navUnderline(isActive)} />
                </span>
              )}
            </NavLink>
          ))}
        </div>

        <div className="ms-auto flex items-center gap-2">
          <LanguageSwitcher />
          <div className="mx-1 hidden h-6 w-px bg-border sm:block" />

          {isAuthenticated ? (
            <UserMenu />
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Button asChild variant="ghost" size="sm">
                <Link to={paths.login}>
                  <LogIn className="size-4" aria-hidden="true" />
                  {t("nav.login")}
                </Link>
              </Button>
              <Button asChild size="sm">
                <Link to={paths.register}>
                  <UserPlus className="size-4" aria-hidden="true" />
                  {t("nav.register")}
                </Link>
              </Button>
            </div>
          )}

          {/* Mobile */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label={t("nav.menu", "Menu")}>
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="end" className="w-72">
              <div className="mt-8 flex flex-col gap-1">
                {links.map(({ to, key, image }) => (
                  <NavLink
                    key={to}
                    to={to}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                        "hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        isActive ? "bg-muted text-foreground" : "text-muted-foreground",
                      )
                    }
                  >
                    <img src={image} alt="" aria-hidden="true" className="size-4 object-contain" />
                    {t(key)}
                  </NavLink>
                ))}

                {isAuthenticated && (
                  <NavLink
                    to={paths.profile}
                    className="mt-2 flex items-center gap-2 rounded-md border-t border-border px-3 py-2.5 pt-4 text-sm font-medium text-muted-foreground hover:bg-muted"
                  >
                    <UserRound className="size-4" />
                    {t("nav.profile", "Mon profil")}
                  </NavLink>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}