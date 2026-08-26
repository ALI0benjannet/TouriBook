"use client";

import type { Activity } from "@/features/catalog/api";
import {
  activityDescription,
  activityTitle,
  categoryName,
} from "@/features/catalog/i18n-content";
import { formatDuration } from "@/features/catalog/format";
import { useHydratedTranslation } from "@/features/i18n/use-hydrated-language";

/** Titre, catégorie et description de l'activité, dans la langue de l'interface.
 *
 *  Ce contenu vient de la base : il ne peut pas être traduit par les fichiers
 *  i18n statiques. Le composant est rendu côté client parce que la langue est
 *  un choix du navigateur — mais le HTML servi par le serveur contient déjà la
 *  version française, qui reste celle indexée par les moteurs de recherche. */
export function ActivityContent({
  activity,
  stats,
}: {
  activity: Activity;
  stats?: { average: number; count: number };
}) {
  const { t, language: lang } = useHydratedTranslation();

  return (
    <>
      {activity.category && (
        <span className="rounded-full bg-primary/10 px-3.5 py-1.5 text-[13px] font-semibold text-primary">
          {categoryName(activity.category, lang)}
        </span>
      )}
      <h1 className="font-display mb-2.5 mt-4 text-3xl leading-tight sm:text-4xl">
        {activityTitle(activity, lang)}
      </h1>
      <div className="mb-2 text-[15px] text-muted-foreground">
        {activity.localisation} · {formatDuration(activity.duree, lang)}
      </div>
      {stats && stats.count > 0 && (
        <div className="mb-6 text-[15px]">
          <span className="text-gold">★</span> <b>{stats.average.toFixed(1)}</b> ·{" "}
          {t("detail.reviewCount", { count: stats.count })}
        </div>
      )}
      <p className="max-w-2xl text-base leading-relaxed text-foreground/80">
        {activityDescription(activity, lang)}
      </p>
    </>
  );
}
