
import {
  type _User,
  type _Organization,
  type _OrgStudent,
  type _Campaign,
  type _QRPaper,
  type _QuestionSet,
  type _WeakArea,
  type _PyqChunk,
  type _GeneratedQuestionPool,
  type _Attempt,
  type _Assessment,
  type _OrgConfig,
  type AuthenticatedQueryDefinition,
  type Payload,
} from 'wasp/server/_types'

// PUBLIC API
export type GetMe<Input extends Payload = never, Output extends Payload = Payload> = 
  AuthenticatedQueryDefinition<
    [
      _User,
    ],
    Input,
    Output
  >

// PUBLIC API
export type GetMyOrganization<Input extends Payload = never, Output extends Payload = Payload> = 
  AuthenticatedQueryDefinition<
    [
      _Organization,
      _OrgStudent,
      _Campaign,
    ],
    Input,
    Output
  >

// PUBLIC API
export type GetOrgStudents<Input extends Payload = never, Output extends Payload = Payload> = 
  AuthenticatedQueryDefinition<
    [
      _OrgStudent,
      _Organization,
    ],
    Input,
    Output
  >

// PUBLIC API
export type GetMyCampaigns<Input extends Payload = never, Output extends Payload = Payload> = 
  AuthenticatedQueryDefinition<
    [
      _Campaign,
      _QRPaper,
    ],
    Input,
    Output
  >

// PUBLIC API
export type GetCampaigns<Input extends Payload = never, Output extends Payload = Payload> = 
  AuthenticatedQueryDefinition<
    [
      _Campaign,
    ],
    Input,
    Output
  >

// PUBLIC API
export type GetPaper<Input extends Payload = never, Output extends Payload = Payload> = 
  AuthenticatedQueryDefinition<
    [
      _QRPaper,
      _QuestionSet,
      _Campaign,
      _WeakArea,
      _PyqChunk,
      _GeneratedQuestionPool,
    ],
    Input,
    Output
  >

// PUBLIC API
export type GetStudentWeakAreas<Input extends Payload = never, Output extends Payload = Payload> = 
  AuthenticatedQueryDefinition<
    [
      _WeakArea,
    ],
    Input,
    Output
  >

// PUBLIC API
export type GetStudentPapers<Input extends Payload = never, Output extends Payload = Payload> = 
  AuthenticatedQueryDefinition<
    [
      _QRPaper,
      _QuestionSet,
      _Attempt,
      _Campaign,
    ],
    Input,
    Output
  >

// PUBLIC API
export type GetOrgStudentPapers<Input extends Payload = never, Output extends Payload = Payload> = 
  AuthenticatedQueryDefinition<
    [
      _QRPaper,
      _QuestionSet,
      _Attempt,
      _Campaign,
      _OrgStudent,
    ],
    Input,
    Output
  >

// PUBLIC API
export type GetOrgAssessments<Input extends Payload = never, Output extends Payload = Payload> = 
  AuthenticatedQueryDefinition<
    [
      _Assessment,
      _OrgStudent,
    ],
    Input,
    Output
  >

// PUBLIC API
export type GetOrgAllPapers<Input extends Payload = never, Output extends Payload = Payload> = 
  AuthenticatedQueryDefinition<
    [
      _QRPaper,
      _QuestionSet,
      _Attempt,
      _Campaign,
      _Organization,
    ],
    Input,
    Output
  >

// PUBLIC API
export type GetStudentReport<Input extends Payload = never, Output extends Payload = Payload> = 
  AuthenticatedQueryDefinition<
    [
      _Assessment,
      _OrgStudent,
      _QRPaper,
      _QuestionSet,
      _Attempt,
      _Campaign,
      _OrgConfig,
    ],
    Input,
    Output
  >

// PUBLIC API
export type GetStudentSegregation<Input extends Payload = never, Output extends Payload = Payload> = 
  AuthenticatedQueryDefinition<
    [
      _Assessment,
      _OrgStudent,
      _QRPaper,
      _QuestionSet,
      _Attempt,
      _Campaign,
      _OrgConfig,
    ],
    Input,
    Output
  >

// PUBLIC API
export type GetOrgConfig<Input extends Payload = never, Output extends Payload = Payload> = 
  AuthenticatedQueryDefinition<
    [
      _OrgConfig,
      _Organization,
    ],
    Input,
    Output
  >

