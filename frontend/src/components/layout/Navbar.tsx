import { Link, NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Menu } from "lucide-react";
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
      "group relative px-3 py-2 text-sm font-medium transition-colors",
      "hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none rounded-md",
      isActive ? "text-foreground" : "text-muted-foreground",
    );

  const navUnderline = (isActive: boolean) =>
    cn(
      "pointer-events-none absolute inset-x-3 -bottom-[1px] h-[2px] rounded-full bg-primary transition-all duration-300 ease-out",
      isActive ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0 group-hover:opacity-40 group-hover:scale-x-100",
    );

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <nav className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          to={paths.home}
          className="group flex items-center gap-2.5 font-display text-lg font-bold tracking-tight"
        >
          <img
            src="/icon.png"
            alt="TouriBook"
            className="h-8 w-8 transition-transform duration-300 ease-out group-hover:scale-105 group-hover:rotate-6"
          />
          <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            TouriBook
          </span>
        </Link>

        {/* Desktop */}
        <div className="ms-6 hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} className={navClass}>
              {({ isActive }) => (
                <>
                  {t(l.key)}
                  <span className={navUnderline(isActive)} />
                </>
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
              <Button variant="ghost" size="sm">
                <Link to={paths.login}>{t("nav.login")}</Link>
              </Button>
              <Button
                size="sm"
                className="bg-gradient-to-r from-primary to-primary/80 shadow-sm transition-shadow hover:shadow-md hover:shadow-primary/20"
              >
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
                  <NavLink
                    key={l.to}
                    to={l.to}
                    className={({ isActive }) =>
                      cn(
                        "rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                        "hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                        isActive ? "bg-muted text-foreground" : "text-muted-foreground",
                      )
                    }
                  >
                    {t(l.key)}
                  </NavLink>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
