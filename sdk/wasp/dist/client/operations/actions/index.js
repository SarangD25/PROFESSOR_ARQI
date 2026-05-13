import { createAction } from './core';
// PUBLIC API
export const createOrganization = createAction('operations/create-organization', ['Organization']);
// PUBLIC API
export const addOrgStudents = createAction('operations/add-org-students', ['OrgStudent', 'Organization']);
// PUBLIC API
export const createCampaign = createAction('operations/create-campaign', ['Campaign', 'Organization']);
// PUBLIC API
export const generateSecureQR = createAction('operations/generate-secure-qr', ['User', 'QRPaper', 'Campaign']);
// PUBLIC API
export const createIndividualSession = createAction('operations/create-individual-session', ['Campaign']);
// PUBLIC API
export const generateBulkQR = createAction('operations/generate-bulk-qr', ['QRPaper', 'Campaign', 'OrgStudent', 'Organization', 'Assessment', 'Attempt', 'QuestionSet', 'OrgConfig']);
// PUBLIC API
export const submitAttempt = createAction('operations/submit-attempt', ['Attempt', 'QuestionSet', 'WeakArea', 'QRPaper']);
// PUBLIC API
export const createAssessment = createAction('operations/create-assessment', ['Assessment', 'OrgStudent', 'Organization']);
// PUBLIC API
export const deleteAssessment = createAction('operations/delete-assessment', ['Assessment']);
// PUBLIC API
export const updateOrgConfig = createAction('operations/update-org-config', ['OrgConfig', 'Organization']);
// PUBLIC API
export const deletePaper = createAction('operations/delete-paper', ['QRPaper', 'QuestionSet', 'Attempt']);
// PUBLIC API
export const deleteCampaign = createAction('operations/delete-campaign', ['Campaign', 'QRPaper', 'QuestionSet', 'Attempt']);
//# sourceMappingURL=index.js.map