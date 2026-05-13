import { createBrowserRouter, RouterProvider } from 'react-router';
import { DefaultRootErrorBoundary } from './components/DefaultRootErrorBoundary';
import { routes } from '../router/index';
export function getRouteObjects({ routesMapping, rootElement, }) {
    const waspDefinedRoutes = [];
    const userDefinedRoutes = Object.entries(routes).map(([routeKey, route]) => {
        return {
            path: route.to,
            ...routesMapping[routeKey],
        };
    });
    return [{
            path: '/',
            element: rootElement,
            ErrorBoundary: DefaultRootErrorBoundary,
            children: [
                ...waspDefinedRoutes,
                ...userDefinedRoutes,
            ],
        }];
}
export function getRouter({ routesMapping, rootElement, }) {
    const routeObjects = getRouteObjects({ routesMapping, rootElement });
    const browserRouter = createBrowserRouter(routeObjects, {
        basename: '/',
    });
    return <RouterProvider router={browserRouter}/>;
}
//# sourceMappingURL=router.jsx.map