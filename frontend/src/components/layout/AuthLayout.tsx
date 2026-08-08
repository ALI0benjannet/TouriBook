import { Link, Outlet } from "react-router-dom";
import { MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";

export function AuthLayout() {
  const { t } = useTranslation();

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-md flex-col justify-center px-4 py-12">
      <div className="mb-8 flex flex-col items-center gap-2 text-center">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <MapPin className="size-6 text-primary" />
          <span className="text-xl">{t("app.name")}</span>
        </Link>
        <p className="text-sm text-muted-foreground">{t("app.tagline")}</p>
      </div>

      <div className="rounded-lg border bg-card p-6 shadow-sm sm:p-8">
        <Outlet />
      </div>
    </div>
  );
}