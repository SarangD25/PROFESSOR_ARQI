import { prisma } from 'wasp/server'

import { deleteCampaign } from '../../../../../src/server/actions/deleteCampaign.js'


export default async function (args, context) {
  return (deleteCampaign as any)(args, {
    ...context,
    entities: {
      Campaign: prisma.campaign,
      QRPaper: prisma.qRPaper,
      QuestionSet: prisma.questionSet,
      Attempt: prisma.attempt,
    },
  })
}
