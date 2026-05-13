import { type Entity, type EntityName, type User, type Organization, type OrgStudent, type Campaign, type QRPaper, type QuestionSet, type Attempt, type WeakArea, type PyqChunk, type Assessment, type GeneratedQuestionPool, type OrgConfig } from 'wasp/entities';
export type _User = WithName<User, "User">;
export type _Organization = WithName<Organization, "Organization">;
export type _OrgStudent = WithName<OrgStudent, "OrgStudent">;
export type _Campaign = WithName<Campaign, "Campaign">;
export type _QRPaper = WithName<QRPaper, "QRPaper">;
export type _QuestionSet = WithName<QuestionSet, "QuestionSet">;
export type _Attempt = WithName<Attempt, "Attempt">;
export type _WeakArea = WithName<WeakArea, "WeakArea">;
export type _PyqChunk = WithName<PyqChunk, "PyqChunk">;
export type _Assessment = WithName<Assessment, "Assessment">;
export type _GeneratedQuestionPool = WithName<GeneratedQuestionPool, "GeneratedQuestionPool">;
export type _OrgConfig = WithName<OrgConfig, "OrgConfig">;
export type _Entity = _User | _Organization | _OrgStudent | _Campaign | _QRPaper | _QuestionSet | _Attempt | _WeakArea | _PyqChunk | _Assessment | _GeneratedQuestionPool | _OrgConfig | never;
type WithName<E extends Entity, Name extends EntityName> = E & {
    _entityName: Name;
};
export {};
//# sourceMappingURL=taggedEntities.d.ts.map