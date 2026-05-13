import { prisma } from 'wasp/server'

import { getOrgAssessments } from '../../../../../src/server/queries/getOrgAssessments.js'


export default async function (args, context) {
  return (getOrgAssessments as any)(args, {
    ...context,
    entities: {
      Assessment: prisma.assessment,
      OrgStudent: prisma.orgStudent,
    },
  })
}
