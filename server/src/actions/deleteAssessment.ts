import { prisma } from 'wasp/server'

import { deleteAssessment } from '../../../../../src/server/actions/deleteAssessment.js'


export default async function (args, context) {
  return (deleteAssessment as any)(args, {
    ...context,
    entities: {
      Assessment: prisma.assessment,
    },
  })
}
