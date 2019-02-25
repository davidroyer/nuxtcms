export const generateRoutes = (routesPath, routesData) => {
  return Object.keys(routesData).map(routeSlug => `/${routesPath}/${routeSlug}`)
}
