import { prisma } from 'wasp/server'

import { getMe } from '../../../../../src/server/queries/getMe.js'


export default async function (args, context) {
  return (getMe as any)(args, {
    ...context,
    entities: {
      User: prisma.user,
    },
  })
}
