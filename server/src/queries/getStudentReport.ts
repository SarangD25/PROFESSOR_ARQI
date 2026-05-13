import { prisma } from 'wasp/server'

import { getStudentReport } from '../../../../../src/server/queries/getStudentReport.js'


export default async function (args, context) {
  return (getStudentReport as any)(args, {
    ...context,
    entities: {
      Assessment: prisma.assessment,
      OrgStudent: prisma.orgStudent,
      QRPaper: prisma.qRPaper,
      QuestionSet: prisma.questionSet,
      Attempt: prisma.attempt,
      Campaign: prisma.campaign,
      OrgConfig: prisma.orgConfig,
    },
  })
}
