"use client";

import dynamic from "next/dynamic";

import type { ActivityMapProps } from "./ActivityMap";

/** MapLibre accède à `window` dès l'import : la carte ne peut pas être rendue
 *  côté serveur. Ce wrapper client la charge à la demande — les pages qui
 *  l'utilisent restent des composants serveur (SSR/SEO préservés). */
const ActivityMap = dynamic(() => import("./ActivityMap").then((m) => m.ActivityMap), {
  ssr: false,
  loading: () => (
    <div
      aria-hidden
      className="size-full animate-pulse bg-gradient-to-br from-[#DCEAE6] to-[#EAD9B8]"
    />
  ),
});

export function ActivityMapLoader(props: ActivityMapProps) {
  return <ActivityMap {...props} />;
}
