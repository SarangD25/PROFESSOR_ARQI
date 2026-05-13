import { prisma } from 'wasp/server'

import { createIndividualSession } from '../../../../../src/server/actions/createIndividualSession.js'


export default async function (args, context) {
  return (createIndividualSession as any)(args, {
    ...context,
    entities: {
      Campaign: prisma.campaign,
    },
  })
}
