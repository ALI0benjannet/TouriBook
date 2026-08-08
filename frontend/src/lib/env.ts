import { z } from "zod";

const schema = z.object({
  VITE_API_URL: z.string().min(1),
  VITE_APP_NAME: z.string().default("TouriBook"),
});

const parsed = schema.safeParse(import.meta.env);
if (!parsed.success) {
  console.error(parsed.error.flatten().fieldErrors);
  throw new Error("❌ Variables d'environnement invalides");
}

export const env = parsed.data;