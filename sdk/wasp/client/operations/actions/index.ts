import { type ActionFor, createAction } from './core'
import { CreateOrganization_ext } from 'wasp/server/operations/actions'
import { AddOrgStudents_ext } from 'wasp/server/operations/actions'
import { CreateCampaign_ext } from 'wasp/server/operations/actions'
import { GenerateSecureQR_ext } from 'wasp/server/operations/actions'
import { CreateIndividualSession_ext } from 'wasp/server/operations/actions'
import { GenerateBulkQR_ext } from 'wasp/server/operations/actions'
import { SubmitAttempt_ext } from 'wasp/server/operations/actions'
import { CreateAssessment_ext } from 'wasp/server/operations/actions'
import { DeleteAssessment_ext } from 'wasp/server/operations/actions'
import { UpdateOrgConfig_ext } from 'wasp/server/operations/actions'
import { DeletePaper_ext } from 'wasp/server/operations/actions'
import { DeleteCampaign_ext } from 'wasp/server/operations/actions'

// PUBLIC API
export const createOrganization: ActionFor<CreateOrganization_ext> = createAction<CreateOrganization_ext>(
  'operations/create-organization',
  ['Organization'],
)

// PUBLIC API
export const addOrgStudents: ActionFor<AddOrgStudents_ext> = createAction<AddOrgStudents_ext>(
  'operations/add-org-students',
  ['OrgStudent', 'Organization'],
)

// PUBLIC API
export const createCampaign: ActionFor<CreateCampaign_ext> = createAction<CreateCampaign_ext>(
  'operations/create-campaign',
  ['Campaign', 'Organization'],
)

// PUBLIC API
export const generateSecureQR: ActionFor<GenerateSecureQR_ext> = createAction<GenerateSecureQR_ext>(
  'operations/generate-secure-qr',
  ['User', 'QRPaper', 'Campaign'],
)

// PUBLIC API
export const createIndividualSession: ActionFor<CreateIndividualSession_ext> = createAction<CreateIndividualSession_ext>(
  'operations/create-individual-session',
  ['Campaign'],
)

// PUBLIC API
export const generateBulkQR: ActionFor<GenerateBulkQR_ext> = createAction<GenerateBulkQR_ext>(
  'operations/generate-bulk-qr',
  ['QRPaper', 'Campaign', 'OrgStudent', 'Organization', 'Assessment', 'Attempt', 'QuestionSet', 'OrgConfig'],
)

// PUBLIC API
export const submitAttempt: ActionFor<SubmitAttempt_ext> = createAction<SubmitAttempt_ext>(
  'operations/submit-attempt',
  ['Attempt', 'QuestionSet', 'WeakArea', 'QRPaper'],
)

// PUBLIC API
export const createAssessment: ActionFor<CreateAssessment_ext> = createAction<CreateAssessment_ext>(
  'operations/create-assessment',
  ['Assessment', 'OrgStudent', 'Organization'],
)

// PUBLIC API
export const deleteAssessment: ActionFor<DeleteAssessment_ext> = createAction<DeleteAssessment_ext>(
  'operations/delete-assessment',
  ['Assessment'],
)

// PUBLIC API
export const updateOrgConfig: ActionFor<UpdateOrgConfig_ext> = createAction<UpdateOrgConfig_ext>(
  'operations/update-org-config',
  ['OrgConfig', 'Organization'],
)

// PUBLIC API
export const deletePaper: ActionFor<DeletePaper_ext> = createAction<DeletePaper_ext>(
  'operations/delete-paper',
  ['QRPaper', 'QuestionSet', 'Attempt'],
)

// PUBLIC API
export const deleteCampaign: ActionFor<DeleteCampaign_ext> = createAction<DeleteCampaign_ext>(
  'operations/delete-campaign',
  ['Campaign', 'QRPaper', 'QuestionSet', 'Attempt'],
)
