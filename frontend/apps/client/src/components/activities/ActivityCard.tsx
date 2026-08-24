"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";

import { ActivityImage } from "@/components/activities/ActivityImage";
import { FavoriteButton } from "@/components/activities/FavoriteButton";
import type { Activity } from "@/features/catalog/api";
import { formatDuration, formatPrice } from "@/features/catalog/format";
import { activityTitle, categoryName } from "@/features/catalog/i18n-content";

export type Rating = { average: number; count: number };

/**
 * Carte activité. Le titre et la catégorie viennent de la base : ils sont lus
 * dans la langue active (colonnes `*_en` / `*_ar`, repli français), tandis que
 * les libellés d'interface passent par i18next.
 */
export function ActivityCard({ activity, rating }: { activity: Activity; rating?: Rating }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const detailPath = `/activities/${activity.id}`;
  const title = activityTitle(activity, lang);

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-200 focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(28,54,65,0.13)]">
      {/* Lien étalé sur toute la carte : un clic n'importe où ouvre l'activité.
          Un seul lien porte le titre accessible — imbriquer des <a> serait
          invalide, et les autres éléments cliquables (cœur, bouton) repassent
          au-dessus via `relative z-10`. */}
      <Link href={detailPath} className="absolute inset-0 z-0" aria-label={title}>
        <span className="sr-only">{title}</span>
      </Link>

      <div className="relative h-44">
        <ActivityImage src={activity.photos} label={`Photo — ${activity.localisation}`} />
        <FavoriteButton activityId={activity.id} />
        {activity.category && (
          <span className="absolute bottom-3 start-3 rounded-full bg-ink/80 px-3 py-1 text-xs font-semibold text-white">
            {categoryName(activity.category, lang)}
          </span>
        )}
      </div>

      <div className="pointer-events-none relative z-10 flex flex-1 flex-col gap-1.5 p-4">
        <h3 className="font-display text-lg leading-snug text-foreground transition-colors group-hover:text-blue-600">
          {title}
        </h3>
        <div className="text-[13px] text-muted-foreground">
          {activity.localisation} · {formatDuration(activity.duree, lang)}
        </div>
        {rating && rating.count > 0 && (
          <div className="text-[13px] text-foreground/75">
            <span className="text-gold">★</span> <b>{rating.average.toFixed(1)}</b> ({rating.count})
          </div>
        )}
        <div className="mt-auto flex items-center justify-between pt-2">
          <div>
            <span className="text-lg font-bold">{formatPrice(activity.prix)}</span>
            <span className="text-xs text-muted-foreground"> {t("catalog.perPerson")}</span>
          </div>
          <Link
            href={detailPath}
            tabIndex={-1}
            aria-hidden
            className="pointer-events-auto relative z-10 rounded-full bg-ink px-4 py-2 text-[13px] font-semibold text-background transition-colors hover:bg-blue-600"
          >
            {t("catalog.book")}
          </Link>
        </div>
      </div>
    </article>
  );
}
