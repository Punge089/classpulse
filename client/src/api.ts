export interface FieldError {
  field: string;
  message: string;
}

type ErrorBody = { error?: { code?: string; message?: string; details?: FieldError[] } };

export class ApiClientError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly details?: FieldError[]
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (typeof init.body === "string" && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const route = path === "/api" || path.startsWith("/api/")
    ? path
    : "/api/" + path.replace(/^\/+/, "");
  const response = await fetch(route, { ...init, headers, credentials: "include" });
  if (!response.ok) {
    const body = await response.json().catch(() => null) as ErrorBody | null;
    const error = body?.error;
    throw new ApiClientError(
      response.status, error?.code ?? "HTTP_ERROR",
      error?.message ?? "The server could not complete the request", error?.details
    );
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
