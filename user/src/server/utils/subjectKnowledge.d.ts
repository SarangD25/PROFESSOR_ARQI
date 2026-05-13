/**
 * Get subject knowledge for a given topic.
 * Falls back to a dynamically generated entry if the topic isn't in the predefined map.
 */
export function getSubjectKnowledge(topic: any): any;
export function pickRandomPYQs(examName: any, topic: any, count?: number): any[];
export function buildParaphrasePrompt(questions: any, examName: any, topic: any): string;
export const PYQ_BANK: {
    'GATE CS': {
        DBMS: {
            text: string;
            type: string;
            options: string[];
            correctAnswer: string;
            concept: string;
        }[];
        'Data Structures': {
            text: string;
            type: string;
            options: string[];
            correctAnswer: string;
            concept: string;
        }[];
        Algorithms: {
            text: string;
            type: string;
            options: string[];
            correctAnswer: string;
            concept: string;
        }[];
        'Operating Systems': {
            text: string;
            type: string;
            options: string[];
            correctAnswer: string;
            concept: string;
        }[];
        'Computer Networks': {
            text: string;
            type: string;
            options: string[];
            correctAnswer: string;
            concept: string;
        }[];
        'Theory of Computation': {
            text: string;
            type: string;
            options: string[];
            correctAnswer: string;
            concept: string;
        }[];
        'Compiler Design': {
            text: string;
            type: string;
            options: string[];
            correctAnswer: string;
            concept: string;
        }[];
        'Digital Logic': {
            text: string;
            type: string;
            options: string[];
            correctAnswer: string;
            concept: string;
        }[];
    };
    'GATE ECE': {
        'Network Theory': {
            text: string;
            type: string;
            options: string[];
            correctAnswer: string;
            concept: string;
        }[];
        'Signals and Systems': {
            text: string;
            type: string;
            options: string[];
            correctAnswer: string;
            concept: string;
        }[];
        'Digital Circuits': {
            text: string;
            type: string;
            options: string[];
            correctAnswer: string;
            concept: string;
        }[];
        Communications: {
            text: string;
            type: string;
            options: string[];
            correctAnswer: string;
            concept: string;
        }[];
        'Control Systems': {
            text: string;
            type: string;
            options: string[];
            correctAnswer: string;
            concept: string;
        }[];
    };
    'JEE Main': {
        'Physics - Mechanics': {
            text: string;
            type: string;
            options: string[];
            correctAnswer: string;
            concept: string;
        }[];
        'Physics - Electromagnetism': {
            text: string;
            type: string;
            options: string[];
            correctAnswer: string;
            concept: string;
        }[];
        'Chemistry - Organic': {
            text: string;
            type: string;
            options: string[];
            correctAnswer: string;
            concept: string;
        }[];
        'Chemistry - Inorganic': {
            text: string;
            type: string;
            options: string[];
            correctAnswer: string;
            concept: string;
        }[];
        'Mathematics - Calculus': {
            text: string;
            type: string;
            options: string[];
            correctAnswer: string;
            concept: string;
        }[];
        'Mathematics - Algebra': {
            text: string;
            type: string;
            options: string[];
            correctAnswer: string;
            concept: string;
        }[];
    };
    NEET: {
        'Biology - Botany': {
            text: string;
            type: string;
            options: string[];
            correctAnswer: string;
            concept: string;
        }[];
        'Biology - Zoology': {
            text: string;
            type: string;
            options: string[];
            correctAnswer: string;
            concept: string;
        }[];
        Physics: {
            text: string;
            type: string;
            options: string[];
            correctAnswer: string;
            concept: string;
        }[];
        Chemistry: {
            text: string;
            type: string;
            options: string[];
            correctAnswer: string;
            concept: string;
        }[];
    };
    'JEE Advanced': {
        Physics: {
            text: string;
            type: string;
            options: string[];
            correctAnswer: string;
            concept: string;
        }[];
        Chemistry: {
            text: string;
            type: string;
            options: string[];
            correctAnswer: string;
            concept: string;
        }[];
        Mathematics: {
            text: string;
            type: string;
            options: string[];
            correctAnswer: string;
            concept: string;
        }[];
    };
    UPSC: {
        History: {
            text: string;
            type: string;
            options: string[];
            correctAnswer: string;
            concept: string;
        }[];
        Geography: {
            text: string;
            type: string;
            options: string[];
            correctAnswer: string;
            concept: string;
        }[];
        Polity: {
            text: string;
            type: string;
            options: string[];
            correctAnswer: string;
            concept: string;
        }[];
        Economy: {
            text: string;
            type: string;
            options: string[];
            correctAnswer: string;
            concept: string;
        }[];
        'Science and Technology': {
            text: string;
            type: string;
            options: string[];
            correctAnswer: string;
            concept: string;
        }[];
    };
};
export default SUBJECT_KNOWLEDGE;
/**
 * Subject Knowledge Base
 * Maps exam topics to their actual concepts, subtopics, and example question styles.
 * This ensures the AI generates domain-accurate questions instead of generic ones.
 */
declare const SUBJECT_KNOWLEDGE: {
    'Mathematics - Calculus': {
        domain: string;
        subtopic: string;
        concepts: string[];
        questionStarters: string[];
        exampleQuestion: {
            text: string;
            type: string;
            options: string[];
            correctAnswer: string;
            marks: number;
            negativeMarks: number;
            concept: string;
        };
        forbiddenContent: string[];
    };
    'Mathematics - Algebra': {
        domain: string;
        subtopic: string;
        concepts: string[];
        questionStarters: string[];
        exampleQuestion: {
            text: string;
            type: string;
            options: string[];
            correctAnswer: string;
            marks: number;
            negativeMarks: number;
            concept: string;
        };
        forbiddenContent: string[];
    };
    'Mathematics - Coordinate Geometry': {
        domain: string;
        subtopic: string;
        concepts: string[];
        questionStarters: string[];
        exampleQuestion: {
            text: string;
            type: string;
            options: string[];
            correctAnswer: string;
            marks: number;
            negativeMarks: number;
            concept: string;
        };
        forbiddenContent: string[];
    };
    'Mathematics - Trigonometry': {
        domain: string;
        subtopic: string;
        concepts: string[];
        questionStarters: string[];
        exampleQuestion: {
            text: string;
            type: string;
            options: string[];
            correctAnswer: string;
            marks: number;
            negativeMarks: number;
            concept: string;
        };
        forbiddenContent: string[];
    };
    'Mathematics - Probability and Statistics': {
        domain: string;
        subtopic: string;
        concepts: string[];
        questionStarters: string[];
        exampleQuestion: {
            text: string;
            type: string;
            options: string[];
            correctAnswer: string;
            marks: number;
            negativeMarks: number;
            concept: string;
        };
        forbiddenContent: string[];
    };
    'Mathematics - Vectors and 3D Geometry': {
        domain: string;
        subtopic: string;
        concepts: string[];
        questionStarters: string[];
        exampleQuestion: {
            text: string;
            type: string;
            options: string[];
            correctAnswer: string;
            marks: number;
            negativeMarks: number;
            concept: string;
        };
        forbiddenContent: string[];
    };
    'Physics - Mechanics': {
        domain: string;
        subtopic: string;
        concepts: string[];
        questionStarters: string[];
        exampleQuestion: {
            text: string;
            type: string;
            options: string[];
            correctAnswer: string;
            marks: number;
            negativeMarks: number;
            concept: string;
        };
        forbiddenContent: string[];
    };
    'Physics - Electrodynamics': {
        domain: string;
        subtopic: string;
        concepts: string[];
        questionStarters: string[];
        exampleQuestion: {
            text: string;
            type: string;
            options: string[];
            correctAnswer: string;
            marks: number;
            negativeMarks: number;
            concept: string;
        };
        forbiddenContent: string[];
    };
    'Physics - Optics': {
        domain: string;
        subtopic: string;
        concepts: string[];
        questionStarters: string[];
        exampleQuestion: {
            text: string;
            type: string;
            options: string[];
            correctAnswer: string;
            marks: number;
            negativeMarks: number;
            concept: string;
        };
        forbiddenContent: string[];
    };
    'Physics - Modern Physics': {
        domain: string;
        subtopic: string;
        concepts: string[];
        questionStarters: string[];
        exampleQuestion: {
            text: string;
            type: string;
            options: string[];
            correctAnswer: string;
            marks: number;
            negativeMarks: number;
            concept: string;
        };
        forbiddenContent: string[];
    };
    'Physics - Thermodynamics': {
        domain: string;
        subtopic: string;
        concepts: string[];
        questionStarters: string[];
        exampleQuestion: {
            text: string;
            type: string;
            options: string[];
            correctAnswer: string;
            marks: number;
            negativeMarks: number;
            concept: string;
        };
        forbiddenContent: string[];
    };
    'Physics - Waves and Oscillations': {
        domain: string;
        subtopic: string;
        concepts: string[];
        questionStarters: string[];
        exampleQuestion: {
            text: string;
            type: string;
            options: string[];
            correctAnswer: string;
            marks: number;
            negativeMarks: number;
            concept: string;
        };
        forbiddenContent: string[];
    };
    'Chemistry - Organic': {
        domain: string;
        subtopic: string;
        concepts: string[];
        questionStarters: string[];
        exampleQuestion: {
            text: string;
            type: string;
            options: string[];
            correctAnswer: string;
            marks: number;
            negativeMarks: number;
            concept: string;
        };
        forbiddenContent: string[];
    };
    'Chemistry - Inorganic': {
        domain: string;
        subtopic: string;
        concepts: string[];
        questionStarters: string[];
        exampleQuestion: {
            text: string;
            type: string;
            options: string[];
            correctAnswer: string;
            marks: number;
            negativeMarks: number;
            concept: string;
        };
        forbiddenContent: string[];
    };
    'Chemistry - Physical': {
        domain: string;
        subtopic: string;
        concepts: string[];
        questionStarters: string[];
        exampleQuestion: {
            text: string;
            type: string;
            options: string[];
            correctAnswer: string;
            marks: number;
            negativeMarks: number;
            concept: string;
        };
        forbiddenContent: string[];
    };
    'Theory of Computation': {
        domain: string;
        subtopic: string;
        concepts: string[];
        questionStarters: string[];
        exampleQuestion: {
            text: string;
            type: string;
            options: string[];
            correctAnswer: string;
            marks: number;
            negativeMarks: number;
            concept: string;
        };
        forbiddenContent: string[];
    };
    'Operating Systems': {
        domain: string;
        subtopic: string;
        concepts: string[];
        questionStarters: string[];
        exampleQuestion: {
            text: string;
            type: string;
            options: string[];
            correctAnswer: string;
            marks: number;
            negativeMarks: number;
            concept: string;
        };
        forbiddenContent: string[];
    };
    Algorithms: {
        domain: string;
        subtopic: string;
        concepts: string[];
        questionStarters: string[];
        exampleQuestion: {
            text: string;
            type: string;
            options: string[];
            correctAnswer: string;
            marks: number;
            negativeMarks: number;
            concept: string;
        };
        forbiddenContent: string[];
    };
    DBMS: {
        domain: string;
        subtopic: string;
        concepts: string[];
        questionStarters: string[];
        exampleQuestion: {
            text: string;
            type: string;
            options: string[];
            correctAnswer: string;
            marks: number;
            negativeMarks: number;
            concept: string;
        };
        forbiddenContent: string[];
    };
    'Computer Networks': {
        domain: string;
        subtopic: string;
        concepts: string[];
        questionStarters: string[];
        exampleQuestion: {
            text: string;
            type: string;
            options: string[];
            correctAnswer: string;
            marks: number;
            negativeMarks: number;
            concept: string;
        };
        forbiddenContent: string[];
    };
    'Compiler Design': {
        domain: string;
        subtopic: string;
        concepts: string[];
        questionStarters: string[];
        exampleQuestion: {
            text: string;
            type: string;
            options: string[];
            correctAnswer: string;
            marks: number;
            negativeMarks: number;
            concept: string;
        };
        forbiddenContent: string[];
    };
    'Digital Logic': {
        domain: string;
        subtopic: string;
        concepts: string[];
        questionStarters: string[];
        exampleQuestion: {
            text: string;
            type: string;
            options: string[];
            correctAnswer: string;
            marks: number;
            negativeMarks: number;
            concept: string;
        };
        forbiddenContent: string[];
    };
    'Data Structures': {
        domain: string;
        subtopic: string;
        concepts: string[];
        questionStarters: string[];
        exampleQuestion: {
            text: string;
            type: string;
            options: string[];
            correctAnswer: string;
            marks: number;
            negativeMarks: number;
            concept: string;
        };
        forbiddenContent: string[];
    };
    'Computer Architecture': {
        domain: string;
        subtopic: string;
        concepts: string[];
        questionStarters: string[];
        exampleQuestion: {
            text: string;
            type: string;
            options: string[];
            correctAnswer: string;
            marks: number;
            negativeMarks: number;
            concept: string;
        };
        forbiddenContent: string[];
    };
    'Discrete Mathematics': {
        domain: string;
        subtopic: string;
        concepts: string[];
        questionStarters: string[];
        exampleQuestion: {
            text: string;
            type: string;
            options: string[];
            correctAnswer: string;
            marks: number;
            negativeMarks: number;
            concept: string;
        };
        forbiddenContent: string[];
    };
    'Software Engineering': {
        domain: string;
        subtopic: string;
        concepts: string[];
        questionStarters: string[];
        exampleQuestion: {
            text: string;
            type: string;
            options: string[];
            correctAnswer: string;
            marks: number;
            negativeMarks: number;
            concept: string;
        };
        forbiddenContent: string[];
    };
    'Biology - Botany': {
        domain: string;
        subtopic: string;
        concepts: string[];
        questionStarters: string[];
        exampleQuestion: {
            text: string;
            type: string;
            options: string[];
            correctAnswer: string;
            marks: number;
            negativeMarks: number;
            concept: string;
        };
        forbiddenContent: string[];
    };
    'Biology - Zoology': {
        domain: string;
        subtopic: string;
        concepts: string[];
        questionStarters: string[];
        exampleQuestion: {
            text: string;
            type: string;
            options: string[];
            correctAnswer: string;
            marks: number;
            negativeMarks: number;
            concept: string;
        };
        forbiddenContent: string[];
    };
    History: {
        domain: string;
        subtopic: string;
        concepts: string[];
        questionStarters: string[];
        exampleQuestion: {
            text: string;
            type: string;
            options: string[];
            correctAnswer: string;
            marks: number;
            negativeMarks: number;
            concept: string;
        };
        forbiddenContent: string[];
    };
    Geography: {
        domain: string;
        subtopic: string;
        concepts: string[];
        questionStarters: string[];
        exampleQuestion: {
            text: string;
            type: string;
            options: string[];
            correctAnswer: string;
            marks: number;
            negativeMarks: number;
            concept: string;
        };
        forbiddenContent: string[];
    };
    Polity: {
        domain: string;
        subtopic: string;
        concepts: string[];
        questionStarters: string[];
        exampleQuestion: {
            text: string;
            type: string;
            options: string[];
            correctAnswer: string;
            marks: number;
            negativeMarks: number;
            concept: string;
        };
        forbiddenContent: string[];
    };
    Economy: {
        domain: string;
        subtopic: string;
        concepts: string[];
        questionStarters: string[];
        exampleQuestion: {
            text: string;
            type: string;
            options: string[];
            correctAnswer: string;
            marks: number;
            negativeMarks: number;
            concept: string;
        };
        forbiddenContent: string[];
    };
    'Science and Technology': {
        domain: string;
        subtopic: string;
        concepts: string[];
        questionStarters: string[];
        exampleQuestion: {
            text: string;
            type: string;
            options: string[];
            correctAnswer: string;
            marks: number;
            negativeMarks: number;
            concept: string;
        };
        forbiddenContent: string[];
    };
    'General Awareness': {
        domain: string;
        subtopic: string;
        concepts: string[];
        questionStarters: string[];
        exampleQuestion: {
            text: string;
            type: string;
            options: string[];
            correctAnswer: string;
            marks: number;
            negativeMarks: number;
            concept: string;
        };
        forbiddenContent: string[];
    };
    'Quantitative Aptitude': {
        domain: string;
        subtopic: string;
        concepts: string[];
        questionStarters: string[];
        exampleQuestion: {
            text: string;
            type: string;
            options: string[];
            correctAnswer: string;
            marks: number;
            negativeMarks: number;
            concept: string;
        };
        forbiddenContent: string[];
    };
    Reasoning: {
        domain: string;
        subtopic: string;
        concepts: string[];
        questionStarters: string[];
        exampleQuestion: {
            text: string;
            type: string;
            options: string[];
            correctAnswer: string;
            marks: number;
            negativeMarks: number;
            concept: string;
        };
        forbiddenContent: string[];
    };
    'Quantitative Ability': {
        domain: string;
        subtopic: string;
        concepts: string[];
        questionStarters: string[];
        exampleQuestion: null;
        forbiddenContent: string[];
    };
    'Verbal Ability': {
        domain: string;
        subtopic: string;
        concepts: string[];
        questionStarters: string[];
        exampleQuestion: null;
        forbiddenContent: string[];
    };
    'Data Interpretation': {
        domain: string;
        subtopic: string;
        concepts: string[];
        questionStarters: string[];
        exampleQuestion: null;
        forbiddenContent: string[];
    };
    'Logical Reasoning': {
        domain: string;
        subtopic: string;
        concepts: string[];
        questionStarters: string[];
        exampleQuestion: null;
        forbiddenContent: string[];
    };
    'Network Theory': {
        domain: string;
        subtopic: string;
        concepts: string[];
        questionStarters: string[];
        exampleQuestion: {
            text: string;
            type: string;
            options: string[];
            correctAnswer: string;
            marks: number;
            negativeMarks: number;
            concept: string;
        };
        forbiddenContent: string[];
    };
    'Signals and Systems': {
        domain: string;
        subtopic: string;
        concepts: string[];
        questionStarters: string[];
        exampleQuestion: {
            text: string;
            type: string;
            options: string[];
            correctAnswer: string;
            marks: number;
            negativeMarks: number;
            concept: string;
        };
        forbiddenContent: string[];
    };
    'Digital Circuits': {
        domain: string;
        subtopic: string;
        concepts: string[];
        questionStarters: string[];
        exampleQuestion: {
            text: string;
            type: string;
            options: string[];
            correctAnswer: string;
            marks: number;
            negativeMarks: number;
            concept: string;
        };
        forbiddenContent: string[];
    };
    Communications: {
        domain: string;
        subtopic: string;
        concepts: string[];
        questionStarters: string[];
        exampleQuestion: {
            text: string;
            type: string;
            options: string[];
            correctAnswer: string;
            marks: number;
            negativeMarks: number;
            concept: string;
        };
        forbiddenContent: string[];
    };
    'Control Systems': {
        domain: string;
        subtopic: string;
        concepts: string[];
        questionStarters: string[];
        exampleQuestion: {
            text: string;
            type: string;
            options: string[];
            correctAnswer: string;
            marks: number;
            negativeMarks: number;
            concept: string;
        };
        forbiddenContent: string[];
    };
    'Physics - Electromagnetism': {
        domain: string;
        subtopic: string;
        concepts: string[];
        questionStarters: string[];
        exampleQuestion: {
            text: string;
            type: string;
            options: string[];
            correctAnswer: string;
            marks: number;
            negativeMarks: number;
            concept: string;
        };
        forbiddenContent: string[];
    };
    Physics: {
        domain: string;
        subtopic: string;
        concepts: string[];
        questionStarters: string[];
        exampleQuestion: null;
        forbiddenContent: string[];
    };
    Chemistry: {
        domain: string;
        subtopic: string;
        concepts: string[];
        questionStarters: string[];
        exampleQuestion: null;
        forbiddenContent: string[];
    };
    Mathematics: {
        domain: string;
        subtopic: string;
        concepts: string[];
        questionStarters: string[];
        exampleQuestion: null;
        forbiddenContent: string[];
    };
    English: {
        domain: string;
        subtopic: string;
        concepts: string[];
        questionStarters: string[];
        exampleQuestion: {
            text: string;
            type: string;
            options: string[];
            correctAnswer: string;
            marks: number;
            negativeMarks: number;
            concept: string;
        };
        forbiddenContent: string[];
    };
};
