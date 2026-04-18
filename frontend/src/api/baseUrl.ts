const getDefaultApiBaseUrl = (): string => {
  if (typeof window === "undefined") {
    return "http://localhost:3000";
  }

  const protocol = window.location.protocol === "https:" ? "https:" : "http:";
  const hostname = window.location.hostname || "localhost";

  return `${protocol}//${hostname}:3000`;
};

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ||
  getDefaultApiBaseUrl();

export const resolveApiUrl = (path: string): string => {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  return `${API_BASE_URL}${path}`;
};
