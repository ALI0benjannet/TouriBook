import { Link } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ForbiddenPage() {
  return (
    <div className="flex min-h-[60dvh] flex-col items-center justify-center gap-4 px-4 text-center">
      <ShieldAlert className="size-12 text-destructive" />
      <h1 className="text-2xl font-semibold">403 — Accès refusé</h1>
      <p className="max-w-sm text-muted-foreground">
        Vous n'avez pas les autorisations nécessaires pour consulter cette page.
      </p>
       <Button>
        <Link to="/">Retour à l'accueil</Link>
      </Button>
    </div>
  );
}