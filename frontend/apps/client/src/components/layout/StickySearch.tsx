"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Search } from "lucide-react";

import { paths } from "@/routes/paths";

/** Recherche intégrée à l'en-tête fixe : elle reste accessible quel que soit
 *  le défilement, sur l'accueil et le catalogue.
 *
 *  Sur `/activities`, la saisie écrit directement dans l'URL (la liste est
 *  re-rendue côté serveur) ; ailleurs, la validation envoie vers le catalogue. */
export function StickySearch() {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const onCatalog = pathname === paths.activities;
  const urlSearch = searchParams?.get("search") ?? "";

  const [value, setValue] = useState(urlSearch);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Resynchronise quand l'URL change (retour arrière, réinitialisation…).
  useEffect(() => setValue(urlSearch), [urlSearch]);

  // Nettoie le minuteur si le composant disparaît avant son échéance.
  useEffect(() => () => void (debounce.current && clearTimeout(debounce.current)), []);

  const pushSearch = (next: string) => {
    const params = new URLSearchParams(searchParams?.toString());
    if (next) params.set("search", next);
    else params.delete("search");
    router.replace(`${paths.activities}?${params.toString()}`, { scroll: false });
  };

  const onChange = (next: string) => {
    setValue(next);
    if (!onCatalog) return; // hors catalogue, on attend la validation
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(() => pushSearch(next), 350);
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (debounce.current) clearTimeout(debounce.current);
    const term = value.trim();
    if (onCatalog) {
      pushSearch(term);
      return;
    }
    router.push(term ? `${paths.activities}?search=${encodeURIComponent(term)}` : paths.activities);
  };

  return (
    <form
      role="search"
      onSubmit={submit}
      className="mx-auto flex max-w-7xl items-center gap-2 px-4 pb-3 sm:px-8"
    >
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute start-4 top-1/2 size-4 -translate-y-1/2 text-foreground/40" />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={t("catalog.searchPlaceholder")}
          aria-label={t("catalog.searchPlaceholder")}
          className="w-full rounded-full border border-input bg-card py-2.5 pe-4 ps-11 text-[15px] placeholder:text-foreground/40 focus:border-blue-600 focus:outline-none"
        />
      </div>
      <button
        type="submit"
        className="rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
      >
        {t("actions.search")}
      </button>
    </form>
  );
}
