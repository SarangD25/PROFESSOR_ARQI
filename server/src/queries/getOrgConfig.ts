import { prisma } from 'wasp/server'

import { getOrgConfig } from '../../../../../src/server/queries/getOrgConfig.js'


export default async function (args, context) {
  return (getOrgConfig as any)(args, {
    ...context,
    entities: {
      OrgConfig: prisma.orgConfig,
      Organization: prisma.organization,
    },
  })
}
