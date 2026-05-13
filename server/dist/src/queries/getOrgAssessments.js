import { prisma } from 'wasp/server';
import { getOrgAssessments } from '../../../../../src/server/queries/getOrgAssessments.js';
export default async function (args, context) {
    return getOrgAssessments(args, {
        ...context,
        entities: {
            Assessment: prisma.assessment,
            OrgStudent: prisma.orgStudent,
        },
    });
}
//# sourceMappingURL=getOrgAssessments.js.map