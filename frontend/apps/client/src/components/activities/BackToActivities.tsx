"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";

/** Lien de retour au catalogue — traduit, et sensible au sens d'écriture
 *  (la flèche pointe vers la droite en arabe). */
export function BackToActivities() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir(i18n.language) === "rtl";

  return (
    <Link
      href="/activities"
      className="mb-5 inline-block text-sm font-semibold text-primary hover:text-blue-600"
    >
      {isRtl ? "→" : "←"} {t("detail.back")}
    </Link>
  );
}
