import { prisma } from 'wasp/server';
import { createAssessment } from '../../../../../src/server/actions/createAssessment.js';
export default async function (args, context) {
    return createAssessment(args, {
        ...context,
        entities: {
            Assessment: prisma.assessment,
            OrgStudent: prisma.orgStudent,
            Organization: prisma.organization,
        },
    });
}
//# sourceMappingURL=createAssessment.js.map