import { prisma } from 'wasp/server'

import { getCampaigns } from '../../../../../src/server/queries/getCampaigns.js'


export default async function (args, context) {
  return (getCampaigns as any)(args, {
    ...context,
    entities: {
      Campaign: prisma.campaign,
    },
  })
}
