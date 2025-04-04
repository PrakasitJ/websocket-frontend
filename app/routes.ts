import { index, layout, route, type RouteConfig, type RouteConfigEntry } from "@react-router/dev/routes";
import { flatRoutes } from "@react-router/fs-routes";

const mergeRouteConfigs = (autoRoutes: RouteConfigEntry[], manualRoutes: RouteConfigEntry[]): RouteConfigEntry[] => {
  const manualRouteMap = new Map(
    manualRoutes.map(r => [r.path || r.file, r])
  );

  const mergedRoutes = [...autoRoutes];

  manualRoutes.forEach(manualRoute => {
    const existingIndex = mergedRoutes.findIndex(r => 
      (r.path || r.file) === (manualRoute.path || manualRoute.file)
    );

    if (existingIndex !== -1) {
      mergedRoutes[existingIndex] = manualRoute;
    } else {
      mergedRoutes.push(manualRoute);
    }
  });

  return mergedRoutes;
};

const createHybridRouter = async (
  defineManualRoutes: () => RouteConfigEntry[]
): Promise<RouteConfig> => {
  const automaticRoutes = await flatRoutes();
  
  const manualRoutes = defineManualRoutes();
  
  return mergeRouteConfigs(automaticRoutes, manualRoutes);
};

export default createHybridRouter(() => [
    
]) satisfies Promise<RouteConfig>;