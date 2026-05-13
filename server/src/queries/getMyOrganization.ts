import { prisma } from 'wasp/server'

import { getMyOrganization } from '../../../../../src/server/queries/getMyOrganization.js'


export default async function (args, context) {
  return (getMyOrganization as any)(args, {
    ...context,
    entities: {
      Organization: prisma.organization,
      OrgStudent: prisma.orgStudent,
      Campaign: prisma.campaign,
    },
  })
}
