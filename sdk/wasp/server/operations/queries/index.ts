
import { prisma } from 'wasp/server'
import {
  type UnauthenticatedOperationFor,
  createUnauthenticatedOperation,
  type AuthenticatedOperationFor,
  createAuthenticatedOperation,
} from '../wrappers.js'
import { getMe as getMe_ext } from 'wasp/src/server/queries/getMe'
import { getMyOrganization as getMyOrganization_ext } from 'wasp/src/server/queries/getMyOrganization'
import { getOrgStudents as getOrgStudents_ext } from 'wasp/src/server/queries/getOrgStudents'
import { getMyCampaigns as getMyCampaigns_ext } from 'wasp/src/server/queries/getMyCampaigns'
import { getCampaigns as getCampaigns_ext } from 'wasp/src/server/queries/getCampaigns'
import { getPaper as getPaper_ext } from 'wasp/src/server/queries/getPaper'
import { getStudentWeakAreas as getStudentWeakAreas_ext } from 'wasp/src/server/queries/getStudentWeakAreas'
import { getStudentPapers as getStudentPapers_ext } from 'wasp/src/server/queries/getStudentPapers'
import { getOrgStudentPapers as getOrgStudentPapers_ext } from 'wasp/src/server/queries/getOrgStudentPapers'
import { getOrgAssessments as getOrgAssessments_ext } from 'wasp/src/server/queries/getOrgAssessments'
import { getOrgAllPapers as getOrgAllPapers_ext } from 'wasp/src/server/queries/getOrgAllPapers'
import { getStudentReport as getStudentReport_ext } from 'wasp/src/server/queries/getStudentReport'
import { getStudentSegregation as getStudentSegregation_ext } from 'wasp/src/server/queries/getStudentSegregation'
import { getOrgConfig as getOrgConfig_ext } from 'wasp/src/server/queries/getOrgConfig'

// PRIVATE API
export type GetMe_ext = typeof getMe_ext

// PUBLIC API
export const getMe: AuthenticatedOperationFor<GetMe_ext> =
  createAuthenticatedOperation(
    getMe_ext,
    {
      User: prisma.user,
    },
  )


// PRIVATE API
export type GetMyOrganization_ext = typeof getMyOrganization_ext

// PUBLIC API
export const getMyOrganization: AuthenticatedOperationFor<GetMyOrganization_ext> =
  createAuthenticatedOperation(
    getMyOrganization_ext,
    {
      Organization: prisma.organization,
      OrgStudent: prisma.orgStudent,
      Campaign: prisma.campaign,
    },
  )


// PRIVATE API
export type GetOrgStudents_ext = typeof getOrgStudents_ext

// PUBLIC API
export const getOrgStudents: AuthenticatedOperationFor<GetOrgStudents_ext> =
  createAuthenticatedOperation(
    getOrgStudents_ext,
    {
      OrgStudent: prisma.orgStudent,
      Organization: prisma.organization,
    },
  )


// PRIVATE API
export type GetMyCampaigns_ext = typeof getMyCampaigns_ext

// PUBLIC API
export const getMyCampaigns: AuthenticatedOperationFor<GetMyCampaigns_ext> =
  createAuthenticatedOperation(
    getMyCampaigns_ext,
    {
      Campaign: prisma.campaign,
      QRPaper: prisma.qRPaper,
    },
  )


// PRIVATE API
export type GetCampaigns_ext = typeof getCampaigns_ext

// PUBLIC API
export const getCampaigns: AuthenticatedOperationFor<GetCampaigns_ext> =
  createAuthenticatedOperation(
    getCampaigns_ext,
    {
      Campaign: prisma.campaign,
    },
  )


// PRIVATE API
export type GetPaper_ext = typeof getPaper_ext

// PUBLIC API
export const getPaper: AuthenticatedOperationFor<GetPaper_ext> =
  createAuthenticatedOperation(
    getPaper_ext,
    {
      QRPaper: prisma.qRPaper,
      QuestionSet: prisma.questionSet,
      Campaign: prisma.campaign,
      WeakArea: prisma.weakArea,
      PyqChunk: prisma.pyqChunk,
      GeneratedQuestionPool: prisma.generatedQuestionPool,
    },
  )


// PRIVATE API
export type GetStudentWeakAreas_ext = typeof getStudentWeakAreas_ext

// PUBLIC API
export const getStudentWeakAreas: AuthenticatedOperationFor<GetStudentWeakAreas_ext> =
  createAuthenticatedOperation(
    getStudentWeakAreas_ext,
    {
      WeakArea: prisma.weakArea,
    },
  )


// PRIVATE API
export type GetStudentPapers_ext = typeof getStudentPapers_ext

// PUBLIC API
export const getStudentPapers: AuthenticatedOperationFor<GetStudentPapers_ext> =
  createAuthenticatedOperation(
    getStudentPapers_ext,
    {
      QRPaper: prisma.qRPaper,
      QuestionSet: prisma.questionSet,
      Attempt: prisma.attempt,
      Campaign: prisma.campaign,
    },
  )


// PRIVATE API
export type GetOrgStudentPapers_ext = typeof getOrgStudentPapers_ext

// PUBLIC API
export const getOrgStudentPapers: AuthenticatedOperationFor<GetOrgStudentPapers_ext> =
  createAuthenticatedOperation(
    getOrgStudentPapers_ext,
    {
      QRPaper: prisma.qRPaper,
      QuestionSet: prisma.questionSet,
      Attempt: prisma.attempt,
      Campaign: prisma.campaign,
      OrgStudent: prisma.orgStudent,
    },
  )


// PRIVATE API
export type GetOrgAssessments_ext = typeof getOrgAssessments_ext

// PUBLIC API
export const getOrgAssessments: AuthenticatedOperationFor<GetOrgAssessments_ext> =
  createAuthenticatedOperation(
    getOrgAssessments_ext,
    {
      Assessment: prisma.assessment,
      OrgStudent: prisma.orgStudent,
    },
  )


// PRIVATE API
export type GetOrgAllPapers_ext = typeof getOrgAllPapers_ext

// PUBLIC API
export const getOrgAllPapers: AuthenticatedOperationFor<GetOrgAllPapers_ext> =
  createAuthenticatedOperation(
    getOrgAllPapers_ext,
    {
      QRPaper: prisma.qRPaper,
      QuestionSet: prisma.questionSet,
      Attempt: prisma.attempt,
      Campaign: prisma.campaign,
      Organization: prisma.organization,
    },
  )


// PRIVATE API
export type GetStudentReport_ext = typeof getStudentReport_ext

// PUBLIC API
export const getStudentReport: AuthenticatedOperationFor<GetStudentReport_ext> =
  createAuthenticatedOperation(
    getStudentReport_ext,
    {
      Assessment: prisma.assessment,
      OrgStudent: prisma.orgStudent,
      QRPaper: prisma.qRPaper,
      QuestionSet: prisma.questionSet,
      Attempt: prisma.attempt,
      Campaign: prisma.campaign,
      OrgConfig: prisma.orgConfig,
    },
  )


// PRIVATE API
export type GetStudentSegregation_ext = typeof getStudentSegregation_ext

// PUBLIC API
export const getStudentSegregation: AuthenticatedOperationFor<GetStudentSegregation_ext> =
  createAuthenticatedOperation(
    getStudentSegregation_ext,
    {
      Assessment: prisma.assessment,
      OrgStudent: prisma.orgStudent,
      QRPaper: prisma.qRPaper,
      QuestionSet: prisma.questionSet,
      Attempt: prisma.attempt,
      Campaign: prisma.campaign,
      OrgConfig: prisma.orgConfig,
    },
  )


// PRIVATE API
export type GetOrgConfig_ext = typeof getOrgConfig_ext

// PUBLIC API
export const getOrgConfig: AuthenticatedOperationFor<GetOrgConfig_ext> =
  createAuthenticatedOperation(
    getOrgConfig_ext,
    {
      OrgConfig: prisma.orgConfig,
      Organization: prisma.organization,
    },
  )

