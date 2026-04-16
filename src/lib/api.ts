const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ?? "";

function normalizePath(path: string) {
  return path.startsWith("/") ? path : `/${path}`;
}

function toApiPath(pathOrUrl: string) {
  if (/^https?:\/\//i.test(pathOrUrl)) {
    const url = new URL(pathOrUrl);
    return `${url.pathname}${url.search}`;
  }

  return normalizePath(pathOrUrl);
}

export function apiUrl(path: string) {
  const normalizedPath = normalizePath(path);
  return apiBaseUrl ? `${apiBaseUrl}${normalizedPath}` : normalizedPath;
}

export function assetUrl(path?: string | null) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  if (apiBaseUrl && path.startsWith("/")) {
    return `${apiBaseUrl}${path}`;
  }
  return path;
}

export async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(apiUrl(path), {
    cache: "no-store",
    ...init,
    headers: {
      Accept: "application/json",
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Request failed with status ${response.status}`);
  }

  if (response.status === 204) {
    return null as T;
  }

  return response.json() as Promise<T>;
}

type PaginatedResponse<T> = {
  count?: number;
  next?: string | null;
  previous?: string | null;
  results?: T[];
};

export async function fetchListJson<T>(path: string, init?: RequestInit): Promise<T[]> {
  const allResults: T[] = [];
  let nextUrl: string | null | undefined = path;
  
  while (nextUrl) {
    const fetchUrl = apiUrl(toApiPath(nextUrl));
    
    const response = await fetch(fetchUrl, {
      cache: "no-store",
      ...init,
      headers: {
        Accept: "application/json",
        ...(init?.headers ?? {}),
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `Request failed with status ${response.status}`);
    }

    const data = (await response.json()) as unknown;

    // Handle plain array response
    if (Array.isArray(data)) {
      allResults.push(...data);
      break;
    }

    // Handle paginated response
    if (data && typeof data === "object" && "results" in data) {
      const paginatedData = data as PaginatedResponse<T>;
      if (Array.isArray(paginatedData.results)) {
        allResults.push(...paginatedData.results);
      }
      // Move to next page if available
      nextUrl = paginatedData.next ?? null;
    } else {
      break;
    }
  }

  return allResults;
}
export async function postJson<T>(path: string, body: Record<string, unknown>) {
  return fetchJson<T>(path, {
    method: "POST",
    body: JSON.stringify(body),
  });
}
