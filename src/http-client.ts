import { HttpError } from "react-admin";

export const apiUrl = `${import.meta.env.VITE_BACKEND_URL ?? ""}/api`;

export type JsonResponse<T = unknown> = {
  status: number;
  headers: Headers;
  json: T;
};

const csrfToken = () => {
  const value = document.cookie.match(/(?:^|; )XSRF-TOKEN=([^;]+)/)?.[1];
  return value ? decodeURIComponent(value) : undefined;
};

const parseBody = async (response: Response) => {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

const errorFromResponse = async (response: Response) => {
  const body = await parseBody(response);
  const message =
    (typeof body === "object" && body !== null &&
      (body.detail || body.message || body.title)) ||
    response.statusText ||
    `HTTP ${response.status}`;
  return new HttpError(message, response.status, body);
};

const headersFor = (options: RequestInit) => {
  const headers = new Headers(options.headers);
  if (!headers.has("Accept")) headers.set("Accept", "application/json");
  if (options.body && !(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const csrf = csrfToken();
  if (csrf) headers.set("X-XSRF-TOKEN", csrf);
  return headers;
};

const rawRequest = (url: string, options: RequestInit = {}) =>
  fetch(url, {
    ...options,
    credentials: "include",
    headers: headersFor(options),
  });

export const initializeCsrf = async () => {
  const response = await rawRequest(`${apiUrl}/csrf`);
  if (!response.ok) throw await errorFromResponse(response);
};

let pendingRefresh: Promise<void> | undefined;

const refreshSession = () => {
  if (!pendingRefresh) {
    pendingRefresh = (async () => {
      if (!csrfToken()) await initializeCsrf();
      const response = await rawRequest(`${apiUrl}/refresh`, { method: "POST" });
      if (!response.ok) throw await errorFromResponse(response);
    })().finally(() => {
      pendingRefresh = undefined;
    });
  }
  return pendingRefresh;
};

export async function httpRequest<T = unknown>(
  url: string,
  options: RequestInit = {},
  refreshOnUnauthorized = true,
): Promise<JsonResponse<T>> {
  if (options.method && options.method !== "GET" && options.method !== "HEAD" && !csrfToken()) {
    await initializeCsrf();
  }

  let response = await rawRequest(url, options);
  if (response.status === 401 && refreshOnUnauthorized) {
    await refreshSession();
    response = await rawRequest(url, options);
  }
  if (!response.ok) throw await errorFromResponse(response);

  return {
    status: response.status,
    headers: response.headers,
    json: (await parseBody(response)) as T,
  };
}
