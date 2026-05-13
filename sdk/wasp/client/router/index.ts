import { interpolatePath } from './linkHelpers'
import type {
  RouteDefinitionsToRoutes,
  OptionalRouteOptions,
  ParamValue,
  ExpandRouteOnOptionalStaticSegments,
} from './types'

// PUBLIC API
export const routes = {
  Root: {
    to: "/",
    build: (
      options?:
      OptionalRouteOptions
    ) => interpolatePath(
        
        "/",
        undefined,
        options?.search,
        options?.hash
      ),
  },
  Login: {
    to: "/login",
    build: (
      options?:
      OptionalRouteOptions
    ) => interpolatePath(
        
        "/login",
        undefined,
        options?.search,
        options?.hash
      ),
  },
  Register: {
    to: "/register",
    build: (
      options?:
      OptionalRouteOptions
    ) => interpolatePath(
        
        "/register",
        undefined,
        options?.search,
        options?.hash
      ),
  },
  EmailVerification: {
    to: "/email-verification",
    build: (
      options?:
      OptionalRouteOptions
    ) => interpolatePath(
        
        "/email-verification",
        undefined,
        options?.search,
        options?.hash
      ),
  },
  PasswordReset: {
    to: "/password-reset",
    build: (
      options?:
      OptionalRouteOptions
    ) => interpolatePath(
        
        "/password-reset",
        undefined,
        options?.search,
        options?.hash
      ),
  },
  OrgPapers: {
    to: "/org/papers",
    build: (
      options?:
      OptionalRouteOptions
    ) => interpolatePath(
        
        "/org/papers",
        undefined,
        options?.search,
        options?.hash
      ),
  },
  IndividualDashboard: {
    to: "/individual",
    build: (
      options?:
      OptionalRouteOptions
    ) => interpolatePath(
        
        "/individual",
        undefined,
        options?.search,
        options?.hash
      ),
  },
  IndividualPapers: {
    to: "/individual/papers",
    build: (
      options?:
      OptionalRouteOptions
    ) => interpolatePath(
        
        "/individual/papers",
        undefined,
        options?.search,
        options?.hash
      ),
  },
  IndividualAnalyticsRoute: {
    to: "/individual/analytics",
    build: (
      options?:
      OptionalRouteOptions
    ) => interpolatePath(
        
        "/individual/analytics",
        undefined,
        options?.search,
        options?.hash
      ),
  },
  IndividualNewSession: {
    to: "/individual/new",
    build: (
      options?:
      OptionalRouteOptions
    ) => interpolatePath(
        
        "/individual/new",
        undefined,
        options?.search,
        options?.hash
      ),
  },
  OrgDashboard: {
    to: "/org",
    build: (
      options?:
      OptionalRouteOptions
    ) => interpolatePath(
        
        "/org",
        undefined,
        options?.search,
        options?.hash
      ),
  },
  OrgStudents: {
    to: "/org/students",
    build: (
      options?:
      OptionalRouteOptions
    ) => interpolatePath(
        
        "/org/students",
        undefined,
        options?.search,
        options?.hash
      ),
  },
  OrgCampaigns: {
    to: "/org/campaigns",
    build: (
      options?:
      OptionalRouteOptions
    ) => interpolatePath(
        
        "/org/campaigns",
        undefined,
        options?.search,
        options?.hash
      ),
  },
  OrgNewCampaign: {
    to: "/org/campaigns/new",
    build: (
      options?:
      OptionalRouteOptions
    ) => interpolatePath(
        
        "/org/campaigns/new",
        undefined,
        options?.search,
        options?.hash
      ),
  },
  OrgBulkQR: {
    to: "/org/bulk-qr",
    build: (
      options?:
      OptionalRouteOptions
    ) => interpolatePath(
        
        "/org/bulk-qr",
        undefined,
        options?.search,
        options?.hash
      ),
  },
  OrgStudentPapers: {
    to: "/org/student/:studentId/papers",
    build: (
      options: OptionalRouteOptions
      & { params: {"studentId": ParamValue;}}
    ) => interpolatePath(
        
        "/org/student/:studentId/papers",
        options.params,
        options?.search,
        options?.hash
      ),
  },
  OrgAssessments: {
    to: "/org/assessments",
    build: (
      options?:
      OptionalRouteOptions
    ) => interpolatePath(
        
        "/org/assessments",
        undefined,
        options?.search,
        options?.hash
      ),
  },
  OrgAddAssessment: {
    to: "/org/assessments/add",
    build: (
      options?:
      OptionalRouteOptions
    ) => interpolatePath(
        
        "/org/assessments/add",
        undefined,
        options?.search,
        options?.hash
      ),
  },
  OrgStudentReport: {
    to: "/org/student/:studentId/report",
    build: (
      options: OptionalRouteOptions
      & { params: {"studentId": ParamValue;}}
    ) => interpolatePath(
        
        "/org/student/:studentId/report",
        options.params,
        options?.search,
        options?.hash
      ),
  },
  OrgSegregation: {
    to: "/org/segregation",
    build: (
      options?:
      OptionalRouteOptions
    ) => interpolatePath(
        
        "/org/segregation",
        undefined,
        options?.search,
        options?.hash
      ),
  },
  OrgSettings: {
    to: "/org/settings",
    build: (
      options?:
      OptionalRouteOptions
    ) => interpolatePath(
        
        "/org/settings",
        undefined,
        options?.search,
        options?.hash
      ),
  },
  PaperView: {
    to: "/paper/:token",
    build: (
      options: OptionalRouteOptions
      & { params: {"token": ParamValue;}}
    ) => interpolatePath(
        
        "/paper/:token",
        options.params,
        options?.search,
        options?.hash
      ),
  },
} as const;

// PRIVATE API
export type Routes = RouteDefinitionsToRoutes<typeof routes>

// PUBLIC API
export { Link } from './Link'
