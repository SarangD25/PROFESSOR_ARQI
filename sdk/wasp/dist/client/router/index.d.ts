import type { RouteDefinitionsToRoutes, OptionalRouteOptions, ParamValue } from './types';
export declare const routes: {
    readonly Root: {
        readonly to: "/";
        readonly build: (options?: OptionalRouteOptions) => string;
    };
    readonly Login: {
        readonly to: "/login";
        readonly build: (options?: OptionalRouteOptions) => string;
    };
    readonly Register: {
        readonly to: "/register";
        readonly build: (options?: OptionalRouteOptions) => string;
    };
    readonly EmailVerification: {
        readonly to: "/email-verification";
        readonly build: (options?: OptionalRouteOptions) => string;
    };
    readonly PasswordReset: {
        readonly to: "/password-reset";
        readonly build: (options?: OptionalRouteOptions) => string;
    };
    readonly OrgPapers: {
        readonly to: "/org/papers";
        readonly build: (options?: OptionalRouteOptions) => string;
    };
    readonly IndividualDashboard: {
        readonly to: "/individual";
        readonly build: (options?: OptionalRouteOptions) => string;
    };
    readonly IndividualPapers: {
        readonly to: "/individual/papers";
        readonly build: (options?: OptionalRouteOptions) => string;
    };
    readonly IndividualAnalyticsRoute: {
        readonly to: "/individual/analytics";
        readonly build: (options?: OptionalRouteOptions) => string;
    };
    readonly IndividualNewSession: {
        readonly to: "/individual/new";
        readonly build: (options?: OptionalRouteOptions) => string;
    };
    readonly OrgDashboard: {
        readonly to: "/org";
        readonly build: (options?: OptionalRouteOptions) => string;
    };
    readonly OrgStudents: {
        readonly to: "/org/students";
        readonly build: (options?: OptionalRouteOptions) => string;
    };
    readonly OrgCampaigns: {
        readonly to: "/org/campaigns";
        readonly build: (options?: OptionalRouteOptions) => string;
    };
    readonly OrgNewCampaign: {
        readonly to: "/org/campaigns/new";
        readonly build: (options?: OptionalRouteOptions) => string;
    };
    readonly OrgBulkQR: {
        readonly to: "/org/bulk-qr";
        readonly build: (options?: OptionalRouteOptions) => string;
    };
    readonly OrgStudentPapers: {
        readonly to: "/org/student/:studentId/papers";
        readonly build: (options: OptionalRouteOptions & {
            params: {
                "studentId": ParamValue;
            };
        }) => string;
    };
    readonly OrgAssessments: {
        readonly to: "/org/assessments";
        readonly build: (options?: OptionalRouteOptions) => string;
    };
    readonly OrgAddAssessment: {
        readonly to: "/org/assessments/add";
        readonly build: (options?: OptionalRouteOptions) => string;
    };
    readonly OrgStudentReport: {
        readonly to: "/org/student/:studentId/report";
        readonly build: (options: OptionalRouteOptions & {
            params: {
                "studentId": ParamValue;
            };
        }) => string;
    };
    readonly OrgSegregation: {
        readonly to: "/org/segregation";
        readonly build: (options?: OptionalRouteOptions) => string;
    };
    readonly OrgSettings: {
        readonly to: "/org/settings";
        readonly build: (options?: OptionalRouteOptions) => string;
    };
    readonly PaperView: {
        readonly to: "/paper/:token";
        readonly build: (options: OptionalRouteOptions & {
            params: {
                "token": ParamValue;
            };
        }) => string;
    };
};
export type Routes = RouteDefinitionsToRoutes<typeof routes>;
export { Link } from './Link';
//# sourceMappingURL=index.d.ts.map