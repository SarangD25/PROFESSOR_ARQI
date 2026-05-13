import { prisma } from 'wasp/server'

import { updateOrgConfig } from '../../../../../src/server/actions/updateOrgConfig.js'


export default async function (args, context) {
  return (updateOrgConfig as any)(args, {
    ...context,
    entities: {
      OrgConfig: prisma.orgConfig,
      Organization: prisma.organization,
    },
  })
}
