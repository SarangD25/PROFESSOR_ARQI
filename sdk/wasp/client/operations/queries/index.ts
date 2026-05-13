import { type QueryFor, createQuery } from './core'
import { GetMe_ext } from 'wasp/server/operations/queries'
import { GetMyOrganization_ext } from 'wasp/server/operations/queries'
import { GetOrgStudents_ext } from 'wasp/server/operations/queries'
import { GetMyCampaigns_ext } from 'wasp/server/operations/queries'
import { GetCampaigns_ext } from 'wasp/server/operations/queries'
import { GetPaper_ext } from 'wasp/server/operations/queries'
import { GetStudentWeakAreas_ext } from 'wasp/server/operations/queries'
import { GetStudentPapers_ext } from 'wasp/server/operations/queries'
import { GetOrgStudentPapers_ext } from 'wasp/server/operations/queries'
import { GetOrgAssessments_ext } from 'wasp/server/operations/queries'
import { GetOrgAllPapers_ext } from 'wasp/server/operations/queries'
import { GetStudentReport_ext } from 'wasp/server/operations/queries'
import { GetStudentSegregation_ext } from 'wasp/server/operations/queries'
import { GetOrgConfig_ext } from 'wasp/server/operations/queries'

// PUBLIC API
export const getMe: QueryFor<GetMe_ext> = createQuery<GetMe_ext>(
  'operations/get-me',
  ['User'],
)

// PUBLIC API
export const getMyOrganization: QueryFor<GetMyOrganization_ext> = createQuery<GetMyOrganization_ext>(
  'operations/get-my-organization',
  ['Organization', 'OrgStudent', 'Campaign'],
)

// PUBLIC API
export const getOrgStudents: QueryFor<GetOrgStudents_ext> = createQuery<GetOrgStudents_ext>(
  'operations/get-org-students',
  ['OrgStudent', 'Organization'],
)

// PUBLIC API
export const getMyCampaigns: QueryFor<GetMyCampaigns_ext> = createQuery<GetMyCampaigns_ext>(
  'operations/get-my-campaigns',
  ['Campaign', 'QRPaper'],
)

// PUBLIC API
export const getCampaigns: QueryFor<GetCampaigns_ext> = createQuery<GetCampaigns_ext>(
  'operations/get-campaigns',
  ['Campaign'],
)

// PUBLIC API
export const getPaper: QueryFor<GetPaper_ext> = createQuery<GetPaper_ext>(
  'operations/get-paper',
  ['QRPaper', 'QuestionSet', 'Campaign', 'WeakArea', 'PyqChunk', 'GeneratedQuestionPool'],
)

// PUBLIC API
export const getStudentWeakAreas: QueryFor<GetStudentWeakAreas_ext> = createQuery<GetStudentWeakAreas_ext>(
  'operations/get-student-weak-areas',
  ['WeakArea'],
)

// PUBLIC API
export const getStudentPapers: QueryFor<GetStudentPapers_ext> = createQuery<GetStudentPapers_ext>(
  'operations/get-student-papers',
  ['QRPaper', 'QuestionSet', 'Attempt', 'Campaign'],
)

// PUBLIC API
export const getOrgStudentPapers: QueryFor<GetOrgStudentPapers_ext> = createQuery<GetOrgStudentPapers_ext>(
  'operations/get-org-student-papers',
  ['QRPaper', 'QuestionSet', 'Attempt', 'Campaign', 'OrgStudent'],
)

// PUBLIC API
export const getOrgAssessments: QueryFor<GetOrgAssessments_ext> = createQuery<GetOrgAssessments_ext>(
  'operations/get-org-assessments',
  ['Assessment', 'OrgStudent'],
)

// PUBLIC API
export const getOrgAllPapers: QueryFor<GetOrgAllPapers_ext> = createQuery<GetOrgAllPapers_ext>(
  'operations/get-org-all-papers',
  ['QRPaper', 'QuestionSet', 'Attempt', 'Campaign', 'Organization'],
)

// PUBLIC API
export const getStudentReport: QueryFor<GetStudentReport_ext> = createQuery<GetStudentReport_ext>(
  'operations/get-student-report',
  ['Assessment', 'OrgStudent', 'QRPaper', 'QuestionSet', 'Attempt', 'Campaign', 'OrgConfig'],
)

// PUBLIC API
export const getStudentSegregation: QueryFor<GetStudentSegregation_ext> = createQuery<GetStudentSegregation_ext>(
  'operations/get-student-segregation',
  ['Assessment', 'OrgStudent', 'QRPaper', 'QuestionSet', 'Attempt', 'Campaign', 'OrgConfig'],
)

// PUBLIC API
export const getOrgConfig: QueryFor<GetOrgConfig_ext> = createQuery<GetOrgConfig_ext>(
  'operations/get-org-config',
  ['OrgConfig', 'Organization'],
)

// PRIVATE API (used in SDK)
export { buildAndRegisterQuery } from './core'
