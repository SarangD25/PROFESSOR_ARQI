import { prisma } from 'wasp/server'

import { generateBulkQR } from '../../../../../src/server/actions/generateBulkQR.js'


export default async function (args, context) {
  return (generateBulkQR as any)(args, {
    ...context,
    entities: {
      QRPaper: prisma.qRPaper,
      Campaign: prisma.campaign,
      OrgStudent: prisma.orgStudent,
      Organization: prisma.organization,
      Assessment: prisma.assessment,
      Attempt: prisma.attempt,
      QuestionSet: prisma.questionSet,
      OrgConfig: prisma.orgConfig,
    },
  })
}
