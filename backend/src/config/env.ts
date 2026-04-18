const parseList = (value: string | undefined): string[] => {
  if (!value) {
    return [];
  }

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

export const getAllowedOrigins = (): string[] => {
  const isProduction = (process.env.NODE_ENV ?? "development") === "production";

  if (!isProduction) {
    return ["*"];
  }

  const configured = parseList(process.env.CORS_ORIGIN);

  if (configured.length === 0) {
    return [];
  }

  return configured;
};

export const isOriginAllowed = (
  origin: string | undefined,
  allowedOrigins: string[],
): boolean => {
  if (!origin) {
    return true;
  }

  if (allowedOrigins.includes("*")) {
    return true;
  }

  return allowedOrigins.includes(origin);
};
