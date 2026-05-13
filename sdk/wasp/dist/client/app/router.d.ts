import type { ReactNode, ComponentType } from 'react';
import { type RouteObject } from 'react-router';
type RouteMapping = Record<string, {
    lazy: () => Promise<{
        Component: ComponentType;
    }>;
} | {
    Component: ComponentType;
}>;
export declare function getRouteObjects({ routesMapping, rootElement, }: {
    routesMapping: RouteMapping;
    rootElement: ReactNode;
}): RouteObject[];
export declare function getRouter({ routesMapping, rootElement, }: {
    routesMapping: RouteMapping;
    rootElement: ReactNode;
}): import("react").JSX.Element;
export {};
//# sourceMappingURL=router.d.ts.map