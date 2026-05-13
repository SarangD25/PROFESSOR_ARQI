import { prisma } from 'wasp/server'

import { getPaper } from '../../../../../src/server/queries/getPaper.js'


export default async function (args, context) {
  return (getPaper as any)(args, {
    ...context,
    entities: {
      QRPaper: prisma.qRPaper,
      QuestionSet: prisma.questionSet,
      Campaign: prisma.campaign,
      WeakArea: prisma.weakArea,
      PyqChunk: prisma.pyqChunk,
      GeneratedQuestionPool: prisma.generatedQuestionPool,
    },
  })
}
