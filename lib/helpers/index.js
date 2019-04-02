export const generateRoutes = (contentType, contentData) => {
  const contentRoutes = Object.keys(contentData)
  return contentRoutes.map(routeSlug => `/${contentType}/${routeSlug}`)
}
