import { prisma } from 'wasp/server';
import { updateOrgConfig } from '../../../../../src/server/actions/updateOrgConfig.js';
export default async function (args, context) {
    return updateOrgConfig(args, {
        ...context,
        entities: {
            OrgConfig: prisma.orgConfig,
            Organization: prisma.organization,
        },
    });
}
//# sourceMappingURL=updateOrgConfig.js.map