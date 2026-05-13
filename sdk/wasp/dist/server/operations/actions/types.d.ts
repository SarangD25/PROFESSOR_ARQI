import { type _Organization, type _OrgStudent, type _Campaign, type _User, type _QRPaper, type _Assessment, type _Attempt, type _QuestionSet, type _OrgConfig, type _WeakArea, type AuthenticatedActionDefinition, type Payload } from 'wasp/server/_types';
export type CreateOrganization<Input extends Payload = never, Output extends Payload = Payload> = AuthenticatedActionDefinition<[
    _Organization
], Input, Output>;
export type AddOrgStudents<Input extends Payload = never, Output extends Payload = Payload> = AuthenticatedActionDefinition<[
    _OrgStudent,
    _Organization
], Input, Output>;
export type CreateCampaign<Input extends Payload = never, Output extends Payload = Payload> = AuthenticatedActionDefinition<[
    _Campaign,
    _Organization
], Input, Output>;
export type GenerateSecureQR<Input extends Payload = never, Output extends Payload = Payload> = AuthenticatedActionDefinition<[
    _User,
    _QRPaper,
    _Campaign
], Input, Output>;
export type CreateIndividualSession<Input extends Payload = never, Output extends Payload = Payload> = AuthenticatedActionDefinition<[
    _Campaign
], Input, Output>;
export type GenerateBulkQR<Input extends Payload = never, Output extends Payload = Payload> = AuthenticatedActionDefinition<[
    _QRPaper,
    _Campaign,
    _OrgStudent,
    _Organization,
    _Assessment,
    _Attempt,
    _QuestionSet,
    _OrgConfig
], Input, Output>;
export type SubmitAttempt<Input extends Payload = never, Output extends Payload = Payload> = AuthenticatedActionDefinition<[
    _Attempt,
    _QuestionSet,
    _WeakArea,
    _QRPaper
], Input, Output>;
export type CreateAssessment<Input extends Payload = never, Output extends Payload = Payload> = AuthenticatedActionDefinition<[
    _Assessment,
    _OrgStudent,
    _Organization
], Input, Output>;
export type DeleteAssessment<Input extends Payload = never, Output extends Payload = Payload> = AuthenticatedActionDefinition<[
    _Assessment
], Input, Output>;
export type UpdateOrgConfig<Input extends Payload = never, Output extends Payload = Payload> = AuthenticatedActionDefinition<[
    _OrgConfig,
    _Organization
], Input, Output>;
export type DeletePaper<Input extends Payload = never, Output extends Payload = Payload> = AuthenticatedActionDefinition<[
    _QRPaper,
    _QuestionSet,
    _Attempt
], Input, Output>;
export type DeleteCampaign<Input extends Payload = never, Output extends Payload = Payload> = AuthenticatedActionDefinition<[
    _Campaign,
    _QRPaper,
    _QuestionSet,
    _Attempt
], Input, Output>;
//# sourceMappingURL=types.d.ts.map