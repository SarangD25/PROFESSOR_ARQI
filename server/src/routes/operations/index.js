import express from 'express'

import auth from 'wasp/core/auth'

import createOrganization from './createOrganization.js'
import addOrgStudents from './addOrgStudents.js'
import createCampaign from './createCampaign.js'
import generateSecureQR from './generateSecureQR.js'
import createIndividualSession from './createIndividualSession.js'
import generateBulkQR from './generateBulkQR.js'
import submitAttempt from './submitAttempt.js'
import createAssessment from './createAssessment.js'
import deleteAssessment from './deleteAssessment.js'
import updateOrgConfig from './updateOrgConfig.js'
import deletePaper from './deletePaper.js'
import deleteCampaign from './deleteCampaign.js'
import getMe from './getMe.js'
import getMyOrganization from './getMyOrganization.js'
import getOrgStudents from './getOrgStudents.js'
import getMyCampaigns from './getMyCampaigns.js'
import getCampaigns from './getCampaigns.js'
import getPaper from './getPaper.js'
import getStudentWeakAreas from './getStudentWeakAreas.js'
import getStudentPapers from './getStudentPapers.js'
import getOrgStudentPapers from './getOrgStudentPapers.js'
import getOrgAssessments from './getOrgAssessments.js'
import getOrgAllPapers from './getOrgAllPapers.js'
import getStudentReport from './getStudentReport.js'
import getStudentSegregation from './getStudentSegregation.js'
import getOrgConfig from './getOrgConfig.js'

const router = express.Router()

router.post('/create-organization', auth, createOrganization)
router.post('/add-org-students', auth, addOrgStudents)
router.post('/create-campaign', auth, createCampaign)
router.post('/generate-secure-qr', auth, generateSecureQR)
router.post('/create-individual-session', auth, createIndividualSession)
router.post('/generate-bulk-qr', auth, generateBulkQR)
router.post('/submit-attempt', auth, submitAttempt)
router.post('/create-assessment', auth, createAssessment)
router.post('/delete-assessment', auth, deleteAssessment)
router.post('/update-org-config', auth, updateOrgConfig)
router.post('/delete-paper', auth, deletePaper)
router.post('/delete-campaign', auth, deleteCampaign)
router.post('/get-me', auth, getMe)
router.post('/get-my-organization', auth, getMyOrganization)
router.post('/get-org-students', auth, getOrgStudents)
router.post('/get-my-campaigns', auth, getMyCampaigns)
router.post('/get-campaigns', auth, getCampaigns)
router.post('/get-paper', auth, getPaper)
router.post('/get-student-weak-areas', auth, getStudentWeakAreas)
router.post('/get-student-papers', auth, getStudentPapers)
router.post('/get-org-student-papers', auth, getOrgStudentPapers)
router.post('/get-org-assessments', auth, getOrgAssessments)
router.post('/get-org-all-papers', auth, getOrgAllPapers)
router.post('/get-student-report', auth, getStudentReport)
router.post('/get-student-segregation', auth, getStudentSegregation)
router.post('/get-org-config', auth, getOrgConfig)

export default router
