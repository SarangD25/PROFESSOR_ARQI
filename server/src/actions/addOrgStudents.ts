import { prisma } from 'wasp/server'

import { addOrgStudents } from '../../../../../src/server/actions/addOrgStudents.js'


export default async function (args, context) {
  return (addOrgStudents as any)(args, {
    ...context,
    entities: {
      OrgStudent: prisma.orgStudent,
      Organization: prisma.organization,
    },
  })
}
