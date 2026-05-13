import { prisma } from 'wasp/server'

import { getStudentPapers } from '../../../../../src/server/queries/getStudentPapers.js'


export default async function (args, context) {
  return (getStudentPapers as any)(args, {
    ...context,
    entities: {
      QRPaper: prisma.qRPaper,
      QuestionSet: prisma.questionSet,
      Attempt: prisma.attempt,
      Campaign: prisma.campaign,
    },
  })
}
