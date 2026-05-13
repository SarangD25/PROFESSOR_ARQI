import { prisma } from 'wasp/server';
import { createAuthenticatedOperation, } from '../wrappers.js';
import { createOrganization as createOrganization_ext } from 'wasp/src/server/actions/createOrganization';
import { addOrgStudents as addOrgStudents_ext } from 'wasp/src/server/actions/addOrgStudents';
import { createCampaign as createCampaign_ext } from 'wasp/src/server/actions/createCampaign';
import { generateSecureQR as generateSecureQR_ext } from 'wasp/src/server/actions/generateSecureQR';
import { createIndividualSession as createIndividualSession_ext } from 'wasp/src/server/actions/createIndividualSession';
import { generateBulkQR as generateBulkQR_ext } from 'wasp/src/server/actions/generateBulkQR';
import { submitAttempt as submitAttempt_ext } from 'wasp/src/server/actions/submitAttempt';
import { createAssessment as createAssessment_ext } from 'wasp/src/server/actions/createAssessment';
import { deleteAssessment as deleteAssessment_ext } from 'wasp/src/server/actions/deleteAssessment';
import { updateOrgConfig as updateOrgConfig_ext } from 'wasp/src/server/actions/updateOrgConfig';
import { deletePaper as deletePaper_ext } from 'wasp/src/server/actions/deletePaper';
import { deleteCampaign as deleteCampaign_ext } from 'wasp/src/server/actions/deleteCampaign';
// PUBLIC API
export const createOrganization = createAuthenticatedOperation(createOrganization_ext, {
    Organization: prisma.organization,
});
// PUBLIC API
export const addOrgStudents = createAuthenticatedOperation(addOrgStudents_ext, {
    OrgStudent: prisma.orgStudent,
    Organization: prisma.organization,
});
// PUBLIC API
export const createCampaign = createAuthenticatedOperation(createCampaign_ext, {
    Campaign: prisma.campaign,
    Organization: prisma.organization,
});
// PUBLIC API
export const generateSecureQR = createAuthenticatedOperation(generateSecureQR_ext, {
    User: prisma.user,
    QRPaper: prisma.qRPaper,
    Campaign: prisma.campaign,
});
// PUBLIC API
export const createIndividualSession = createAuthenticatedOperation(createIndividualSession_ext, {
    Campaign: prisma.campaign,
});
// PUBLIC API
export const generateBulkQR = createAuthenticatedOperation(generateBulkQR_ext, {
    QRPaper: prisma.qRPaper,
    Campaign: prisma.campaign,
    OrgStudent: prisma.orgStudent,
    Organization: prisma.organization,
    Assessment: prisma.assessment,
    Attempt: prisma.attempt,
    QuestionSet: prisma.questionSet,
    OrgConfig: prisma.orgConfig,
});
// PUBLIC API
export const submitAttempt = createAuthenticatedOperation(submitAttempt_ext, {
    Attempt: prisma.attempt,
    QuestionSet: prisma.questionSet,
    WeakArea: prisma.weakArea,
    QRPaper: prisma.qRPaper,
});
// PUBLIC API
export const createAssessment = createAuthenticatedOperation(createAssessment_ext, {
    Assessment: prisma.assessment,
    OrgStudent: prisma.orgStudent,
    Organization: prisma.organization,
});
// PUBLIC API
export const deleteAssessment = createAuthenticatedOperation(deleteAssessment_ext, {
    Assessment: prisma.assessment,
});
// PUBLIC API
export const updateOrgConfig = createAuthenticatedOperation(updateOrgConfig_ext, {
    OrgConfig: prisma.orgConfig,
    Organization: prisma.organization,
});
// PUBLIC API
export const deletePaper = createAuthenticatedOperation(deletePaper_ext, {
    QRPaper: prisma.qRPaper,
    QuestionSet: prisma.questionSet,
    Attempt: prisma.attempt,
});
// PUBLIC API
export const deleteCampaign = createAuthenticatedOperation(deleteCampaign_ext, {
    Campaign: prisma.campaign,
    QRPaper: prisma.qRPaper,
    QuestionSet: prisma.questionSet,
    Attempt: prisma.attempt,
});
//# sourceMappingURL=index.js.map