import { prisma } from 'wasp/server';
import { createOrganization } from '../../../../../src/server/actions/createOrganization.js';
export default async function (args, context) {
    return createOrganization(args, {
        ...context,
        entities: {
            Organization: prisma.organization,
        },
    });
}
//# sourceMappingURL=createOrganization.js.map