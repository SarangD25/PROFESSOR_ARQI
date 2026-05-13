import { prisma } from 'wasp/server'

import { createCampaign } from '../../../../../src/server/actions/createCampaign.js'


export default async function (args, context) {
  return (createCampaign as any)(args, {
    ...context,
    entities: {
      Campaign: prisma.campaign,
      Organization: prisma.organization,
    },
  })
}
