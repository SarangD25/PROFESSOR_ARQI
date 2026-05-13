import { prisma } from 'wasp/server';
import { getOrgConfig } from '../../../../../src/server/queries/getOrgConfig.js';
export default async function (args, context) {
    return getOrgConfig(args, {
        ...context,
        entities: {
            OrgConfig: prisma.orgConfig,
            Organization: prisma.organization,
        },
    });
}
//# sourceMappingURL=getOrgConfig.js.map