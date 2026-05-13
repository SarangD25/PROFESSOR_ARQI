import { createQuery } from './core';
// PUBLIC API
export const getMe = createQuery('operations/get-me', ['User']);
// PUBLIC API
export const getMyOrganization = createQuery('operations/get-my-organization', ['Organization', 'OrgStudent', 'Campaign']);
// PUBLIC API
export const getOrgStudents = createQuery('operations/get-org-students', ['OrgStudent', 'Organization']);
// PUBLIC API
export const getMyCampaigns = createQuery('operations/get-my-campaigns', ['Campaign', 'QRPaper']);
// PUBLIC API
export const getCampaigns = createQuery('operations/get-campaigns', ['Campaign']);
// PUBLIC API
export const getPaper = createQuery('operations/get-paper', ['QRPaper', 'QuestionSet', 'Campaign', 'WeakArea', 'PyqChunk', 'GeneratedQuestionPool']);
// PUBLIC API
export const getStudentWeakAreas = createQuery('operations/get-student-weak-areas', ['WeakArea']);
// PUBLIC API
export const getStudentPapers = createQuery('operations/get-student-papers', ['QRPaper', 'QuestionSet', 'Attempt', 'Campaign']);
// PUBLIC API
export const getOrgStudentPapers = createQuery('operations/get-org-student-papers', ['QRPaper', 'QuestionSet', 'Attempt', 'Campaign', 'OrgStudent']);
// PUBLIC API
export const getOrgAssessments = createQuery('operations/get-org-assessments', ['Assessment', 'OrgStudent']);
// PUBLIC API
export const getOrgAllPapers = createQuery('operations/get-org-all-papers', ['QRPaper', 'QuestionSet', 'Attempt', 'Campaign', 'Organization']);
// PUBLIC API
export const getStudentReport = createQuery('operations/get-student-report', ['Assessment', 'OrgStudent', 'QRPaper', 'QuestionSet', 'Attempt', 'Campaign', 'OrgConfig']);
// PUBLIC API
export const getStudentSegregation = createQuery('operations/get-student-segregation', ['Assessment', 'OrgStudent', 'QRPaper', 'QuestionSet', 'Attempt', 'Campaign', 'OrgConfig']);
// PUBLIC API
export const getOrgConfig = createQuery('operations/get-org-config', ['OrgConfig', 'Organization']);
// PRIVATE API (used in SDK)
export { buildAndRegisterQuery } from './core';
//# sourceMappingURL=index.js.map