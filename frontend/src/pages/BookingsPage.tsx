import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { paths } from "@/routes/paths";

export default function BookingsPage() {
  const { t } = useTranslation();

  return (
    <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-slate-200 bg-white/80 p-8 shadow-sm">
        <h1 className="text-3xl font-bold">{t("nav.bookings")}</h1>
        <p className="mt-3 text-muted-foreground">{t("bookings.description")}</p>
        <div className="mt-6">
          <Link
            to={paths.home}
            className="inline-flex rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            {t("actions.back")}
          </Link>
        </div>
      </div>
    </main>
  );
}
