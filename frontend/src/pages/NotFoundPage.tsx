import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-6xl font-bold text-primary">404</p>
      <p className="text-muted-foreground">Cette page n'existe pas.</p>
      <Button>
        <Link to="/">Retour à l'accueil</Link>
      </Button>
    </div>
  );
}