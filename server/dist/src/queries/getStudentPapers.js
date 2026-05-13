import { prisma } from 'wasp/server';
import { getStudentPapers } from '../../../../../src/server/queries/getStudentPapers.js';
export default async function (args, context) {
    return getStudentPapers(args, {
        ...context,
        entities: {
            QRPaper: prisma.qRPaper,
            QuestionSet: prisma.questionSet,
            Attempt: prisma.attempt,
            Campaign: prisma.campaign,
        },
    });
}
//# sourceMappingURL=getStudentPapers.js.map