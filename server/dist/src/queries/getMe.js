import { prisma } from 'wasp/server';
import { getMe } from '../../../../../src/server/queries/getMe.js';
export default async function (args, context) {
    return getMe(args, {
        ...context,
        entities: {
            User: prisma.user,
        },
    });
}
//# sourceMappingURL=getMe.js.map