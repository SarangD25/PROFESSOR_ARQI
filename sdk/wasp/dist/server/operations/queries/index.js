import { prisma } from 'wasp/server';
import { createAuthenticatedOperation, } from '../wrappers.js';
import { getMe as getMe_ext } from 'wasp/src/server/queries/getMe';
import { getMyOrganization as getMyOrganization_ext } from 'wasp/src/server/queries/getMyOrganization';
import { getOrgStudents as getOrgStudents_ext } from 'wasp/src/server/queries/getOrgStudents';
import { getMyCampaigns as getMyCampaigns_ext } from 'wasp/src/server/queries/getMyCampaigns';
import { getCampaigns as getCampaigns_ext } from 'wasp/src/server/queries/getCampaigns';
import { getPaper as getPaper_ext } from 'wasp/src/server/queries/getPaper';
import { getStudentWeakAreas as getStudentWeakAreas_ext } from 'wasp/src/server/queries/getStudentWeakAreas';
import { getStudentPapers as getStudentPapers_ext } from 'wasp/src/server/queries/getStudentPapers';
import { getOrgStudentPapers as getOrgStudentPapers_ext } from 'wasp/src/server/queries/getOrgStudentPapers';
import { getOrgAssessments as getOrgAssessments_ext } from 'wasp/src/server/queries/getOrgAssessments';
import { getOrgAllPapers as getOrgAllPapers_ext } from 'wasp/src/server/queries/getOrgAllPapers';
import { getStudentReport as getStudentReport_ext } from 'wasp/src/server/queries/getStudentReport';
import { getStudentSegregation as getStudentSegregation_ext } from 'wasp/src/server/queries/getStudentSegregation';
import { getOrgConfig as getOrgConfig_ext } from 'wasp/src/server/queries/getOrgConfig';
// PUBLIC API
export const getMe = createAuthenticatedOperation(getMe_ext, {
    User: prisma.user,
});
// PUBLIC API
export const getMyOrganization = createAuthenticatedOperation(getMyOrganization_ext, {
    Organization: prisma.organization,
    OrgStudent: prisma.orgStudent,
    Campaign: prisma.campaign,
});
// PUBLIC API
export const getOrgStudents = createAuthenticatedOperation(getOrgStudents_ext, {
    OrgStudent: prisma.orgStudent,
    Organization: prisma.organization,
});
// PUBLIC API
export const getMyCampaigns = createAuthenticatedOperation(getMyCampaigns_ext, {
    Campaign: prisma.campaign,
    QRPaper: prisma.qRPaper,
});
// PUBLIC API
export const getCampaigns = createAuthenticatedOperation(getCampaigns_ext, {
    Campaign: prisma.campaign,
});
// PUBLIC API
export const getPaper = createAuthenticatedOperation(getPaper_ext, {
    QRPaper: prisma.qRPaper,
    QuestionSet: prisma.questionSet,
    Campaign: prisma.campaign,
    WeakArea: prisma.weakArea,
    PyqChunk: prisma.pyqChunk,
    GeneratedQuestionPool: prisma.generatedQuestionPool,
});
// PUBLIC API
export const getStudentWeakAreas = createAuthenticatedOperation(getStudentWeakAreas_ext, {
    WeakArea: prisma.weakArea,
});
// PUBLIC API
export const getStudentPapers = createAuthenticatedOperation(getStudentPapers_ext, {
    QRPaper: prisma.qRPaper,
    QuestionSet: prisma.questionSet,
    Attempt: prisma.attempt,
    Campaign: prisma.campaign,
});
// PUBLIC API
export const getOrgStudentPapers = createAuthenticatedOperation(getOrgStudentPapers_ext, {
    QRPaper: prisma.qRPaper,
    QuestionSet: prisma.questionSet,
    Attempt: prisma.attempt,
    Campaign: prisma.campaign,
    OrgStudent: prisma.orgStudent,
});
// PUBLIC API
export const getOrgAssessments = createAuthenticatedOperation(getOrgAssessments_ext, {
    Assessment: prisma.assessment,
    OrgStudent: prisma.orgStudent,
});
// PUBLIC API
export const getOrgAllPapers = createAuthenticatedOperation(getOrgAllPapers_ext, {
    QRPaper: prisma.qRPaper,
    QuestionSet: prisma.questionSet,
    Attempt: prisma.attempt,
    Campaign: prisma.campaign,
    Organization: prisma.organization,
});
// PUBLIC API
export const getStudentReport = createAuthenticatedOperation(getStudentReport_ext, {
    Assessment: prisma.assessment,
    OrgStudent: prisma.orgStudent,
    QRPaper: prisma.qRPaper,
    QuestionSet: prisma.questionSet,
    Attempt: prisma.attempt,
    Campaign: prisma.campaign,
    OrgConfig: prisma.orgConfig,
});
// PUBLIC API
export const getStudentSegregation = createAuthenticatedOperation(getStudentSegregation_ext, {
    Assessment: prisma.assessment,
    OrgStudent: prisma.orgStudent,
    QRPaper: prisma.qRPaper,
    QuestionSet: prisma.questionSet,
    Attempt: prisma.attempt,
    Campaign: prisma.campaign,
    OrgConfig: prisma.orgConfig,
});
// PUBLIC API
export const getOrgConfig = createAuthenticatedOperation(getOrgConfig_ext, {
    OrgConfig: prisma.orgConfig,
    Organization: prisma.organization,
});
//# sourceMappingURL=index.js.map