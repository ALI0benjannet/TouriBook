import { Link, NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Menu, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { UserMenu } from "./UserMenu";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { paths } from "@/routes/paths";
import { cn } from "@/lib/utils";

const links = [
  { to: paths.home, key: "nav.home" },
  { to: paths.activities, key: "nav.activities" },
  { to: paths.favorites, key: "nav.favorites" },
  { to: paths.bookings, key: "nav.bookings" },
];

export function Navbar() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();

  const navClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      "rounded-md px-3 py-2 text-sm font-medium transition-colors",
      "hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
      isActive ? "text-primary" : "text-muted-foreground",
    );

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link to={paths.home} className="flex items-center gap-2 font-display text-lg font-bold">
          <Compass className="size-6 text-primary" />
          TouriBook
        </Link>

        {/* Desktop */}
        <div className="ms-6 hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} className={navClass}>{t(l.key)}</NavLink>
          ))}
        </div>

        <div className="ms-auto flex items-center gap-2">
          <LanguageSwitcher />
          {isAuthenticated ? (
            <UserMenu />
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Button variant="ghost" size="sm">
                <Link to={paths.login}>{t("nav.login")}</Link>
              </Button>
              <Button size="sm">
                <Link to={paths.register}>{t("nav.register")}</Link>
              </Button>
            </div>
          )}

          {/* Mobile */}
          <Sheet>
            <SheetTrigger>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Menu">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="end" className="w-72">
              <div className="mt-8 flex flex-col gap-1">
                {links.map((l) => (
                  <NavLink key={l.to} to={l.to} className={navClass}>{t(l.key)}</NavLink>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}