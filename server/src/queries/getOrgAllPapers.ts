import { prisma } from 'wasp/server'

import { getOrgAllPapers } from '../../../../../src/server/queries/getOrgAllPapers.js'


export default async function (args, context) {
  return (getOrgAllPapers as any)(args, {
    ...context,
    entities: {
      QRPaper: prisma.qRPaper,
      QuestionSet: prisma.questionSet,
      Attempt: prisma.attempt,
      Campaign: prisma.campaign,
      Organization: prisma.organization,
    },
  })
}
