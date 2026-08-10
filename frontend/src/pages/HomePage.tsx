import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ArrowRight, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { paths } from "@/routes/paths";

export default function HomePage() {
  const { t } = useTranslation();
  const { user } = useAuth();

  return (
    <main className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(50rem_30rem_at_50%_-5%,rgba(59,130,246,.15),transparent)]"
      />
      <section className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background/60 px-3 py-1 text-xs font-medium text-muted-foreground">
          <Compass className="size-3.5" />
          {t("app.tagline")}
        </span>

        <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl">
          {t("home.welcome", "Bienvenue")}
          {user?.full_name ? `, ${user.full_name.split(" ")[0]}` : ""} 👋
        </h1>

        <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
          {t("home.subtitle", "Découvrez et réservez les meilleures activités touristiques.")}
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg">
            <Link to={paths.activities}>
              {t("home.explore", "Explorer les activités")}
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to={paths.profile}>{t("nav.profile", "Mon profil")}</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}