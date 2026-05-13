import { prisma } from 'wasp/server'

import { generateSecureQR } from '../../../../../src/server/actions/generateSecureQR.js'


export default async function (args, context) {
  return (generateSecureQR as any)(args, {
    ...context,
    entities: {
      User: prisma.user,
      QRPaper: prisma.qRPaper,
      Campaign: prisma.campaign,
    },
  })
}
