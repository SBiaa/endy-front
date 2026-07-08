export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function fetchApi(path: string, options: RequestInit = {}) {
  const headers: HeadersInit = { ...options.headers };
  if (options.body) {
    (headers as Record<string, string>)["Content-Type"] = "application/json";
  }

  const res = await fetch(`/api${path}`, {
    ...options,
    credentials: "include",
    headers,
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new ApiError(data.erro ?? "Erro na requisição", res.status);
  }

  if (res.status === 204) {
    return null;
  }

  return res.json();
}
