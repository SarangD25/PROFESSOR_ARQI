import { prisma } from 'wasp/server';
import { addOrgStudents } from '../../../../../src/server/actions/addOrgStudents.js';
export default async function (args, context) {
    return addOrgStudents(args, {
        ...context,
        entities: {
            OrgStudent: prisma.orgStudent,
            Organization: prisma.organization,
        },
    });
}
//# sourceMappingURL=addOrgStudents.js.map