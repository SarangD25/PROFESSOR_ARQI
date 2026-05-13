import { interpolatePath } from './linkHelpers';
// PUBLIC API
export const routes = {
    Root: {
        to: "/",
        build: (options) => interpolatePath("/", undefined, options?.search, options?.hash),
    },
    Login: {
        to: "/login",
        build: (options) => interpolatePath("/login", undefined, options?.search, options?.hash),
    },
    Register: {
        to: "/register",
        build: (options) => interpolatePath("/register", undefined, options?.search, options?.hash),
    },
    EmailVerification: {
        to: "/email-verification",
        build: (options) => interpolatePath("/email-verification", undefined, options?.search, options?.hash),
    },
    PasswordReset: {
        to: "/password-reset",
        build: (options) => interpolatePath("/password-reset", undefined, options?.search, options?.hash),
    },
    OrgPapers: {
        to: "/org/papers",
        build: (options) => interpolatePath("/org/papers", undefined, options?.search, options?.hash),
    },
    IndividualDashboard: {
        to: "/individual",
        build: (options) => interpolatePath("/individual", undefined, options?.search, options?.hash),
    },
    IndividualPapers: {
        to: "/individual/papers",
        build: (options) => interpolatePath("/individual/papers", undefined, options?.search, options?.hash),
    },
    IndividualAnalyticsRoute: {
        to: "/individual/analytics",
        build: (options) => interpolatePath("/individual/analytics", undefined, options?.search, options?.hash),
    },
    IndividualNewSession: {
        to: "/individual/new",
        build: (options) => interpolatePath("/individual/new", undefined, options?.search, options?.hash),
    },
    OrgDashboard: {
        to: "/org",
        build: (options) => interpolatePath("/org", undefined, options?.search, options?.hash),
    },
    OrgStudents: {
        to: "/org/students",
        build: (options) => interpolatePath("/org/students", undefined, options?.search, options?.hash),
    },
    OrgCampaigns: {
        to: "/org/campaigns",
        build: (options) => interpolatePath("/org/campaigns", undefined, options?.search, options?.hash),
    },
    OrgNewCampaign: {
        to: "/org/campaigns/new",
        build: (options) => interpolatePath("/org/campaigns/new", undefined, options?.search, options?.hash),
    },
    OrgBulkQR: {
        to: "/org/bulk-qr",
        build: (options) => interpolatePath("/org/bulk-qr", undefined, options?.search, options?.hash),
    },
    OrgStudentPapers: {
        to: "/org/student/:studentId/papers",
        build: (options) => interpolatePath("/org/student/:studentId/papers", options.params, options?.search, options?.hash),
    },
    OrgAssessments: {
        to: "/org/assessments",
        build: (options) => interpolatePath("/org/assessments", undefined, options?.search, options?.hash),
    },
    OrgAddAssessment: {
        to: "/org/assessments/add",
        build: (options) => interpolatePath("/org/assessments/add", undefined, options?.search, options?.hash),
    },
    OrgStudentReport: {
        to: "/org/student/:studentId/report",
        build: (options) => interpolatePath("/org/student/:studentId/report", options.params, options?.search, options?.hash),
    },
    OrgSegregation: {
        to: "/org/segregation",
        build: (options) => interpolatePath("/org/segregation", undefined, options?.search, options?.hash),
    },
    OrgSettings: {
        to: "/org/settings",
        build: (options) => interpolatePath("/org/settings", undefined, options?.search, options?.hash),
    },
    PaperView: {
        to: "/paper/:token",
        build: (options) => interpolatePath("/paper/:token", options.params, options?.search, options?.hash),
    },
};
// PUBLIC API
export { Link } from './Link';
//# sourceMappingURL=index.js.map