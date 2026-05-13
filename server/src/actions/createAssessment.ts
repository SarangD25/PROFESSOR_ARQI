import { prisma } from 'wasp/server'

import { createAssessment } from '../../../../../src/server/actions/createAssessment.js'


export default async function (args, context) {
  return (createAssessment as any)(args, {
    ...context,
    entities: {
      Assessment: prisma.assessment,
      OrgStudent: prisma.orgStudent,
      Organization: prisma.organization,
    },
  })
}
