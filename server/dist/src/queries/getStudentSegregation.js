import { prisma } from 'wasp/server';
import { getStudentSegregation } from '../../../../../src/server/queries/getStudentSegregation.js';
export default async function (args, context) {
    return getStudentSegregation(args, {
        ...context,
        entities: {
            Assessment: prisma.assessment,
            OrgStudent: prisma.orgStudent,
            QRPaper: prisma.qRPaper,
            QuestionSet: prisma.questionSet,
            Attempt: prisma.attempt,
            Campaign: prisma.campaign,
            OrgConfig: prisma.orgConfig,
        },
    });
}
//# sourceMappingURL=getStudentSegregation.js.map