async function parseBody<T>(res: Response): Promise<T> {
  const text = await res.text();
  if (!text) return {} as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    return {} as T;
  }
}

export async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  if (init?.body && !(init.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const res = await fetch(url, { credentials: "include", ...init, headers });
  const data = await parseBody<{ error?: string } & T>(res);
  if (!res.ok) {
    throw new Error(data.error || `Error ${res.status}`);
  }
  return data as T;
}

export async function apiBlob(url: string, init?: RequestInit): Promise<Blob> {
  const res = await fetch(url, { credentials: "include", ...init });
  if (!res.ok) {
    const data = await parseBody<{ error?: string }>(res);
    throw new Error(data.error || `Error ${res.status}`);
  }
  return res.blob();
}
