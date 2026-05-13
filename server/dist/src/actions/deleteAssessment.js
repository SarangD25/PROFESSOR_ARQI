import { prisma } from 'wasp/server';
import { deleteAssessment } from '../../../../../src/server/actions/deleteAssessment.js';
export default async function (args, context) {
    return deleteAssessment(args, {
        ...context,
        entities: {
            Assessment: prisma.assessment,
        },
    });
}
//# sourceMappingURL=deleteAssessment.js.map