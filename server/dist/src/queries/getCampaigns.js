import { prisma } from 'wasp/server';
import { getCampaigns } from '../../../../../src/server/queries/getCampaigns.js';
export default async function (args, context) {
    return getCampaigns(args, {
        ...context,
        entities: {
            Campaign: prisma.campaign,
        },
    });
}
//# sourceMappingURL=getCampaigns.js.map