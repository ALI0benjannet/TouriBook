"use client";

import { useTranslation } from "react-i18next";

/** Rend une clé i18n depuis un composant serveur.
 *
 *  Les pages du catalogue sont rendues côté serveur (SEO) et n'ont pas accès à
 *  la langue choisie dans le navigateur : elles importaient donc le JSON
 *  français en dur. Ce composant client rend la clé dans la langue active, tout
 *  en laissant le SSR produire le texte français indexable. */
export function T({
  k,
  values,
  fallback,
}: {
  k: string;
  values?: Record<string, unknown>;
  fallback?: string;
}) {
  const { t } = useTranslation();
  return <>{fallback ? t(k, fallback, values) : t(k, values)}</>;
}
