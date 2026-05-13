
import { prisma } from 'wasp/server'
import {
  type UnauthenticatedOperationFor,
  createUnauthenticatedOperation,
  type AuthenticatedOperationFor,
  createAuthenticatedOperation,
} from '../wrappers.js'
import { createOrganization as createOrganization_ext } from 'wasp/src/server/actions/createOrganization'
import { addOrgStudents as addOrgStudents_ext } from 'wasp/src/server/actions/addOrgStudents'
import { createCampaign as createCampaign_ext } from 'wasp/src/server/actions/createCampaign'
import { generateSecureQR as generateSecureQR_ext } from 'wasp/src/server/actions/generateSecureQR'
import { createIndividualSession as createIndividualSession_ext } from 'wasp/src/server/actions/createIndividualSession'
import { generateBulkQR as generateBulkQR_ext } from 'wasp/src/server/actions/generateBulkQR'
import { submitAttempt as submitAttempt_ext } from 'wasp/src/server/actions/submitAttempt'
import { createAssessment as createAssessment_ext } from 'wasp/src/server/actions/createAssessment'
import { deleteAssessment as deleteAssessment_ext } from 'wasp/src/server/actions/deleteAssessment'
import { updateOrgConfig as updateOrgConfig_ext } from 'wasp/src/server/actions/updateOrgConfig'
import { deletePaper as deletePaper_ext } from 'wasp/src/server/actions/deletePaper'
import { deleteCampaign as deleteCampaign_ext } from 'wasp/src/server/actions/deleteCampaign'

// PRIVATE API
export type CreateOrganization_ext = typeof createOrganization_ext

// PUBLIC API
export const createOrganization: AuthenticatedOperationFor<CreateOrganization_ext> =
  createAuthenticatedOperation(
    createOrganization_ext,
    {
      Organization: prisma.organization,
    },
  )

// PRIVATE API
export type AddOrgStudents_ext = typeof addOrgStudents_ext

// PUBLIC API
export const addOrgStudents: AuthenticatedOperationFor<AddOrgStudents_ext> =
  createAuthenticatedOperation(
    addOrgStudents_ext,
    {
      OrgStudent: prisma.orgStudent,
      Organization: prisma.organization,
    },
  )

// PRIVATE API
export type CreateCampaign_ext = typeof createCampaign_ext

// PUBLIC API
export const createCampaign: AuthenticatedOperationFor<CreateCampaign_ext> =
  createAuthenticatedOperation(
    createCampaign_ext,
    {
      Campaign: prisma.campaign,
      Organization: prisma.organization,
    },
  )

// PRIVATE API
export type GenerateSecureQR_ext = typeof generateSecureQR_ext

// PUBLIC API
export const generateSecureQR: AuthenticatedOperationFor<GenerateSecureQR_ext> =
  createAuthenticatedOperation(
    generateSecureQR_ext,
    {
      User: prisma.user,
      QRPaper: prisma.qRPaper,
      Campaign: prisma.campaign,
    },
  )

// PRIVATE API
export type CreateIndividualSession_ext = typeof createIndividualSession_ext

// PUBLIC API
export const createIndividualSession: AuthenticatedOperationFor<CreateIndividualSession_ext> =
  createAuthenticatedOperation(
    createIndividualSession_ext,
    {
      Campaign: prisma.campaign,
    },
  )

// PRIVATE API
export type GenerateBulkQR_ext = typeof generateBulkQR_ext

// PUBLIC API
export const generateBulkQR: AuthenticatedOperationFor<GenerateBulkQR_ext> =
  createAuthenticatedOperation(
    generateBulkQR_ext,
    {
      QRPaper: prisma.qRPaper,
      Campaign: prisma.campaign,
      OrgStudent: prisma.orgStudent,
      Organization: prisma.organization,
      Assessment: prisma.assessment,
      Attempt: prisma.attempt,
      QuestionSet: prisma.questionSet,
      OrgConfig: prisma.orgConfig,
    },
  )

// PRIVATE API
export type SubmitAttempt_ext = typeof submitAttempt_ext

// PUBLIC API
export const submitAttempt: AuthenticatedOperationFor<SubmitAttempt_ext> =
  createAuthenticatedOperation(
    submitAttempt_ext,
    {
      Attempt: prisma.attempt,
      QuestionSet: prisma.questionSet,
      WeakArea: prisma.weakArea,
      QRPaper: prisma.qRPaper,
    },
  )

// PRIVATE API
export type CreateAssessment_ext = typeof createAssessment_ext

// PUBLIC API
export const createAssessment: AuthenticatedOperationFor<CreateAssessment_ext> =
  createAuthenticatedOperation(
    createAssessment_ext,
    {
      Assessment: prisma.assessment,
      OrgStudent: prisma.orgStudent,
      Organization: prisma.organization,
    },
  )

// PRIVATE API
export type DeleteAssessment_ext = typeof deleteAssessment_ext

// PUBLIC API
export const deleteAssessment: AuthenticatedOperationFor<DeleteAssessment_ext> =
  createAuthenticatedOperation(
    deleteAssessment_ext,
    {
      Assessment: prisma.assessment,
    },
  )

// PRIVATE API
export type UpdateOrgConfig_ext = typeof updateOrgConfig_ext

// PUBLIC API
export const updateOrgConfig: AuthenticatedOperationFor<UpdateOrgConfig_ext> =
  createAuthenticatedOperation(
    updateOrgConfig_ext,
    {
      OrgConfig: prisma.orgConfig,
      Organization: prisma.organization,
    },
  )

// PRIVATE API
export type DeletePaper_ext = typeof deletePaper_ext

// PUBLIC API
export const deletePaper: AuthenticatedOperationFor<DeletePaper_ext> =
  createAuthenticatedOperation(
    deletePaper_ext,
    {
      QRPaper: prisma.qRPaper,
      QuestionSet: prisma.questionSet,
      Attempt: prisma.attempt,
    },
  )

// PRIVATE API
export type DeleteCampaign_ext = typeof deleteCampaign_ext

// PUBLIC API
export const deleteCampaign: AuthenticatedOperationFor<DeleteCampaign_ext> =
  createAuthenticatedOperation(
    deleteCampaign_ext,
    {
      Campaign: prisma.campaign,
      QRPaper: prisma.qRPaper,
      QuestionSet: prisma.questionSet,
      Attempt: prisma.attempt,
    },
  )
