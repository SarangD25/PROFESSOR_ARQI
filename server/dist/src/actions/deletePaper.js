import { prisma } from 'wasp/server';
import { deletePaper } from '../../../../../src/server/actions/deletePaper.js';
export default async function (args, context) {
    return deletePaper(args, {
        ...context,
        entities: {
            QRPaper: prisma.qRPaper,
            QuestionSet: prisma.questionSet,
            Attempt: prisma.attempt,
        },
    });
}
//# sourceMappingURL=deletePaper.js.map