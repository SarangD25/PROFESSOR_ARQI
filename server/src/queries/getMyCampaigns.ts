import { prisma } from 'wasp/server'

import { getMyCampaigns } from '../../../../../src/server/queries/getMyCampaigns.js'


export default async function (args, context) {
  return (getMyCampaigns as any)(args, {
    ...context,
    entities: {
      Campaign: prisma.campaign,
      QRPaper: prisma.qRPaper,
    },
  })
}
