import { prisma } from 'wasp/server';
import { getStudentWeakAreas } from '../../../../../src/server/queries/getStudentWeakAreas.js';
export default async function (args, context) {
    return getStudentWeakAreas(args, {
        ...context,
        entities: {
            WeakArea: prisma.weakArea,
        },
    });
}
//# sourceMappingURL=getStudentWeakAreas.js.map