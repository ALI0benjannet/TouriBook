import { DataTable, type Column } from "@/components/admin/DataTable";
import { useAdminActivities } from "@/features/admin/hook/use-admin";
import type { AdminActivityRow } from "@/features/admin/types/admin.types";
import { formatCurrency } from "@/lib/format";

const columns: Column<AdminActivityRow>[] = [
  { key: "titre", header: "Titre", render: (a) => a.titre },
  { key: "category", header: "Catégorie", render: (a) => a.category ?? "—" },
  { key: "localisation", header: "Lieu", render: (a) => a.localisation },
  { key: "duree", header: "Durée", render: (a) => `${a.duree} min` },
  { key: "bookings", header: "Réservations", render: (a) => a.bookings_count },
  { key: "prix", header: "Prix", align: "end", render: (a) => formatCurrency(a.prix) },
];

export default function AdminActivitiesPage() {
  const { data, isLoading } = useAdminActivities({ page: 1, size: 50 });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Activités</h1>

      <div className="rounded-lg border bg-card">
        <DataTable
          columns={columns}
          rows={data?.items}
          isLoading={isLoading}
          getRowId={(a) => a.id}
          emptyLabel="Aucune activité."
        />
      </div>
    </div>
  );
}