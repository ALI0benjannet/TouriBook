"use client";

import Link from "next/link";

import { useHydratedTranslation } from "@/features/i18n/use-hydrated-language";

/** Lien de retour au catalogue — traduit, et sensible au sens d'écriture
 *  (la flèche pointe vers la droite en arabe). */
export function BackToActivities() {
  const { t, language } = useHydratedTranslation();
  const isRtl = language === "ar";

  return (
    <Link
      href="/activities"
      className="mb-5 inline-block text-sm font-semibold text-primary hover:text-blue-600"
    >
      {isRtl ? "→" : "←"} {t("detail.back")}
    </Link>
  );
}
