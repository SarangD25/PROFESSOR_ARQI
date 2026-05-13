import { prisma } from 'wasp/server';
import { createIndividualSession } from '../../../../../src/server/actions/createIndividualSession.js';
export default async function (args, context) {
    return createIndividualSession(args, {
        ...context,
        entities: {
            Campaign: prisma.campaign,
        },
    });
}
//# sourceMappingURL=createIndividualSession.js.map