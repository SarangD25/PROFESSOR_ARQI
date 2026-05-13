import { prisma } from 'wasp/server';
import { getOrgStudentPapers } from '../../../../../src/server/queries/getOrgStudentPapers.js';
export default async function (args, context) {
    return getOrgStudentPapers(args, {
        ...context,
        entities: {
            QRPaper: prisma.qRPaper,
            QuestionSet: prisma.questionSet,
            Attempt: prisma.attempt,
            Campaign: prisma.campaign,
            OrgStudent: prisma.orgStudent,
        },
    });
}
//# sourceMappingURL=getOrgStudentPapers.js.map