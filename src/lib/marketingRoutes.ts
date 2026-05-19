const lightMarketingRoutes = [
  "/",
  "/about",
  "/book",
  "/brite-homes",
  "/builder-data-platform",
  "/contact",
  "/examples",
  "/privacy",
  "/services",
];

export function normalizePathname(pathname: string) {
  const [path] = pathname.split("?");
  const normalized = path.replace(/\/+$/, "");
  return normalized || "/";
}

export function isDemoRoute(pathname: string) {
  const normalized = normalizePathname(pathname);
  return normalized === "/demo" || normalized.startsWith("/demo/");
}

export function isLightMarketingRoute(pathname: string) {
  const normalized = normalizePathname(pathname);

  return lightMarketingRoutes.some((route) => {
    if (route === "/") return normalized === "/";
    return normalized === route || normalized.startsWith(`${route}/`);
  });
}
