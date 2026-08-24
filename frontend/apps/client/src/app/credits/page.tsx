import type { Metadata } from "next";

import credits from "./photo-credits.json";

export const metadata: Metadata = {
  title: "Crédits photo",
  description:
    "Auteurs et licences des photographies utilisées sur TouriBook, issues de Wikimedia Commons.",
  alternates: { canonical: "/credits" },
};

interface PhotoCredit {
  activite: string;
  fichier: string;
  auteur: string;
  licence: string;
  source: string;
}

/** Attribution des photos — exigée par les licences CC BY et CC BY-SA.
 *  Le fichier JSON est généré par `services/catalog/scripts/seed_photos.py`. */
export default function CreditsPage() {
  const photos = credits as PhotoCredit[];

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-8">
      <h1 className="font-display mb-2 text-4xl">Crédits photo</h1>
      <p className="mb-10 text-muted-foreground">
        Les photographies des activités proviennent de{" "}
        <a
          href="https://commons.wikimedia.org"
          className="text-primary hover:underline"
          rel="noreferrer"
          target="_blank"
        >
          Wikimedia Commons
        </a>{" "}
        et sont réutilisées sous licence libre. Merci à leurs auteurs.
      </p>

      <ul className="space-y-5 text-[15px] leading-relaxed text-foreground/85">
        {photos.map((photo) => (
          <li key={photo.fichier} className="border-b border-border pb-5 last:border-0">
            <div className="font-semibold text-foreground">{photo.activite}</div>
            <div className="mt-1 text-muted-foreground">
              <a
                href={photo.source}
                className="text-primary hover:underline"
                rel="noreferrer"
                target="_blank"
              >
                {photo.fichier}
              </a>{" "}
              — {photo.auteur} · {photo.licence}
            </div>
          </li>
        ))}
      </ul>

      <p className="mt-10 text-sm text-muted-foreground">
        Fonds cartographique © contributeurs{" "}
        <a
          href="https://www.openstreetmap.org/copyright"
          className="text-primary hover:underline"
          rel="noreferrer"
          target="_blank"
        >
          OpenStreetMap
        </a>
        , tuiles vectorielles servies par{" "}
        <a
          href="https://openfreemap.org"
          className="text-primary hover:underline"
          rel="noreferrer"
          target="_blank"
        >
          OpenFreeMap
        </a>
        .
      </p>
    </main>
  );
}
