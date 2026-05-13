import { prisma } from 'wasp/server';
import { submitAttempt } from '../../../../../src/server/actions/submitAttempt.js';
export default async function (args, context) {
    return submitAttempt(args, {
        ...context,
        entities: {
            Attempt: prisma.attempt,
            QuestionSet: prisma.questionSet,
            WeakArea: prisma.weakArea,
            QRPaper: prisma.qRPaper,
        },
    });
}
//# sourceMappingURL=submitAttempt.js.map