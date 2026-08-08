import { useTranslation } from "react-i18next";

export function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3 lg:px-8">
        <div>
          <p className="font-semibold">{t("app.name")}</p>
          <p className="mt-2 text-sm text-muted-foreground">{t("app.tagline")}</p>
        </div>
        {/* colonnes de liens… */}
      </div>
      <div className="border-t py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {t("app.name")}
      </div>
    </footer>
  );
}