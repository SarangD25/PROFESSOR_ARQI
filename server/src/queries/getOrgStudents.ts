import { prisma } from 'wasp/server'

import { getOrgStudents } from '../../../../../src/server/queries/getOrgStudents.js'


export default async function (args, context) {
  return (getOrgStudents as any)(args, {
    ...context,
    entities: {
      OrgStudent: prisma.orgStudent,
      Organization: prisma.organization,
    },
  })
}
