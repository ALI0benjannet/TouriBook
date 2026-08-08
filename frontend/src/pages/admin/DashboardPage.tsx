export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Tableau de bord</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {["Réservations", "Chiffre d'affaires", "Clients", "Activités"].map((label) => (
          <div key={label} className="rounded-lg border bg-card p-4">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-1 text-2xl font-semibold">—</p>
          </div>
        ))}
      </div>
      <p className="text-sm text-muted-foreground">
        Statistiques réelles branchées en Phase 11.
      </p>
    </div>
  );
}