import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { paths } from "@/routes/paths";

export default function HomePage() {
  const { t } = useTranslation();
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold sm:text-4xl">{t("app.name")}</h1>
      <p className="mt-3 text-muted-foreground">{t("app.tagline")}</p>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {[
          { to: paths.activities, label: t("nav.activities"), description: t("activities.description") },
          { to: paths.favorites, label: t("nav.favorites"), description: t("favorites.description") },
          { to: paths.bookings, label: t("nav.bookings"), description: t("bookings.description") },
        ].map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="rounded-3xl border border-slate-200 bg-white/80 p-6 text-left shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
          >
            <h2 className="text-xl font-semibold">{item.label}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}