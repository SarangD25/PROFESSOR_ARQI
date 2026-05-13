import { getRouteObjects } from "wasp/client/app/router";
import { initializeQueryClient } from "wasp/client/operations";

import { createAuthRequiredPage } from "wasp/client/app"

import { RootComponent as RootComponent_ext } from './src/client/RootComponent'



const routesMapping = {
  Root: { lazy: async () => {
    const Component = await import('./src/client/pages/Home').then(m => m.Home)
    return { Component }
  }},
  Login: { lazy: async () => {
    const Component = await import('./src/client/pages/Login').then(m => m.Login)
    return { Component }
  }},
  Register: { lazy: async () => {
    const Component = await import('./src/client/pages/Register').then(m => m.Register)
    return { Component }
  }},
  EmailVerification: { lazy: async () => {
    const Component = await import('./src/client/pages/EmailVerification').then(m => m.EmailVerification)
    return { Component }
  }},
  PasswordReset: { lazy: async () => {
    const Component = await import('./src/client/pages/PasswordReset').then(m => m.PasswordReset)
    return { Component }
  }},
  OrgPapers: { lazy: async () => {
    const Component = await import('./src/client/pages/org/Papers').then(m => m.OrgPapers)
    return { Component: createAuthRequiredPage(Component) }
  }},
  IndividualDashboard: { lazy: async () => {
    const Component = await import('./src/client/pages/individual/Dashboard').then(m => m.IndividualDashboard)
    return { Component: createAuthRequiredPage(Component) }
  }},
  IndividualPapers: { lazy: async () => {
    const Component = await import('./src/client/pages/individual/Papers').then(m => m.IndividualPapers)
    return { Component: createAuthRequiredPage(Component) }
  }},
  IndividualAnalyticsRoute: { lazy: async () => {
    const Component = await import('./src/client/pages/individual/Analytics').then(m => m.IndividualAnalytics)
    return { Component: createAuthRequiredPage(Component) }
  }},
  IndividualNewSession: { lazy: async () => {
    const Component = await import('./src/client/pages/individual/NewSession').then(m => m.IndividualNewSession)
    return { Component: createAuthRequiredPage(Component) }
  }},
  OrgDashboard: { lazy: async () => {
    const Component = await import('./src/client/pages/org/Dashboard').then(m => m.OrgDashboard)
    return { Component: createAuthRequiredPage(Component) }
  }},
  OrgStudents: { lazy: async () => {
    const Component = await import('./src/client/pages/org/Students').then(m => m.OrgStudents)
    return { Component: createAuthRequiredPage(Component) }
  }},
  OrgCampaigns: { lazy: async () => {
    const Component = await import('./src/client/pages/org/Campaigns').then(m => m.OrgCampaigns)
    return { Component: createAuthRequiredPage(Component) }
  }},
  OrgNewCampaign: { lazy: async () => {
    const Component = await import('./src/client/pages/org/NewCampaign').then(m => m.OrgNewCampaign)
    return { Component: createAuthRequiredPage(Component) }
  }},
  OrgBulkQR: { lazy: async () => {
    const Component = await import('./src/client/pages/org/BulkQR').then(m => m.OrgBulkQR)
    return { Component: createAuthRequiredPage(Component) }
  }},
  OrgStudentPapers: { lazy: async () => {
    const Component = await import('./src/client/pages/org/StudentPapers').then(m => m.OrgStudentPapers)
    return { Component: createAuthRequiredPage(Component) }
  }},
  OrgAssessments: { lazy: async () => {
    const Component = await import('./src/client/pages/org/Assessments').then(m => m.OrgAssessments)
    return { Component: createAuthRequiredPage(Component) }
  }},
  OrgAddAssessment: { lazy: async () => {
    const Component = await import('./src/client/pages/org/AddAssessment').then(m => m.OrgAddAssessment)
    return { Component: createAuthRequiredPage(Component) }
  }},
  OrgStudentReport: { lazy: async () => {
    const Component = await import('./src/client/pages/org/StudentReport').then(m => m.OrgStudentReport)
    return { Component: createAuthRequiredPage(Component) }
  }},
  OrgSegregation: { lazy: async () => {
    const Component = await import('./src/client/pages/org/Segregation').then(m => m.OrgSegregation)
    return { Component: createAuthRequiredPage(Component) }
  }},
  OrgSettings: { lazy: async () => {
    const Component = await import('./src/client/pages/org/Settings').then(m => m.OrgSettings)
    return { Component: createAuthRequiredPage(Component) }
  }},
  PaperView: { lazy: async () => {
    const Component = await import('./src/client/pages/PaperView').then(m => m.PaperView)
    return { Component }
  }},
} as const;


initializeQueryClient()

const rootElement =
  <RootComponent_ext />

export const routeObjects = getRouteObjects({
  routesMapping,
  rootElement,
})
