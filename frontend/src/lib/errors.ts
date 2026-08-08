import axios from "axios";

export type ApiError = {
  status: number;
  code: string;
  message: string;
  fields?: Record<string, string>;
};

/** Transforme n'importe quelle erreur (FastAPI, réseau, timeout) en ApiError. */
export function toApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return { status: 0, code: "NETWORK", message: "errors.network" };
    }
    const { status, data } = error.response;

    // Erreurs de validation Pydantic 422
    if (status === 422 && Array.isArray(data?.detail)) {
      const fields: Record<string, string> = {};
      for (const d of data.detail) {
        const key = d.loc?.filter((l: unknown) => l !== "body").join(".");
        if (key) fields[key] = d.msg;
      }
      return { status, code: "VALIDATION", message: "errors.validation", fields };
    }

    const detail = typeof data?.detail === "string" ? data.detail : undefined;
    return {
      status,
      code: data?.code ?? `HTTP_${status}`,
      message: detail ?? data?.message ?? `errors.http.${status}`,
    };
  }
  return { status: -1, code: "UNKNOWN", message: "errors.unknown" };
}