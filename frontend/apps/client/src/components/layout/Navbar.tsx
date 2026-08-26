"use client";

import { Heart, LogIn, ShoppingCart, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { cn } from "@touribook/ui/lib/utils";
import { useAuth } from "@touribook/auth/hooks/use-auth";

import { LanguageMenu } from "./LanguageMenu";
import { StickySearch } from "./StickySearch";
import { UserMenu } from "./UserMenu";
import { useFavorites } from "@/features/favorites/hooks";
import { useMyBookings } from "@/features/bookings/hooks";
import { paths } from "@/routes/paths";
import { useHydratedTranslation } from "@/features/i18n/use-hydrated-language";

function Badge({ count, tone }: { count: number; tone: "accent" | "primary" }) {
  if (!count) return null;
  return (
    <span
      className={cn(
        "absolute -top-2 -end-2 min-w-[18px] rounded-full px-1 text-center text-[10px] font-bold leading-[18px] text-white",
        tone === "accent" ? "bg-blue-600" : "bg-rose-500",
      )}
    >
      {count}
    </span>
  );
}

const ICON_TAB_CLASS =
  "flex flex-col items-center gap-1 text-foreground/70 transition-colors hover:text-blue-600";

/** Onglet icône + libellé de l'en-tête. Rendu en lien, ou en bouton quand
 *  l'action n'est pas une navigation (panier à venir, sélecteur de langue). */
function IconTab({
  href,
  onClick,
  icon,
  label,
  badge,
  title,
}: {
  href?: string;
  onClick?: () => void;
  icon: React.ReactNode;
  label: string;
  badge?: React.ReactNode;
  title?: string;
}) {
  const content = (
    <>
      <span className="relative leading-none">
        {icon}
        {badge}
      </span>
      <span className="text-xs font-medium">{label}</span>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={ICON_TAB_CLASS} title={title}>
        {content}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={ICON_TAB_CLASS} title={title}>
      {content}
    </button>
  );
}

export function Navbar() {
  const { t } = useHydratedTranslation();
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const { data: favorites } = useFavorites();
  const { data: bookings } = useMyBookings();

  // La recherche n'a de sens que sur les pages qui listent des activités.
  const showSearch = pathname === "/" || pathname === paths.activities;

  const tabClass = (active: boolean) =>
    cn(
      "shrink-0 border-b-[3px] px-3.5 pb-3 pt-2.5 text-sm font-semibold transition-colors",
      active
        ? "border-blue-600 text-blue-600"
        : "border-transparent text-foreground/75 hover:text-foreground",
    );

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-white shadow-sm">   
       {/* Rangée 1 : logo + favoris/réservations/langues/profil */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 pb-1 pt-3 sm:px-8">
        <Link href={paths.home} className="flex items-center gap-2.5">
          <img src="/logo.png" alt="TouriBook" className="size-10 object-contain" />
          <span className="font-display text-[22px] tracking-wide">TouriBook</span>
        </Link>

        <div className="flex items-center gap-5 sm:gap-7">
          <IconTab
            href={paths.favorites}
            icon={<Heart className="size-[22px]" strokeWidth={1.6} />}
            label={t("nav.favoritesShort")}
            badge={<Badge count={favorites?.length ?? 0} tone="accent" />}
          />

          {/* Panier : mène aux réservations (la réservation multiple viendra
              s'y greffer après la soutenance). */}
          <IconTab
            href={paths.bookings}
            icon={<ShoppingCart className="size-[22px]" strokeWidth={1.6} />}
            label={t("nav.cart")}
            badge={<Badge count={bookings?.total ?? 0} tone="primary" />}
          />

          <LanguageMenu />

          {isAuthenticated ? (
            <UserMenu />
          ) : (
            <button
              type="button"
              onClick={() => router.push(paths.login)}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-blue-700 hover:shadow-md"
            >
              <LogIn className="size-4" />
              <span className="hidden sm:inline">{t("nav.login")}</span>
            </button>
          )}
        </div>
      </div>

      {/* Recherche collante : uniquement là où elle a du sens. */}
      {showSearch && <StickySearch />}

      {/* Rangée 3 : navigation principale — les catégories sont des filtres
          de la page Activités, pas des entrées de menu. */}
      <nav className="mx-auto flex max-w-7xl gap-0.5 overflow-x-auto px-3 sm:px-6">
        <Link href={paths.home} className={tabClass(pathname === "/")}>
          {t("nav.home")}
        </Link>
        <Link href={paths.activities} className={tabClass(pathname === paths.activities)}>
          {t("nav.activities")}
        </Link>
        {isAuthenticated && (
          <Link
            href={paths.profile}
            className={cn(tabClass(pathname === paths.profile), "ms-auto hidden sm:block")}
          >
            <span className="inline-flex items-center gap-1.5">
              <UserRound className="size-3.5" />
              {t("nav.profile")}
            </span>
          </Link>
        )}
      </nav>
    </header>
  );
}
