/**
 * Subject Knowledge Base
 * Maps exam topics to their actual concepts, subtopics, and example question styles.
 * This ensures the AI generates domain-accurate questions instead of generic ones.
 */

const SUBJECT_KNOWLEDGE = {
  // ─────────────────── MATHEMATICS ───────────────────
  'Mathematics - Calculus': {
    domain: 'Mathematics',
    subtopic: 'Calculus',
    concepts: [
      'Limits and Continuity', 'L\'Hôpital\'s Rule', 'Squeeze Theorem',
      'Differentiability', 'Chain Rule', 'Implicit Differentiation',
      'Applications of Derivatives (Maxima/Minima, Rate of Change, Tangent/Normal)',
      'Mean Value Theorem', 'Rolle\'s Theorem',
      'Indefinite Integrals', 'Integration by Parts', 'Integration by Substitution',
      'Partial Fractions', 'Definite Integrals', 'Properties of Definite Integrals',
      'Area under Curves', 'Differential Equations (First Order, Linear, Homogeneous)',
      'Order and Degree of Differential Equations'
    ],
    questionStarters: [
      'Evaluate the limit:', 'Find dy/dx if', 'Evaluate the integral:',
      'Find the area bounded by', 'Solve the differential equation:',
      'If f(x) is continuous on [a,b] and differentiable on (a,b), then',
      'The maximum value of f(x) = ... on the interval',
      'Find the value of the definite integral'
    ],
    exampleQuestion: {
      text: "If f(x) = ∫₀ˣ (sin²t)/(t) dt, then lim(x→0) f(x)/x² equals:",
      type: "MCQ",
      options: ["A. 1/2", "B. 1", "C. 2", "D. 0"],
      correctAnswer: "A",
      marks: 2,
      negativeMarks: 0.67,
      concept: "Definite Integrals and Limits"
    },
    forbiddenContent: ['programming', 'code', 'algorithm', 'data structure', 'software', 'pipeline', 'O(n)', 'loop', 'array', 'function call', 'compiler']
  },

  'Mathematics - Algebra': {
    domain: 'Mathematics',
    subtopic: 'Algebra',
    concepts: [
      'Quadratic Equations', 'Complex Numbers', 'Sequences and Series',
      'Arithmetic Progression', 'Geometric Progression', 'Harmonic Progression',
      'Binomial Theorem', 'Permutations and Combinations',
      'Matrices and Determinants', 'Mathematical Induction',
      'Partial Fractions', 'Logarithms', 'Inequalities',
      'Theory of Equations', 'Sets and Relations'
    ],
    questionStarters: [
      'If the roots of the equation', 'Find the sum of the series',
      'The number of ways to', 'If A is a 3×3 matrix such that',
      'The value of the determinant', 'If z is a complex number such that',
      'In the expansion of (1+x)ⁿ', 'Find the coefficient of x^r in'
    ],
    exampleQuestion: {
      text: "If the sum of the first n terms of an A.P. is given by Sₙ = 3n² + 5n, then the common difference is:",
      type: "MCQ",
      options: ["A. 3", "B. 5", "C. 6", "D. 8"],
      correctAnswer: "C",
      marks: 2,
      negativeMarks: 0.67,
      concept: "Arithmetic Progression"
    },
    forbiddenContent: ['programming', 'code', 'algorithm', 'data structure', 'software', 'pipeline', 'O(n)', 'loop', 'array']
  },

  'Mathematics - Coordinate Geometry': {
    domain: 'Mathematics',
    subtopic: 'Coordinate Geometry',
    concepts: [
      'Straight Lines', 'Circles', 'Parabola', 'Ellipse', 'Hyperbola',
      'Pair of Straight Lines', 'Distance Formula', 'Section Formula',
      'Locus', 'Conic Sections', 'Tangent and Normal to Conics',
      'Chord of Contact', 'Director Circle'
    ],
    questionStarters: [
      'The equation of the tangent to the parabola', 'A circle passes through the points',
      'The eccentricity of the ellipse', 'The locus of a point such that',
      'If the line y = mx + c is a tangent to'
    ],
    exampleQuestion: {
      text: "The length of the latus rectum of the parabola y² = 12x is:",
      type: "MCQ",
      options: ["A. 3", "B. 6", "C. 12", "D. 24"],
      correctAnswer: "C",
      marks: 2,
      negativeMarks: 0.67,
      concept: "Parabola"
    },
    forbiddenContent: ['programming', 'code', 'algorithm', 'data structure', 'software']
  },

  'Mathematics - Trigonometry': {
    domain: 'Mathematics',
    subtopic: 'Trigonometry',
    concepts: [
      'Trigonometric Ratios and Identities', 'Trigonometric Equations',
      'Inverse Trigonometric Functions', 'Properties of Triangles',
      'Heights and Distances', 'Sine Rule', 'Cosine Rule',
      'Multiple and Sub-multiple Angles', 'Sum and Product Formulas'
    ],
    questionStarters: [
      'The general solution of the equation', 'If sin⁻¹(x) + cos⁻¹(y) =',
      'In triangle ABC, if a = 5, b = 7, C = 60°, then',
      'The value of cos²(π/8) + cos²(3π/8) is'
    ],
    exampleQuestion: {
      text: "The number of solutions of sin²x - 2cosx + 1/4 = 0 in [0, 2π] is:",
      type: "MCQ",
      options: ["A. 1", "B. 2", "C. 3", "D. 4"],
      correctAnswer: "B",
      marks: 2,
      negativeMarks: 0.67,
      concept: "Trigonometric Equations"
    },
    forbiddenContent: ['programming', 'code', 'algorithm', 'data structure', 'software']
  },

  'Mathematics - Probability and Statistics': {
    domain: 'Mathematics',
    subtopic: 'Probability and Statistics',
    concepts: [
      'Probability (Classical, Conditional, Bayes\' Theorem)',
      'Random Variables', 'Probability Distribution',
      'Mean, Median, Mode', 'Variance and Standard Deviation',
      'Binomial Distribution', 'Independent Events', 'Mutually Exclusive Events'
    ],
    questionStarters: [
      'A bag contains', 'If P(A) = 0.4 and P(B) = 0.5', 'Two dice are thrown simultaneously',
      'If X is a random variable with', 'The mean and variance of a binomial distribution are'
    ],
    exampleQuestion: {
      text: "If two events A and B are such that P(A) = 1/2, P(B) = 1/3, and P(A∩B) = 1/4, then P(A|B) equals:",
      type: "MCQ",
      options: ["A. 1/4", "B. 3/4", "C. 1/2", "D. 2/3"],
      correctAnswer: "B",
      marks: 2,
      negativeMarks: 0.67,
      concept: "Conditional Probability"
    },
    forbiddenContent: ['programming', 'code', 'algorithm', 'data structure', 'software']
  },

  'Mathematics - Vectors and 3D Geometry': {
    domain: 'Mathematics',
    subtopic: 'Vectors and 3D Geometry',
    concepts: [
      'Vector Algebra (Addition, Dot Product, Cross Product)',
      'Scalar Triple Product', 'Vector Triple Product',
      'Direction Cosines and Direction Ratios',
      'Equation of a Line in 3D', 'Equation of a Plane',
      'Angle between Lines and Planes', 'Shortest Distance between Lines'
    ],
    questionStarters: [
      'If vectors a and b are such that', 'The angle between the planes',
      'The shortest distance between the lines', 'The equation of the plane passing through',
      'If [a b c] = 5, then'
    ],
    exampleQuestion: {
      text: "If |a⃗| = 2, |b⃗| = 3, and a⃗·b⃗ = 3, then the value of |a⃗ × b⃗| is:",
      type: "MCQ",
      options: ["A. 3", "B. 3√3", "C. √3", "D. 6"],
      correctAnswer: "B",
      marks: 2,
      negativeMarks: 0.67,
      concept: "Cross Product"
    },
    forbiddenContent: ['programming', 'code', 'algorithm', 'data structure', 'software']
  },

  // ─────────────────── PHYSICS ───────────────────
  'Physics - Mechanics': {
    domain: 'Physics',
    subtopic: 'Mechanics',
    concepts: [
      'Kinematics (1D and 2D)', 'Newton\'s Laws of Motion', 'Friction',
      'Work, Energy and Power', 'Conservation of Momentum',
      'Rotational Motion', 'Moment of Inertia', 'Gravitation',
      'Simple Harmonic Motion', 'Elasticity', 'Fluid Mechanics',
      'Centre of Mass', 'Projectile Motion', 'Circular Motion'
    ],
    questionStarters: [
      'A block of mass m is placed on', 'A particle is projected with velocity',
      'A disc of radius R and mass M', 'Two bodies of masses m₁ and m₂',
      'A spring of spring constant k', 'A satellite orbits the Earth at',
      'A ball is thrown vertically upward with'
    ],
    exampleQuestion: {
      text: "A block of mass 2 kg slides down a rough inclined plane of inclination 30° with uniform velocity. The coefficient of kinetic friction is:",
      type: "MCQ",
      options: ["A. 1/√3", "B. √3", "C. √3/2", "D. 2/√3"],
      correctAnswer: "A",
      marks: 2,
      negativeMarks: 0.67,
      concept: "Friction on Inclined Plane"
    },
    forbiddenContent: ['programming', 'code', 'algorithm', 'data structure', 'software', 'pipeline']
  },

  'Physics - Electrodynamics': {
    domain: 'Physics',
    subtopic: 'Electrodynamics',
    concepts: [
      'Coulomb\'s Law', 'Electric Field and Potential', 'Gauss\'s Law',
      'Capacitance', 'Current Electricity (Ohm\'s Law, Kirchhoff\'s Laws)',
      'Wheatstone Bridge', 'Potentiometer', 'Magnetic Effects of Current',
      'Biot-Savart Law', 'Ampere\'s Law', 'Electromagnetic Induction',
      'Faraday\'s Law', 'AC Circuits', 'Electromagnetic Waves'
    ],
    questionStarters: [
      'Two charges q₁ and q₂ are placed', 'A parallel plate capacitor with',
      'In the circuit shown', 'A long straight wire carrying current',
      'A coil of N turns and area A', 'In an LCR circuit'
    ],
    exampleQuestion: {
      text: "A parallel plate capacitor with plate area A and separation d has capacitance C. If a dielectric slab of thickness d/2 and dielectric constant K is inserted, the new capacitance is:",
      type: "MCQ",
      options: ["A. 2KC/(K+1)", "B. KC/(K+1)", "C. 2KC/(2K+1)", "D. KC/(2K+1)"],
      correctAnswer: "A",
      marks: 2,
      negativeMarks: 0.67,
      concept: "Capacitance with Dielectrics"
    },
    forbiddenContent: ['programming', 'code', 'algorithm', 'data structure', 'software']
  },

  'Physics - Optics': {
    domain: 'Physics',
    subtopic: 'Optics',
    concepts: [
      'Reflection and Refraction', 'Total Internal Reflection',
      'Lenses (Thin Lens Formula)', 'Mirrors', 'Prism',
      'Young\'s Double Slit Experiment', 'Diffraction', 'Polarization',
      'Optical Instruments', 'Wave Optics', 'Interference'
    ],
    questionStarters: [
      'A convex lens of focal length', 'In Young\'s double slit experiment',
      'A ray of light passes through a prism', 'The critical angle for',
      'A concave mirror of radius of curvature'
    ],
    exampleQuestion: {
      text: "In Young's double slit experiment, the fringe width is β. If the wavelength of light is doubled and the slit separation is halved, the new fringe width is:",
      type: "MCQ",
      options: ["A. β", "B. 2β", "C. 4β", "D. β/2"],
      correctAnswer: "C",
      marks: 2,
      negativeMarks: 0.67,
      concept: "Young's Double Slit Experiment"
    },
    forbiddenContent: ['programming', 'code', 'algorithm', 'data structure', 'software']
  },

  'Physics - Modern Physics': {
    domain: 'Physics',
    subtopic: 'Modern Physics',
    concepts: [
      'Photoelectric Effect', 'Bohr Model of Hydrogen Atom',
      'de Broglie Wavelength', 'X-rays', 'Nuclear Physics',
      'Radioactivity (Alpha, Beta, Gamma Decay)', 'Mass-Energy Equivalence',
      'Nuclear Fission and Fusion', 'Semiconductor Physics', 'Logic Gates'
    ],
    questionStarters: [
      'When light of wavelength λ', 'In the Bohr model of hydrogen atom',
      'The half-life of a radioactive element', 'The binding energy per nucleon',
      'In a photoelectric experiment'
    ],
    exampleQuestion: {
      text: "The de Broglie wavelength of an electron accelerated through a potential difference of V volts is:",
      type: "MCQ",
      options: ["A. 1.227/√V nm", "B. 12.27/√V Å", "C. 0.1227/√V nm", "D. 122.7/√V Å"],
      correctAnswer: "B",
      marks: 2,
      negativeMarks: 0.67,
      concept: "de Broglie Wavelength"
    },
    forbiddenContent: ['programming', 'code', 'algorithm', 'data structure', 'software']
  },

  'Physics - Thermodynamics': {
    domain: 'Physics',
    subtopic: 'Thermodynamics',
    concepts: [
      'Thermal Expansion', 'Calorimetry', 'Heat Transfer (Conduction, Convection, Radiation)',
      'Kinetic Theory of Gases', 'Laws of Thermodynamics',
      'Carnot Engine', 'Entropy', 'Specific Heat Capacities (Cp, Cv)',
      'Isothermal and Adiabatic Processes', 'Stefan\'s Law', 'Newton\'s Law of Cooling'
    ],
    questionStarters: [
      'An ideal gas undergoes', 'The efficiency of a Carnot engine operating between',
      'A metal rod of length L', 'Two moles of an ideal gas at',
      'A black body at temperature T'
    ],
    exampleQuestion: {
      text: "An ideal gas undergoes an isothermal expansion at temperature T. If the volume doubles, the work done by the gas is:",
      type: "MCQ",
      options: ["A. nRT", "B. nRT ln2", "C. 2nRT", "D. nRT/2"],
      correctAnswer: "B",
      marks: 2,
      negativeMarks: 0.67,
      concept: "Isothermal Process"
    },
    forbiddenContent: ['programming', 'code', 'algorithm', 'data structure', 'software']
  },

  'Physics - Waves and Oscillations': {
    domain: 'Physics',
    subtopic: 'Waves and Oscillations',
    concepts: [
      'Simple Harmonic Motion', 'Damped and Forced Oscillations',
      'Superposition of Waves', 'Standing Waves', 'Beats',
      'Doppler Effect', 'String Vibrations', 'Sound Waves',
      'Resonance', 'Speed of Sound'
    ],
    questionStarters: [
      'A particle executes SHM with amplitude', 'A string of length L is fixed at both ends',
      'Two tuning forks of frequencies', 'A source of sound is moving towards',
      'The fundamental frequency of a closed organ pipe'
    ],
    exampleQuestion: {
      text: "A particle executes SHM with amplitude A and time period T. The time taken to travel from x = 0 to x = A/2 is:",
      type: "MCQ",
      options: ["A. T/12", "B. T/6", "C. T/4", "D. T/8"],
      correctAnswer: "A",
      marks: 2,
      negativeMarks: 0.67,
      concept: "Simple Harmonic Motion"
    },
    forbiddenContent: ['programming', 'code', 'algorithm', 'data structure', 'software']
  },

  // ─────────────────── CHEMISTRY ───────────────────
  'Chemistry - Organic': {
    domain: 'Chemistry',
    subtopic: 'Organic Chemistry',
    concepts: [
      'IUPAC Nomenclature', 'Isomerism (Structural, Stereoisomerism)',
      'General Organic Chemistry (Inductive, Resonance, Hyperconjugation)',
      'Hydrocarbons (Alkanes, Alkenes, Alkynes)', 'Aromatic Compounds',
      'Alcohols, Phenols and Ethers', 'Aldehydes and Ketones',
      'Carboxylic Acids and Derivatives', 'Amines', 'Biomolecules',
      'Polymers', 'Named Reactions (Aldol, Cannizzaro, Kolbe, etc.)'
    ],
    questionStarters: [
      'The major product formed when', 'Identify the reagent for converting',
      'The IUPAC name of the compound', 'Which of the following shows',
      'The correct order of reactivity', 'In the following reaction sequence'
    ],
    exampleQuestion: {
      text: "The major product of dehydration of 2-methylcyclohexanol with conc. H₂SO₄ is:",
      type: "MCQ",
      options: ["A. 1-methylcyclohexene", "B. 2-methylcyclohexene", "C. methylenecyclohexane", "D. 3-methylcyclohexene"],
      correctAnswer: "A",
      marks: 2,
      negativeMarks: 0.67,
      concept: "Elimination Reactions"
    },
    forbiddenContent: ['programming', 'code', 'algorithm', 'data structure', 'software']
  },

  'Chemistry - Inorganic': {
    domain: 'Chemistry',
    subtopic: 'Inorganic Chemistry',
    concepts: [
      'Periodic Table and Periodicity', 'Chemical Bonding (Ionic, Covalent, Metallic)',
      'VSEPR Theory', 'Molecular Orbital Theory', 'Coordination Compounds',
      's-Block and p-Block Elements', 'd-Block and f-Block Elements',
      'Metallurgy', 'Qualitative Analysis', 'Hydrogen and its Compounds'
    ],
    questionStarters: [
      'Which of the following has the highest', 'The hybridization of the central atom in',
      'The magnetic moment of', 'The IUPAC name of the complex',
      'The correct order of ionic radii', 'Which of the following ores'
    ],
    exampleQuestion: {
      text: "The IUPAC name of [Co(NH₃)₄Cl₂]Cl is:",
      type: "MCQ",
      options: ["A. Tetraamminedichloridocobalt(III) chloride", "B. Dichloridotetraamminecobalt(III) chloride", "C. Tetraamminedichlorocobalt(III) chloride", "D. Cobalt tetraammine dichloride chloride"],
      correctAnswer: "A",
      marks: 2,
      negativeMarks: 0.67,
      concept: "Coordination Compounds"
    },
    forbiddenContent: ['programming', 'code', 'algorithm', 'data structure', 'software']
  },

  'Chemistry - Physical': {
    domain: 'Chemistry',
    subtopic: 'Physical Chemistry',
    concepts: [
      'Mole Concept and Stoichiometry', 'Atomic Structure',
      'Chemical Thermodynamics (Enthalpy, Entropy, Gibbs Energy)',
      'Chemical Equilibrium', 'Ionic Equilibrium (pH, Buffer, Solubility Product)',
      'Chemical Kinetics (Rate Laws, Order, Arrhenius Equation)',
      'Electrochemistry (Nernst Equation, Electrolysis, Galvanic Cells)',
      'Solutions (Raoult\'s Law, Colligative Properties)',
      'Surface Chemistry', 'Solid State'
    ],
    questionStarters: [
      'For the reaction A → B, the rate constant', 'The pH of a 0.01 M solution of',
      'The EMF of the cell', 'The boiling point elevation of',
      'For an endothermic reaction', 'The molar conductivity at infinite dilution'
    ],
    exampleQuestion: {
      text: "For a first-order reaction, the time required for 99.9% completion is approximately:",
      type: "MCQ",
      options: ["A. 5 times the half-life", "B. 10 times the half-life", "C. 7 times the half-life", "D. 20 times the half-life"],
      correctAnswer: "B",
      marks: 2,
      negativeMarks: 0.67,
      concept: "Chemical Kinetics"
    },
    forbiddenContent: ['programming', 'code', 'algorithm', 'data structure', 'software']
  },

  // ─────────────────── COMPUTER SCIENCE ───────────────────
  'Theory of Computation': {
    domain: 'Computer Science',
    subtopic: 'Theory of Computation',
    concepts: [
      'Finite Automata (DFA, NFA)', 'Regular Expressions', 'Regular Languages',
      'Pumping Lemma for Regular Languages', 'Context-Free Grammars (CFG)',
      'Pushdown Automata (PDA)', 'Chomsky Normal Form', 'CYK Algorithm',
      'Pumping Lemma for CFLs', 'Turing Machines', 'Decidability',
      'Halting Problem', 'Reducibility', 'Rice\'s Theorem',
      'Complexity Classes (P, NP, NP-Complete)', 'NP-Completeness'
    ],
    questionStarters: [
      'Consider the language L =', 'A DFA with minimum states for',
      'The regular expression for', 'Which of the following is decidable',
      'A pushdown automaton that accepts', 'The grammar S →'
    ],
    exampleQuestion: {
      text: "The minimum number of states in a DFA that accepts all binary strings where the number of 1s is divisible by 3 is:",
      type: "MCQ",
      options: ["A. 3", "B. 4", "C. 5", "D. 6"],
      correctAnswer: "A",
      marks: 2,
      negativeMarks: 0.67,
      concept: "DFA Design"
    },
    forbiddenContent: ['calculus', 'integral', 'derivative', 'chemical', 'thermodynamics', 'optics', 'kinematics']
  },

  'Operating Systems': {
    domain: 'Computer Science',
    subtopic: 'Operating Systems',
    concepts: [
      'Process Scheduling (FCFS, SJF, Round Robin, Priority)',
      'Process Synchronization', 'Deadlock', 'Memory Management',
      'Virtual Memory', 'Page Replacement (FIFO, LRU, Optimal)',
      'Disk Scheduling', 'File Systems', 'Threads', 'Semaphores and Mutex'
    ],
    questionStarters: [
      'Consider a set of processes with burst times', 'In a system with',
      'A page reference string', 'Using the Banker\'s algorithm'
    ],
    exampleQuestion: {
      text: "Given the page reference string 7,0,1,2,0,3,0,4,2,3 with 3 frames using FIFO, the number of page faults is:",
      type: "MCQ",
      options: ["A. 6", "B. 7", "C. 8", "D. 9"],
      correctAnswer: "A",
      marks: 2,
      negativeMarks: 0.67,
      concept: "Page Replacement"
    },
    forbiddenContent: ['calculus', 'integral', 'derivative', 'chemical', 'thermodynamics', 'optics']
  },

  'Algorithms': {
    domain: 'Computer Science',
    subtopic: 'Algorithms',
    concepts: [
      'Time Complexity Analysis', 'Sorting Algorithms', 'Graph Algorithms',
      'Dynamic Programming', 'Greedy Algorithms', 'Divide and Conquer',
      'Shortest Path (Dijkstra, Bellman-Ford, Floyd-Warshall)',
      'Minimum Spanning Tree (Kruskal, Prim)', 'BFS and DFS',
      'Hashing', 'Binary Search', 'Recurrence Relations'
    ],
    questionStarters: [
      'The time complexity of', 'Using dynamic programming',
      'In a graph with', 'The recurrence relation T(n) ='
    ],
    exampleQuestion: {
      text: "The worst-case time complexity of QuickSort is:",
      type: "MCQ",
      options: ["A. O(n²)", "B. O(n log n)", "C. O(n)", "D. O(log n)"],
      correctAnswer: "A",
      marks: 2,
      negativeMarks: 0.67,
      concept: "Sorting Algorithms"
    },
    forbiddenContent: ['calculus', 'integral', 'derivative', 'chemical', 'thermodynamics', 'optics']
  },

  'DBMS': {
    domain: 'Computer Science',
    subtopic: 'Database Management Systems',
    concepts: [
      'ER Model', 'Relational Algebra', 'SQL', 'Normalization (1NF, 2NF, 3NF, BCNF)',
      'Transactions and Concurrency Control', 'ACID Properties',
      'Indexing (B-Tree, B+ Tree, Hashing)', 'Query Optimization',
      'Functional Dependencies', 'Deadlock in DBMS'
    ],
    questionStarters: [
      'Consider a relation R with attributes', 'The SQL query',
      'A schedule S is conflict serializable if', 'The B+ tree of order'
    ],
    exampleQuestion: {
      text: "A relation R(A, B, C, D) with FDs: A→B, B→C, C→D. The highest normal form of R is:",
      type: "MCQ",
      options: ["A. 2NF", "B. 3NF", "C. BCNF", "D. 1NF"],
      correctAnswer: "A",
      marks: 2,
      negativeMarks: 0.67,
      concept: "Normalization"
    },
    forbiddenContent: ['calculus', 'integral', 'derivative', 'chemical', 'thermodynamics', 'optics']
  },

  'Computer Networks': {
    domain: 'Computer Science',
    subtopic: 'Computer Networks',
    concepts: [
      'OSI Model', 'TCP/IP Model', 'IP Addressing and Subnetting',
      'Routing Algorithms (Distance Vector, Link State)', 'TCP vs UDP',
      'Flow Control (Sliding Window)', 'Error Detection (CRC, Checksum, Hamming Code)',
      'DNS', 'HTTP/HTTPS', 'ARP', 'DHCP', 'NAT',
      'Congestion Control', 'MAC Protocols (ALOHA, CSMA/CD)',
      'Network Security (Firewalls, Encryption, SSL/TLS)'
    ],
    questionStarters: [
      'A class C network with subnet mask', 'In the TCP 3-way handshake',
      'The maximum number of hosts in a', 'Using Go-Back-N protocol with window size',
      'A router receives a packet with destination IP'
    ],
    exampleQuestion: {
      text: "A class B network with subnet mask 255.255.240.0 can have at most how many hosts per subnet?",
      type: "MCQ",
      options: ["A. 4094", "B. 4096", "C. 2046", "D. 2048"],
      correctAnswer: "A",
      marks: 2,
      negativeMarks: 0.67,
      concept: "Subnetting"
    },
    forbiddenContent: ['calculus', 'integral', 'derivative', 'chemical', 'thermodynamics', 'optics', 'kinematics']
  },

  'Compiler Design': {
    domain: 'Computer Science',
    subtopic: 'Compiler Design',
    concepts: [
      'Lexical Analysis', 'Regular Expressions and Finite Automata',
      'Syntax Analysis (Top-down, Bottom-up Parsing)',
      'LL(1) Parsing', 'LR(0), SLR(1), CLR(1), LALR(1) Parsing',
      'Syntax Directed Translation', 'Intermediate Code Generation',
      'Three Address Code', 'Code Optimization',
      'Register Allocation', 'Symbol Table Management',
      'FIRST and FOLLOW Sets', 'Operator Precedence Parsing'
    ],
    questionStarters: [
      'The FIRST set of the grammar', 'An LR(1) parser for the grammar',
      'The number of reduce-reduce conflicts in', 'The three-address code for the expression',
      'Given the grammar S → aAb | bBa'
    ],
    exampleQuestion: {
      text: "For the grammar S → AB, A → a | ε, B → b | ε, the FOLLOW(A) is:",
      type: "MCQ",
      options: ["A. {b, $}", "B. {b}", "C. {a, b, $}", "D. {$}"],
      correctAnswer: "A",
      marks: 2,
      negativeMarks: 0.67,
      concept: "FOLLOW Sets"
    },
    forbiddenContent: ['calculus', 'integral', 'derivative', 'chemical', 'thermodynamics', 'optics', 'kinematics']
  },

  'Digital Logic': {
    domain: 'Computer Science',
    subtopic: 'Digital Logic',
    concepts: [
      'Boolean Algebra', 'Logic Gates (AND, OR, NOT, NAND, NOR, XOR)',
      'Karnaugh Maps (K-maps)', 'Combinational Circuits (Multiplexer, Decoder, Encoder, Adder)',
      'Sequential Circuits (Flip-flops, Counters, Registers)',
      'Finite State Machines (Mealy, Moore)', 'Number Systems (Binary, Octal, Hex)',
      'Minimization Techniques', 'Quine-McCluskey Method',
      'Timing Diagrams', 'Hazards (Static, Dynamic)'
    ],
    questionStarters: [
      'The minimum number of NAND gates required to implement',
      'The output of the sequential circuit with',
      'A 4-bit synchronous counter', 'The simplified Boolean expression for',
      'Using K-map, minimize the function'
    ],
    exampleQuestion: {
      text: "The minimum number of 2-input NAND gates required to implement the function F = AB + CD is:",
      type: "MCQ",
      options: ["A. 3", "B. 4", "C. 5", "D. 6"],
      correctAnswer: "A",
      marks: 2,
      negativeMarks: 0.67,
      concept: "NAND Implementation"
    },
    forbiddenContent: ['calculus', 'integral', 'derivative', 'chemical', 'thermodynamics', 'optics', 'kinematics']
  },

  'Data Structures': {
    domain: 'Computer Science',
    subtopic: 'Data Structures',
    concepts: [
      'Arrays', 'Linked Lists (Singly, Doubly, Circular)',
      'Stacks', 'Queues (Simple, Circular, Priority, Deque)',
      'Binary Trees', 'Binary Search Trees', 'AVL Trees',
      'B-Trees and B+ Trees', 'Heaps (Min, Max)',
      'Hashing (Chaining, Open Addressing)', 'Graphs (Adjacency Matrix, Adjacency List)',
      'Trie', 'Segment Trees', 'Disjoint Set Union'
    ],
    questionStarters: [
      'The time complexity of inserting into a', 'A binary search tree is constructed by inserting',
      'The number of comparisons in the worst case for', 'A hash table of size',
      'The postorder traversal of the BST with'
    ],
    exampleQuestion: {
      text: "The maximum number of nodes in a binary tree of height h is:",
      type: "MCQ",
      options: ["A. 2^(h+1) - 1", "B. 2^h - 1", "C. 2^h", "D. 2^(h+1)"],
      correctAnswer: "A",
      marks: 2,
      negativeMarks: 0.67,
      concept: "Binary Trees"
    },
    forbiddenContent: ['calculus', 'integral', 'derivative', 'chemical', 'thermodynamics', 'optics', 'kinematics']
  },

  'Computer Architecture': {
    domain: 'Computer Science',
    subtopic: 'Computer Architecture',
    concepts: [
      'Instruction Set Architecture', 'Pipelining (Hazards, Stalls, Forwarding)',
      'Cache Memory (Direct Mapped, Set Associative, Fully Associative)',
      'Cache Performance (Hit Rate, Miss Penalty, AMAT)',
      'Virtual Memory (Page Tables, TLB)', 'Memory Hierarchy',
      'I/O Systems (Programmed I/O, Interrupt-driven, DMA)',
      'RISC vs CISC', 'Instruction Formats', 'Addressing Modes',
      'Performance Metrics (CPI, MIPS, Speedup)'
    ],
    questionStarters: [
      'A 5-stage pipeline with', 'A direct-mapped cache with',
      'The effective memory access time for', 'Consider a processor with a clock speed of',
      'A virtual memory system with page size'
    ],
    exampleQuestion: {
      text: "A direct-mapped cache with 64 blocks and block size of 16 bytes. The number of tag bits for a 32-bit address is:",
      type: "MCQ",
      options: ["A. 22", "B. 20", "C. 24", "D. 18"],
      correctAnswer: "A",
      marks: 2,
      negativeMarks: 0.67,
      concept: "Cache Design"
    },
    forbiddenContent: ['calculus', 'integral', 'derivative', 'chemical', 'thermodynamics', 'optics', 'kinematics']
  },

  'Discrete Mathematics': {
    domain: 'Computer Science',
    subtopic: 'Discrete Mathematics',
    concepts: [
      'Propositional Logic', 'Predicate Logic', 'Sets and Relations',
      'Functions (Injective, Surjective, Bijective)',
      'Graph Theory (Euler, Hamilton, Planar Graphs, Coloring)',
      'Trees (Spanning Trees, Binary Trees)', 'Combinatorics',
      'Recurrence Relations', 'Generating Functions',
      'Group Theory (Groups, Subgroups, Cosets, Lagrange\'s Theorem)',
      'Lattices and Boolean Algebra', 'Partial Orders and Hasse Diagrams'
    ],
    questionStarters: [
      'The number of equivalence relations on', 'A graph G with',
      'The chromatic number of', 'If R is a relation on set A',
      'The number of onto functions from'
    ],
    exampleQuestion: {
      text: "The number of distinct equivalence relations on a set of 4 elements is:",
      type: "MCQ",
      options: ["A. 15", "B. 16", "C. 12", "D. 10"],
      correctAnswer: "A",
      marks: 2,
      negativeMarks: 0.67,
      concept: "Equivalence Relations"
    },
    forbiddenContent: ['calculus', 'integral', 'derivative', 'chemical', 'thermodynamics', 'optics', 'kinematics']
  },

  'Software Engineering': {
    domain: 'Computer Science',
    subtopic: 'Software Engineering',
    concepts: [
      'SDLC Models (Waterfall, Agile, Spiral, V-model)',
      'Requirements Engineering', 'Software Design (Coupling, Cohesion)',
      'Testing (Black Box, White Box, Unit, Integration, System)',
      'Software Metrics (Cyclomatic Complexity, Function Points)',
      'Project Management (COCOMO, Gantt Charts, PERT/CPM)',
      'Software Reliability', 'Configuration Management', 'UML Diagrams'
    ],
    questionStarters: [
      'The cyclomatic complexity of a program with', 'In the Waterfall model',
      'The COCOMO model estimates', 'A module with high cohesion and low coupling'
    ],
    exampleQuestion: {
      text: "The cyclomatic complexity of a program with 15 edges, 12 nodes, and 1 connected component is:",
      type: "MCQ",
      options: ["A. 5", "B. 4", "C. 3", "D. 6"],
      correctAnswer: "B",
      marks: 2,
      negativeMarks: 0.67,
      concept: "Cyclomatic Complexity"
    },
    forbiddenContent: ['calculus', 'integral', 'derivative', 'chemical', 'thermodynamics', 'optics', 'kinematics']
  },

  // ─────────────────── BIOLOGY (NEET) ───────────────────
  'Biology - Botany': {
    domain: 'Biology',
    subtopic: 'Botany',
    concepts: [
      'Cell Structure and Function', 'Cell Division (Mitosis, Meiosis)',
      'Plant Anatomy', 'Photosynthesis', 'Plant Physiology',
      'Plant Growth and Development', 'Morphology of Flowering Plants',
      'Plant Kingdom Classification', 'Genetics and Molecular Biology',
      'Ecology and Environment', 'Biotechnology'
    ],
    questionStarters: [
      'In the light reaction of photosynthesis', 'The C4 pathway is found in',
      'Crossing over occurs during', 'The correct sequence of cell cycle is'
    ],
    exampleQuestion: {
      text: "The site of light-dependent reactions of photosynthesis is:",
      type: "MCQ",
      options: ["A. Thylakoid membrane", "B. Stroma", "C. Outer membrane", "D. Matrix"],
      correctAnswer: "A",
      marks: 4,
      negativeMarks: 1,
      concept: "Photosynthesis"
    },
    forbiddenContent: ['programming', 'algorithm', 'data structure', 'software', 'calculus', 'integral']
  },

  'Biology - Zoology': {
    domain: 'Biology',
    subtopic: 'Zoology',
    concepts: [
      'Animal Kingdom Classification', 'Structural Organization in Animals',
      'Human Physiology (Digestion, Respiration, Circulation, Excretion, Nervous System)',
      'Locomotion and Movement', 'Reproductive Health',
      'Human Reproduction', 'Genetics (Mendelian, Molecular)',
      'Evolution', 'Human Health and Disease', 'Microbes in Human Welfare'
    ],
    questionStarters: [
      'The glomerular filtration rate in humans is', 'During the cardiac cycle',
      'The hormone responsible for', 'In Mendelian genetics'
    ],
    exampleQuestion: {
      text: "The normal GFR (Glomerular Filtration Rate) in humans is approximately:",
      type: "MCQ",
      options: ["A. 125 mL/min", "B. 200 mL/min", "C. 75 mL/min", "D. 50 mL/min"],
      correctAnswer: "A",
      marks: 4,
      negativeMarks: 1,
      concept: "Excretory System"
    },
    forbiddenContent: ['programming', 'algorithm', 'data structure', 'software', 'calculus', 'integral']
  },

  // ─────────────────── UPSC ───────────────────
  'History': {
    domain: 'UPSC',
    subtopic: 'History',
    concepts: [
      'Ancient India (Indus Valley, Vedic Age, Maurya Empire, Gupta Empire)',
      'Medieval India (Delhi Sultanate, Mughal Empire, Bhakti and Sufi Movements)',
      'Modern India (British East India Company, 1857 Revolt, Indian National Congress)',
      'Freedom Struggle (Non-Cooperation, Civil Disobedience, Quit India)',
      'Social Reform Movements (Raja Ram Mohan Roy, Jyotiba Phule, Ambedkar)',
      'Post-Independence India (Integration of States, Five Year Plans, Green Revolution)',
      'World History (French Revolution, Industrial Revolution, World Wars)',
      'Art and Culture (Classical Dances, Music, Architecture, Paintings)',
      'Constitutional History (Government of India Acts, Constituent Assembly)',
      'Important Personalities (Gandhi, Nehru, Bose, Patel, Tagore)',
      'Archaeological Sources and Inscriptions',
      'Religious Movements (Buddhism, Jainism, Sikhism)',
      'Peasant and Tribal Movements',
      'Economic History of India under British Rule',
      'Press and Education during British India'
    ],
    questionStarters: [
      'The Simon Commission of 1927 was boycotted because',
      'The Permanent Settlement of 1793 was introduced by',
      'Which of the following was NOT a feature of the Indus Valley Civilization?',
      'The Cabinet Mission Plan of 1946 proposed',
      'The Khilafat Movement was launched in the year'
    ],
    exampleQuestion: {
      text: "Which of the following Round Table Conferences was attended by Mahatma Gandhi?",
      type: "MCQ",
      options: ["Second Round Table Conference (1931)", "First Round Table Conference (1930)", "Third Round Table Conference (1932)", "None of the above"],
      correctAnswer: "Second Round Table Conference (1931)",
      marks: 2,
      negativeMarks: 0.67,
      concept: "Freedom Struggle"
    },
    forbiddenContent: ['programming', 'code', 'algorithm', 'data structure', 'software', 'SQL', 'database', 'normalization', 'B+ tree', 'deadlock', 'semaphore']
  },

  'Geography': {
    domain: 'UPSC',
    subtopic: 'Geography',
    concepts: [
      'Physical Geography (Geomorphology, Plate Tectonics, Volcanism, Earthquakes)',
      'Climatology (Atmospheric Circulation, Monsoon Mechanism, El Niño, La Niña)',
      'Oceanography (Ocean Currents, Tides, Salinity, Coral Reefs)',
      'Indian Geography (Physiographic Divisions, Rivers, Climate Zones)',
      'Economic Geography (Agriculture, Industries, Minerals, Energy Resources)',
      'Human Geography (Population, Urbanization, Migration)',
      'Environmental Geography (Biodiversity, Conservation, Pollution)',
      'Map-based Questions (Important Locations, Mountain Passes, Ports)',
      'Soil Types of India (Alluvial, Black, Red, Laterite)',
      'Forest Types and Vegetation of India',
      'Drainage Systems of India (Himalayan and Peninsular Rivers)',
      'Natural Disasters (Floods, Cyclones, Droughts, Landslides)',
      'World Geography (Continents, Countries, Capital Cities, Important Straits)',
      'Transport and Communication Networks',
      'Census and Demographic Trends'
    ],
    questionStarters: [
      'Which of the following rivers does NOT originate from the Himalayas?',
      'The Western Ghats are also known as',
      'The Coriolis effect causes winds to deflect',
      'Which Indian state has the longest coastline?',
      'Laterite soil is mainly found in regions with'
    ],
    exampleQuestion: {
      text: "The Tropic of Cancer does NOT pass through which of the following Indian states?",
      type: "MCQ",
      options: ["Karnataka", "Rajasthan", "Madhya Pradesh", "West Bengal"],
      correctAnswer: "Karnataka",
      marks: 2,
      negativeMarks: 0.67,
      concept: "Indian Geography"
    },
    forbiddenContent: ['programming', 'code', 'algorithm', 'data structure', 'software', 'SQL', 'database', 'normalization', 'B+ tree']
  },

  'Polity': {
    domain: 'UPSC',
    subtopic: 'Polity',
    concepts: [
      'Indian Constitution (Preamble, Features, Schedules, Amendments)',
      'Fundamental Rights (Articles 14-32)',
      'Directive Principles of State Policy (Articles 36-51)',
      'Fundamental Duties (Article 51A)',
      'Union Executive (President, Vice President, Prime Minister, Council of Ministers)',
      'Parliament (Lok Sabha, Rajya Sabha, Legislative Process, Committees)',
      'State Government (Governor, Chief Minister, State Legislature)',
      'Judiciary (Supreme Court, High Courts, Judicial Review, PIL)',
      'Federal Structure (Centre-State Relations, Inter-State Councils)',
      'Local Self-Government (Panchayati Raj, Municipalities, 73rd and 74th Amendments)',
      'Constitutional Bodies (Election Commission, CAG, UPSC, Finance Commission)',
      'Statutory Bodies (NHRC, CIC, NCW, NITI Aayog)',
      'Emergency Provisions (National, State, Financial)',
      'Electoral System (First Past the Post, Proportional Representation)',
      'Important Constitutional Amendments'
    ],
    questionStarters: [
      'Article 32 of the Indian Constitution deals with',
      'The concept of Judicial Review in India is derived from',
      'Which of the following is NOT a Fundamental Right?',
      'The 73rd Constitutional Amendment Act relates to',
      'The President of India can be impeached by'
    ],
    exampleQuestion: {
      text: "Which of the following writs is issued by the court to prevent a person from holding a public office to which they are not entitled?",
      type: "MCQ",
      options: ["Quo Warranto", "Mandamus", "Certiorari", "Habeas Corpus"],
      correctAnswer: "Quo Warranto",
      marks: 2,
      negativeMarks: 0.67,
      concept: "Writs under Article 32"
    },
    forbiddenContent: ['programming', 'code', 'algorithm', 'data structure', 'software', 'SQL', 'database', 'normalization', 'B+ tree']
  },

  'Economy': {
    domain: 'UPSC',
    subtopic: 'Economy',
    concepts: [
      'National Income Accounting (GDP, GNP, NDP, NNP, Per Capita Income)',
      'Monetary Policy (Repo Rate, Reverse Repo, CRR, SLR, Open Market Operations)',
      'Fiscal Policy (Budget, Taxation, Fiscal Deficit, Revenue Deficit)',
      'Banking System (RBI, Commercial Banks, NBFCs, Payment Banks, Small Finance Banks)',
      'Inflation (WPI, CPI, Demand-Pull, Cost-Push, Phillips Curve)',
      'Indian Tax System (GST, Income Tax, Corporate Tax, Direct vs Indirect Taxes)',
      'International Trade (Balance of Payments, Current Account, Capital Account, WTO)',
      'Indian Agriculture (MSP, APMC, e-NAM, PM-KISAN, Crop Insurance)',
      'Industrial Policy (Make in India, PLI Scheme, SEZs, MSME)',
      'Poverty and Unemployment (Measurement, MGNREGA, Skill India)',
      'Financial Markets (SEBI, Stock Exchange, Mutual Funds, Bonds)',
      'Public Finance (Consolidated Fund, Contingency Fund, Public Account)',
      'Economic Reforms (LPG-1991, Disinvestment, FDI Policy)',
      'Money and Banking (Money Supply M1-M4, Credit Creation, Liquidity Trap)',
      'Government Schemes (PM Jan Dhan Yojana, Mudra Scheme, Stand-Up India)'
    ],
    questionStarters: [
      'The Fiscal Responsibility and Budget Management (FRBM) Act aims to',
      'If the RBI increases the Repo Rate, the likely effect on the economy is',
      'Which of the following is NOT included in the calculation of GDP?',
      'The difference between Revenue Receipts and Revenue Expenditure is called',
      'Open Market Operations by the RBI involve'
    ],
    exampleQuestion: {
      text: "If the Reserve Bank of India (RBI) decides to increase the Cash Reserve Ratio (CRR), what is the most likely immediate effect on the economy?",
      type: "MCQ",
      options: ["Decrease in money supply in the economy", "Increase in money supply in the economy", "No effect on money supply", "Increase in government spending"],
      correctAnswer: "Decrease in money supply in the economy",
      marks: 2,
      negativeMarks: 0.67,
      concept: "Monetary Policy"
    },
    forbiddenContent: ['programming', 'code', 'algorithm', 'data structure', 'software', 'SQL', 'database', 'normalization', 'B+ tree', 'deadlock', 'semaphore', 'compiler', 'cache', 'pipeline']
  },

  'Science and Technology': {
    domain: 'UPSC',
    subtopic: 'Science and Technology',
    concepts: [
      'Space Technology (ISRO Missions, Satellites, Launch Vehicles, Mars/Moon Missions)',
      'Defence Technology (Missiles, BrahMos, Agni, DRDO, INS Vikrant)',
      'Biotechnology (Genetic Engineering, CRISPR, GM Crops, Stem Cells)',
      'Nuclear Technology (Nuclear Reactors, Thorium Cycle, IAEA, NPT)',
      'Information Technology (AI, Blockchain, IoT, Cyber Security, 5G)',
      'Health and Medicine (Vaccines, Antibiotics, Epidemics, AYUSH)',
      'Nanotechnology and its Applications',
      'Renewable Energy (Solar, Wind, Hydrogen, Biofuels)',
      'Environmental Technology (Carbon Capture, Waste Management)',
      'Indian S&T Institutions (CSIR, DST, DBT, BARC, ICAR)',
      'Awards in Science (Nobel Prize, Shanti Swarup Bhatnagar)',
      'Recent Scientific Discoveries and Innovations',
      'Intellectual Property Rights (Patents, Copyrights, TRIPS)',
      'Digital India Initiatives (UPI, Aadhaar, DigiLocker)',
      'Robotics and Automation'
    ],
    questionStarters: [
      'ISRO\'s Chandrayaan-3 mission was significant because',
      'CRISPR-Cas9 technology is used for',
      'The Hydrogen Fuel Cell works on the principle of',
      'Which of the following is NOT a satellite navigation system?',
      'India\'s three-stage nuclear programme was conceived by'
    ],
    exampleQuestion: {
      text: "Which of the following ISRO launch vehicles is designed to carry heavy payloads to Geostationary Transfer Orbit (GTO)?",
      type: "MCQ",
      options: ["GSLV Mk III (LVM3)", "PSLV", "SSLV", "SLV-3"],
      correctAnswer: "GSLV Mk III (LVM3)",
      marks: 2,
      negativeMarks: 0.67,
      concept: "Space Technology"
    },
    forbiddenContent: ['SQL', 'database', 'normalization', 'B+ tree', 'deadlock', 'semaphore', 'compiler', 'cache', 'GATE']
  },

  // ─────────────────── SSC / CAT ───────────────────
  'General Awareness': {
    domain: 'General Knowledge',
    subtopic: 'General Awareness',
    concepts: [
      'Indian History (Ancient, Medieval, Modern)',
      'Indian Geography (Physical, Economic)',
      'Indian Polity and Governance',
      'General Science (Physics, Chemistry, Biology basics)',
      'Current Affairs (National and International)',
      'Sports and Awards', 'Books and Authors',
      'Important Days and Events', 'Indian Economy Basics',
      'Environmental Issues', 'Art and Culture of India'
    ],
    questionStarters: [
      'Which of the following is the capital of', 'The Nobel Peace Prize 2024 was awarded to',
      'Which river is known as the', 'The Battle of Plassey was fought in'
    ],
    exampleQuestion: {
      text: "The Tropic of Cancer passes through how many Indian states?",
      type: "MCQ",
      options: ["8 states", "6 states", "10 states", "5 states"],
      correctAnswer: "8 states",
      marks: 2,
      negativeMarks: 0.50,
      concept: "Indian Geography"
    },
    forbiddenContent: ['programming', 'code', 'algorithm', 'SQL', 'database', 'normalization']
  },

  'Quantitative Aptitude': {
    domain: 'Mathematics',
    subtopic: 'Quantitative Aptitude',
    concepts: [
      'Number System', 'HCF and LCM', 'Percentage', 'Profit and Loss',
      'Simple and Compound Interest', 'Ratio and Proportion',
      'Time, Speed and Distance', 'Time and Work', 'Averages',
      'Mensuration (Area, Volume, Surface Area)', 'Data Interpretation',
      'Algebra (Linear Equations, Quadratics)', 'Geometry (Triangles, Circles)',
      'Probability', 'Permutation and Combination'
    ],
    questionStarters: [
      'A shopkeeper marks the price of an article', 'A train 200 meters long crosses',
      'If the compound interest on a sum', 'The ratio of ages of A and B'
    ],
    exampleQuestion: {
      text: "A shopkeeper offers a discount of 20% on the marked price and still makes a profit of 25%. If the cost price is ₹400, what is the marked price?",
      type: "MCQ",
      options: ["₹625", "₹500", "₹600", "₹550"],
      correctAnswer: "₹625",
      marks: 2,
      negativeMarks: 0.50,
      concept: "Profit and Loss"
    },
    forbiddenContent: ['programming', 'code', 'algorithm', 'SQL', 'database']
  },

  'Reasoning': {
    domain: 'Logical Reasoning',
    subtopic: 'Reasoning',
    concepts: [
      'Coding-Decoding', 'Blood Relations', 'Direction Sense',
      'Syllogisms', 'Seating Arrangement', 'Puzzles',
      'Number Series', 'Letter Series', 'Analogies',
      'Classification (Odd One Out)', 'Statement and Conclusion',
      'Venn Diagrams', 'Order and Ranking', 'Calendar and Clock'
    ],
    questionStarters: [
      'In a certain code language, APPLE is written as',
      'If P is the mother of Q, and Q is the sister of R',
      'Find the missing number in the series',
      'Five persons A, B, C, D and E are sitting in a row'
    ],
    exampleQuestion: {
      text: "In a code language, if COMPUTER is written as RFUVQNPD, then how is MEDICINE written in the same code?",
      type: "MCQ",
      options: ["EOJDJEFM", "FMDJDOJE", "FMEJDJOE", "FNDJDJOE"],
      correctAnswer: "FMEJDJOE",
      marks: 2,
      negativeMarks: 0.50,
      concept: "Coding-Decoding"
    },
    forbiddenContent: ['programming', 'code', 'algorithm', 'SQL', 'database']
  },

  'Quantitative Ability': {
    domain: 'Mathematics',
    subtopic: 'Quantitative Ability (CAT)',
    concepts: [
      'Number System', 'Arithmetic (Percentage, Profit-Loss, SI/CI, Ratio)',
      'Algebra (Equations, Inequalities, Functions, Progressions)',
      'Geometry (Triangles, Circles, Coordinate Geometry)',
      'Mensuration', 'Permutation and Combination', 'Probability',
      'Set Theory', 'Logarithms', 'Surds and Indices',
      'Time Speed Distance', 'Time and Work', 'Averages and Mixtures'
    ],
    questionStarters: [
      'If log₂(x) + log₂(x-1) = 1, then', 'The number of ways to arrange',
      'A mixture contains milk and water in the ratio'
    ],
    exampleQuestion: null,
    forbiddenContent: ['programming', 'code', 'algorithm', 'SQL', 'database']
  },

  'Verbal Ability': {
    domain: 'English',
    subtopic: 'Verbal Ability',
    concepts: [
      'Reading Comprehension', 'Para Jumbles', 'Para Summary',
      'Sentence Correction', 'Fill in the Blanks', 'Vocabulary',
      'Critical Reasoning', 'Analogies', 'Idioms and Phrases',
      'One Word Substitution', 'Error Spotting'
    ],
    questionStarters: [
      'Choose the word that is most nearly opposite in meaning to',
      'Rearrange the following sentences to form a coherent paragraph',
      'Choose the most appropriate word to fill in the blank'
    ],
    exampleQuestion: null,
    forbiddenContent: ['programming', 'code', 'algorithm', 'SQL', 'database']
  },

  'Data Interpretation': {
    domain: 'Mathematics',
    subtopic: 'Data Interpretation',
    concepts: [
      'Bar Graphs', 'Line Charts', 'Pie Charts', 'Tables',
      'Caselets', 'Combined Data Sets', 'Percentage Calculations',
      'Growth Rate Analysis', 'Ratio-based Questions'
    ],
    questionStarters: [
      'Study the following table and answer', 'The bar graph shows the sales of',
      'From the pie chart, calculate the percentage of'
    ],
    exampleQuestion: null,
    forbiddenContent: ['programming', 'code', 'algorithm', 'SQL', 'database']
  },

  'Logical Reasoning': {
    domain: 'Logical Reasoning',
    subtopic: 'Logical Reasoning (CAT)',
    concepts: [
      'Seating Arrangement (Linear, Circular)', 'Blood Relations',
      'Syllogisms', 'Puzzles', 'Logical Connectives',
      'Binary Logic', 'Courses of Action', 'Decision Making',
      'Input-Output', 'Cubes and Dice', 'Direction Sense'
    ],
    questionStarters: [
      'Eight people are sitting around a circular table',
      'If all cats are dogs and some dogs are parrots',
      'Read the following passage and answer'
    ],
    exampleQuestion: null,
    forbiddenContent: ['programming', 'code', 'algorithm', 'SQL', 'database']
  },

  // ─────────────────── GATE ECE ───────────────────
  'Network Theory': {
    domain: 'Electrical Engineering',
    subtopic: 'Network Theory',
    concepts: [
      'KVL and KCL', 'Mesh and Nodal Analysis', 'Thevenin and Norton Theorem',
      'Superposition Theorem', 'Maximum Power Transfer Theorem',
      'Transient Analysis (RC, RL, RLC Circuits)', 'Steady State AC Analysis',
      'Impedance and Admittance', 'Resonance (Series and Parallel)',
      'Two-Port Networks (Z, Y, h, ABCD Parameters)',
      'Network Functions', 'Laplace Transform in Circuit Analysis',
      'Mutual Inductance and Coupled Circuits', 'Graph Theory for Networks'
    ],
    questionStarters: [
      'In the circuit shown, find the current through', 'The Thevenin equivalent of',
      'A series RLC circuit resonates at', 'Using nodal analysis, the voltage at node'
    ],
    exampleQuestion: {
      text: "In a series RLC circuit at resonance, the impedance is:",
      type: "MCQ",
      options: ["Equal to resistance R only", "Zero", "Infinite", "Equal to XL + XC"],
      correctAnswer: "Equal to resistance R only",
      marks: 2, negativeMarks: 0.67, concept: "Resonance"
    },
    forbiddenContent: ['programming', 'code', 'algorithm', 'SQL', 'database', 'normalization']
  },

  'Signals and Systems': {
    domain: 'Electrical Engineering',
    subtopic: 'Signals and Systems',
    concepts: [
      'Continuous-Time Signals (Unit Step, Impulse, Ramp, Exponential)',
      'Discrete-Time Signals', 'LTI Systems and Convolution',
      'Fourier Series', 'Fourier Transform and Properties',
      'Laplace Transform', 'Z-Transform', 'Transfer Function',
      'Sampling Theorem (Nyquist Rate)', 'DFT and FFT',
      'Stability Analysis (ROC, Poles, Zeros)',
      'Parseval\'s Theorem', 'Energy and Power Signals'
    ],
    questionStarters: [
      'The Fourier Transform of a rectangular pulse is',
      'For an LTI system with impulse response h(t)',
      'The Nyquist rate for the signal x(t) = cos(200πt) is',
      'The Z-transform of the sequence x[n] = aⁿu[n] is'
    ],
    exampleQuestion: {
      text: "The Nyquist sampling rate for the signal x(t) = cos(100πt) + sin(200πt) is:",
      type: "MCQ",
      options: ["200 Hz", "100 Hz", "300 Hz", "400 Hz"],
      correctAnswer: "200 Hz",
      marks: 2, negativeMarks: 0.67, concept: "Sampling Theorem"
    },
    forbiddenContent: ['programming', 'code', 'algorithm', 'SQL', 'database', 'normalization']
  },

  'Digital Circuits': {
    domain: 'Electrical Engineering',
    subtopic: 'Digital Circuits',
    concepts: [
      'Boolean Algebra and Logic Gates', 'K-maps and Minimization',
      'Combinational Circuits (MUX, Decoder, Encoder, Adder, Subtractor)',
      'Sequential Circuits (Flip-flops, Counters, Shift Registers)',
      'Finite State Machines (Mealy and Moore)',
      'ADC and DAC Converters', 'Memory Devices (RAM, ROM)',
      'Timing Diagrams', 'Hazards', 'Number Systems and Codes'
    ],
    questionStarters: [
      'The minimum number of NAND gates to implement',
      'A 4-bit synchronous up counter', 'The K-map for the function',
      'Design a Mealy machine that detects'
    ],
    exampleQuestion: {
      text: "A mod-12 counter requires minimum how many flip-flops?",
      type: "MCQ",
      options: ["4 flip-flops", "3 flip-flops", "5 flip-flops", "6 flip-flops"],
      correctAnswer: "4 flip-flops",
      marks: 2, negativeMarks: 0.67, concept: "Counters"
    },
    forbiddenContent: ['programming', 'code', 'algorithm', 'SQL', 'database', 'normalization']
  },

  'Communications': {
    domain: 'Electrical Engineering',
    subtopic: 'Communications',
    concepts: [
      'Amplitude Modulation (AM, DSB-SC, SSB)', 'Frequency Modulation (FM)',
      'Phase Modulation (PM)', 'Pulse Modulation (PAM, PWM, PPM, PCM)',
      'Digital Modulation (ASK, FSK, PSK, QAM)',
      'Shannon\'s Channel Capacity', 'Noise in Communication Systems',
      'SNR and BER', 'Information Theory (Entropy, Source Coding)',
      'Superheterodyne Receiver', 'Matched Filters',
      'Error Correcting Codes (Hamming, CRC)'
    ],
    questionStarters: [
      'The bandwidth of an AM signal with modulation index',
      'For a PCM system with sampling rate', 'Shannon\'s channel capacity for',
      'The bit error rate of BPSK is'
    ],
    exampleQuestion: {
      text: "The bandwidth of a DSB-SC AM signal with message bandwidth W is:",
      type: "MCQ",
      options: ["2W", "W", "3W", "W/2"],
      correctAnswer: "2W",
      marks: 2, negativeMarks: 0.67, concept: "AM Bandwidth"
    },
    forbiddenContent: ['programming', 'code', 'algorithm', 'SQL', 'database', 'normalization']
  },

  'Control Systems': {
    domain: 'Electrical Engineering',
    subtopic: 'Control Systems',
    concepts: [
      'Transfer Functions', 'Block Diagram Reduction',
      'Signal Flow Graphs (Mason\'s Gain Formula)',
      'Time Domain Analysis (Rise Time, Settling Time, Overshoot)',
      'Stability Analysis (Routh-Hurwitz Criterion)',
      'Root Locus', 'Bode Plot', 'Nyquist Plot',
      'State Space Analysis', 'Controllability and Observability',
      'PID Controllers', 'Gain and Phase Margins',
      'Steady-State Error', 'Compensation Techniques'
    ],
    questionStarters: [
      'The open loop transfer function G(s) =', 'Using Routh-Hurwitz criterion',
      'The gain margin of the system with', 'For a unity feedback system with'
    ],
    exampleQuestion: {
      text: "A second-order underdamped system has damping ratio ζ = 0.5. The percentage overshoot is approximately:",
      type: "MCQ",
      options: ["16.3%", "5%", "25.4%", "36.8%"],
      correctAnswer: "16.3%",
      marks: 2, negativeMarks: 0.67, concept: "Transient Response"
    },
    forbiddenContent: ['programming', 'code', 'algorithm', 'SQL', 'database', 'normalization']
  },

  // ─────────────────── NAME ALIASES ───────────────────
  // JEE Main uses "Electromagnetism" but knowledge base had "Electrodynamics"
  'Physics - Electromagnetism': {
    domain: 'Physics',
    subtopic: 'Electromagnetism',
    concepts: [
      'Coulomb\'s Law', 'Electric Field and Potential', 'Gauss\'s Law',
      'Capacitance', 'Current Electricity (Ohm\'s Law, Kirchhoff\'s Laws)',
      'Wheatstone Bridge', 'Potentiometer', 'Magnetic Effects of Current',
      'Biot-Savart Law', 'Ampere\'s Law', 'Electromagnetic Induction',
      'Faraday\'s Law', 'AC Circuits', 'Electromagnetic Waves'
    ],
    questionStarters: [
      'Two charges q₁ and q₂ are placed', 'A parallel plate capacitor with',
      'In the circuit shown', 'A long straight wire carrying current'
    ],
    exampleQuestion: {
      text: "The magnetic field at the center of a circular loop of radius R carrying current I is:",
      type: "MCQ",
      options: ["μ₀I/2R", "μ₀I/R", "μ₀I/4πR", "2μ₀I/R"],
      correctAnswer: "μ₀I/2R",
      marks: 2, negativeMarks: 0.67, concept: "Biot-Savart Law"
    },
    forbiddenContent: ['programming', 'code', 'algorithm', 'SQL', 'database']
  },

  // ─────────────────── BROAD TOPICS (JEE Advanced / NEET) ───────────────────
  'Physics': {
    domain: 'Physics',
    subtopic: 'General Physics',
    concepts: [
      'Kinematics', 'Newton\'s Laws', 'Work Energy Power', 'Gravitation',
      'Rotational Motion', 'SHM and Waves', 'Fluid Mechanics',
      'Thermodynamics', 'Kinetic Theory of Gases',
      'Electrostatics', 'Current Electricity', 'Magnetism',
      'Electromagnetic Induction', 'Optics', 'Modern Physics',
      'Semiconductors'
    ],
    questionStarters: [
      'A particle is projected with', 'A block of mass m on',
      'In Young\'s double slit experiment', 'The de Broglie wavelength of'
    ],
    exampleQuestion: null,
    forbiddenContent: ['programming', 'code', 'algorithm', 'SQL', 'database']
  },

  'Chemistry': {
    domain: 'Chemistry',
    subtopic: 'General Chemistry',
    concepts: [
      'Atomic Structure', 'Periodic Table', 'Chemical Bonding',
      'Thermodynamics and Thermochemistry', 'Equilibrium',
      'Ionic Equilibrium', 'Chemical Kinetics', 'Electrochemistry',
      'Solutions', 'Solid State', 'Surface Chemistry',
      'Organic Chemistry Basics', 'Hydrocarbons', 'Alcohols Phenols Ethers',
      'Carbonyl Compounds', 'Coordination Compounds'
    ],
    questionStarters: [
      'The IUPAC name of', 'The pH of a solution',
      'The hybridization of', 'For a first order reaction'
    ],
    exampleQuestion: null,
    forbiddenContent: ['programming', 'code', 'algorithm', 'SQL', 'database']
  },

  'Mathematics': {
    domain: 'Mathematics',
    subtopic: 'General Mathematics',
    concepts: [
      'Sets Relations Functions', 'Complex Numbers', 'Quadratic Equations',
      'Permutations Combinations', 'Binomial Theorem', 'Sequences and Series',
      'Matrices and Determinants', 'Limits and Continuity',
      'Differentiation', 'Integration', 'Differential Equations',
      'Coordinate Geometry', 'Vectors and 3D', 'Probability', 'Statistics',
      'Trigonometry'
    ],
    questionStarters: [
      'If f(x) =', 'The value of the integral',
      'The number of ways to arrange', 'If the roots of the equation'
    ],
    exampleQuestion: null,
    forbiddenContent: ['programming', 'code', 'algorithm', 'SQL', 'database']
  },

  // ─────────────────── SSC ENGLISH ───────────────────
  'English': {
    domain: 'English',
    subtopic: 'English Language',
    concepts: [
      'Synonyms and Antonyms', 'One Word Substitution',
      'Idioms and Phrases', 'Spelling Correction',
      'Sentence Improvement', 'Active and Passive Voice',
      'Direct and Indirect Speech', 'Fill in the Blanks',
      'Cloze Test', 'Error Spotting', 'Reading Comprehension',
      'Para Jumbles', 'Subject-Verb Agreement', 'Tenses',
      'Parts of Speech'
    ],
    questionStarters: [
      'Choose the synonym of', 'Choose the antonym of',
      'Identify the error in the sentence', 'Choose the correct meaning of the idiom'
    ],
    exampleQuestion: {
      text: "Choose the correct synonym of 'Benevolent':",
      type: "MCQ",
      options: ["Kind and generous", "Cruel and harsh", "Lazy and careless", "Proud and arrogant"],
      correctAnswer: "Kind and generous",
      marks: 2, negativeMarks: 0.50, concept: "Synonyms"
    },
    forbiddenContent: ['programming', 'code', 'algorithm', 'SQL', 'database', 'physics', 'chemistry']
  }
};

/**
 * Get subject knowledge for a given topic.
 * Falls back to a dynamically generated entry if the topic isn't in the predefined map.
 */
export function getSubjectKnowledge(topic) {
  // Direct match
  if (SUBJECT_KNOWLEDGE[topic]) {
    return SUBJECT_KNOWLEDGE[topic];
  }

  // Fuzzy match - check if any key is contained within the topic or vice versa
  for (const [key, value] of Object.entries(SUBJECT_KNOWLEDGE)) {
    if (topic.toLowerCase().includes(key.toLowerCase()) ||
        key.toLowerCase().includes(topic.toLowerCase())) {
      return value;
    }
  }

  // Fallback: generate a basic entry from the topic name
  const parts = topic.split(' - ');
  const domain = parts[0] || topic;
  const subtopic = parts[1] || topic;

  return {
    domain,
    subtopic,
    concepts: [],
    questionStarters: [],
    exampleQuestion: null,
    forbiddenContent: ['programming', 'code', 'algorithm', 'data structure', 'software', 'pipeline', 'O(n)', 'loop', 'array']
  };
}

// Auto-fix: convert letter-based correctAnswer ("A","B","C","D") to actual option text
for (const [, val] of Object.entries(SUBJECT_KNOWLEDGE)) {
  const eq = val.exampleQuestion;
  if (eq && eq.correctAnswer && eq.correctAnswer.length <= 2 && eq.options?.length) {
    const match = eq.options.find(o => o.startsWith(eq.correctAnswer + '.') || o.startsWith(eq.correctAnswer + ')'));
    if (match) eq.correctAnswer = match;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// PYQ BANK — Verified Previous Year Questions for AI paraphrasing pipeline
// ═══════════════════════════════════════════════════════════════════════════
export const PYQ_BANK = {
  'GATE CS': {
    'DBMS': [
      { text: 'Consider R(A,B,C,D,E) with FDs {A→BC, CD→E, B→D, E→A}. How many candidate keys does R have?', type: 'NAT', options: [], correctAnswer: '3', concept: 'Candidate Keys' },
      { text: 'Consider the schedule: T1:R(X), T2:R(X), T2:W(X), T1:W(X). This schedule is:', type: 'MCQ', options: ['Conflict serializable','View serializable but not conflict serializable','Neither conflict nor view serializable','Both conflict and view serializable'], correctAnswer: 'View serializable but not conflict serializable', concept: 'Serializability' },
      { text: 'Given R(A,B,C) with FDs {A→B, B→C}. R is in 2NF but not 3NF because:', type: 'MCQ', options: ['A→C is a partial dependency','B→C is a transitive dependency','A→B is a trivial FD','There is a multivalued dependency'], correctAnswer: 'B→C is a transitive dependency', concept: 'Normalization' },
      { text: 'SELECT dept, COUNT(*) FROM emp WHERE salary>50000 GROUP BY dept HAVING COUNT(*)>3 ORDER BY dept. Which clause is executed last?', type: 'MCQ', options: ['WHERE','GROUP BY','HAVING','ORDER BY'], correctAnswer: 'ORDER BY', concept: 'SQL Execution Order' },
      { text: 'A B+ tree of order 4 (max 3 keys per node) stores 1000 records. The minimum number of levels (including root and leaf) is:', type: 'NAT', options: [], correctAnswer: '5', concept: 'B+ Tree Indexing' },
      { text: 'In 2PL, a transaction T acquires locks in this order: S(A), S(B), X(C), Unlock(A), X(D), Unlock(B). Is this valid 2PL?', type: 'MCQ', options: ['Yes, it follows strict 2PL','Yes, it follows basic 2PL','No, it acquires X(D) after Unlock(A)','No, it mixes shared and exclusive locks'], correctAnswer: 'No, it acquires X(D) after Unlock(A)', concept: 'Two-Phase Locking' },
      { text: 'Consider R(A,B,C,D) decomposed into R1(A,B,C) and R2(A,D). Given FD A→D, this decomposition is:', type: 'MCQ', options: ['Lossless but not dependency preserving','Dependency preserving but not lossless','Both lossless and dependency preserving','Neither lossless nor dependency preserving'], correctAnswer: 'Both lossless and dependency preserving', concept: 'Decomposition' },
      { text: 'A relation has 5 tuples. The maximum number of tuples in its Cartesian product with itself is:', type: 'NAT', options: [], correctAnswer: '25', concept: 'Relational Algebra' },
      { text: 'In a concurrent system, which of the following is NOT a necessary condition for deadlock?', type: 'MCQ', options: ['Mutual exclusion','Hold and wait','Preemption','Circular wait'], correctAnswer: 'Preemption', concept: 'Deadlock in DBMS' },
      { text: 'A hash table uses linear probing with h(k)=k mod 7. Keys 22, 29, 43, 36 are inserted in order. The position of key 36 is:', type: 'NAT', options: [], correctAnswer: '3', concept: 'Hashing and Indexing' },
    ],
    'Data Structures': [
      { text: 'An AVL tree is constructed by inserting keys 3, 2, 1, 4, 5, 6, 7 one by one. The height of the resulting tree is:', type: 'NAT', options: [], correctAnswer: '2', concept: 'AVL Trees' },
      { text: 'Consider a max-heap with 7 elements: [90,80,70,50,60,65,30]. After deleting the root, the new heap is:', type: 'MCQ', options: ['[80,60,70,50,30,65]','[80,70,65,50,60,30]','[80,60,70,50,65,30]','[70,80,65,50,60,30]'], correctAnswer: '[80,60,70,50,30,65]', concept: 'Heaps' },
      { text: 'A hash table of size 7 uses chaining. Keys 15, 22, 29, 36, 43 all hash to the same slot. The worst-case search time is:', type: 'MCQ', options: ['O(1)','O(5)','O(n)','O(log n)'], correctAnswer: 'O(n)', concept: 'Hashing' },
      { text: 'In a complete binary tree with 31 nodes, the number of leaf nodes is:', type: 'NAT', options: [], correctAnswer: '16', concept: 'Binary Trees' },
      { text: 'A graph has 6 vertices and the degree sequence {2,2,2,3,3,4}. The number of edges is:', type: 'NAT', options: [], correctAnswer: '8', concept: 'Graph Theory' },
      { text: 'Postfix expression 6 3 2 * + 5 - evaluates to:', type: 'NAT', options: [], correctAnswer: '7', concept: 'Stack Applications' },
      { text: 'In a BST, the inorder successor of a node with two children is always in its:', type: 'MCQ', options: ['Left subtree','Right subtree, leftmost node','Parent node','Right child'], correctAnswer: 'Right subtree, leftmost node', concept: 'BST Operations' },
      { text: 'A circular queue of size 5 has front=2, rear=4. After 3 dequeues and 4 enqueues, the value of rear is:', type: 'NAT', options: [], correctAnswer: '3', concept: 'Queue' },
      { text: 'The number of distinct BSTs that can be formed with 5 distinct keys is:', type: 'NAT', options: [], correctAnswer: '42', concept: 'Catalan Number' },
      { text: 'An adjacency matrix of an undirected graph with n=5 vertices requires how many bits of storage?', type: 'NAT', options: [], correctAnswer: '25', concept: 'Graph Representation' },
    ],
    'Algorithms': [
      { text: 'Consider QuickSort on array [3,1,4,1,5,9,2,6]. With first element as pivot and Lomuto partition, how many comparisons occur in the first partition?', type: 'NAT', options: [], correctAnswer: '7', concept: 'QuickSort Analysis' },
      { text: 'The recurrence T(n) = 3T(n/4) + n log n. By Master theorem, T(n) is:', type: 'MCQ', options: ['Θ(n log n)','Θ(n^(log₄3))','Θ(n² log n)','Θ(n log² n)'], correctAnswer: 'Θ(n log n)', concept: 'Recurrences' },
      { text: 'Dijkstra\'s algorithm is run on a graph with vertices {A,B,C,D} and edges A→B(1), A→C(4), B→C(2), B→D(6), C→D(3). The shortest path from A to D has weight:', type: 'NAT', options: [], correctAnswer: '6', concept: 'Shortest Path' },
      { text: 'In Kruskal\'s MST algorithm on a graph with 6 vertices and 10 edges, the maximum number of edges examined before MST is complete is:', type: 'MCQ', options: ['5','6','10','It depends on edge weights'], correctAnswer: '10', concept: 'MST Algorithms' },
      { text: 'The 0/1 Knapsack problem with n items and capacity W has time complexity using DP:', type: 'MCQ', options: ['O(n log n)','O(nW)','O(2^n)','O(n²)'], correctAnswer: 'O(nW)', concept: 'Dynamic Programming' },
      { text: 'Merge sort on a linked list of n elements. The space complexity (excluding input) is:', type: 'MCQ', options: ['O(1)','O(log n)','O(n)','O(n log n)'], correctAnswer: 'O(log n)', concept: 'Sorting Complexity' },
      { text: 'A graph has 8 vertices. BFS from vertex 1 visits vertices in order: 1,2,5,3,6,4,7,8. The minimum number of edges in this graph is:', type: 'NAT', options: [], correctAnswer: '7', concept: 'BFS Traversal' },
      { text: 'Huffman coding for characters with frequencies {5,9,12,13,16,45}. The length of the Huffman code for frequency 5 is:', type: 'NAT', options: [], correctAnswer: '4', concept: 'Greedy Algorithms' },
      { text: 'In the activity selection problem with intervals (1,4),(3,5),(0,6),(5,7),(3,9),(5,9),(6,10),(8,11),(8,12),(2,14),(12,16), the maximum activities selected is:', type: 'NAT', options: [], correctAnswer: '4', concept: 'Greedy Activity Selection' },
      { text: 'The time complexity of finding the strongly connected components using Kosaraju\'s algorithm is:', type: 'MCQ', options: ['O(V²)','O(V+E)','O(V·E)','O(E log V)'], correctAnswer: 'O(V+E)', concept: 'Graph Algorithms' },
    ],
    'Operating Systems': [
      { text: 'Consider 3 processes P1(burst=6), P2(burst=4), P3(burst=2) arriving at t=0. With SJF scheduling, the average waiting time is:', type: 'NAT', options: [], correctAnswer: '4', concept: 'CPU Scheduling' },
      { text: 'A system has 3 resource types: A(10), B(5), C(7). Five processes have max needs and current allocation. Using Banker\'s algorithm, if Available=[3,3,2], the system is in:', type: 'MCQ', options: ['Safe state','Unsafe state','Deadlock','Cannot determine without full allocation matrix'], correctAnswer: 'Cannot determine without full allocation matrix', concept: 'Deadlock Avoidance' },
      { text: 'Page reference string: 7,0,1,2,0,3,0,4,2,3,0,3,2,1,2. With 3 frames using LRU, the number of page faults is:', type: 'NAT', options: [], correctAnswer: '12', concept: 'Page Replacement' },
      { text: 'A process has 5 pages. Page table entries are: {0→3, 1→7, 2→5, 3→2, 4→9}. Page size=4KB. Logical address 8196 maps to physical address:', type: 'NAT', options: [], correctAnswer: '20484', concept: 'Paging Address Translation' },
      { text: 'Two processes execute: P1: wait(S); wait(Q); signal(Q); signal(S) and P2: wait(Q); wait(S); signal(S); signal(Q). This can lead to:', type: 'MCQ', options: ['Starvation only','Deadlock','Neither deadlock nor starvation','Race condition only'], correctAnswer: 'Deadlock', concept: 'Deadlock Detection' },
      { text: 'In Round Robin with time quantum=3, processes P1(burst=10), P2(burst=4), P3(burst=3) arrive at t=0. P2 finishes at time:', type: 'NAT', options: [], correctAnswer: '10', concept: 'Round Robin Scheduling' },
      { text: 'A system uses 2-level page table. Virtual address=30 bits, page size=1KB. Each PTE=4 bytes. The total size of all inner page tables is:', type: 'MCQ', options: ['4KB','4MB','1MB','80KB'], correctAnswer: '4MB', concept: 'Multi-level Paging' },
      { text: 'A disk has 200 tracks (0-199). Current head position=53. Request queue: 98,183,37,122,14,124,65,67. Using SSTF, the total head movement is:', type: 'NAT', options: [], correctAnswer: '236', concept: 'Disk Scheduling' },
      { text: 'Peterson\'s solution for 2 processes uses which variables?', type: 'MCQ', options: ['One shared boolean','Two flags and one turn variable','One semaphore','Two mutexes'], correctAnswer: 'Two flags and one turn variable', concept: 'Process Synchronization' },
      { text: 'A system with 4 resources and 3 processes has allocation [1,1,2] and max [2,2,3]. Total instances=4. The system is in:', type: 'MCQ', options: ['Safe state','Unsafe state','Deadlocked state','Cannot be determined'], correctAnswer: 'Unsafe state', concept: 'Banker\'s Algorithm' },
    ],
    'Computer Networks': [
      { text: 'A host has IP 192.168.1.100/26. The broadcast address and number of usable hosts are:', type: 'MCQ', options: ['192.168.1.127 and 62','192.168.1.128 and 64','192.168.1.63 and 30','192.168.1.255 and 254'], correctAnswer: '192.168.1.127 and 62', concept: 'Subnetting' },
      { text: 'In Stop-and-Wait ARQ, link bandwidth=1Mbps, RTT=20ms, frame size=1000 bits. The utilization is:', type: 'NAT', options: [], correctAnswer: '0.048', concept: 'Flow Control' },
      { text: 'TCP uses 3-way handshake. If SYN is sent at t=0 and RTT=100ms, the connection is established at approximately:', type: 'NAT', options: [], correctAnswer: '150', concept: 'TCP Connection' },
      { text: 'Given a network 10.0.0.0/8 divided into 16 equal subnets. The subnet mask is:', type: 'MCQ', options: ['255.240.0.0','255.248.0.0','255.128.0.0','255.255.0.0'], correctAnswer: '255.240.0.0', concept: 'Subnetting' },
      { text: 'In Go-Back-N with window size W=4 and sequence numbers 0-7, sender sends frames 0,1,2,3. Frame 1 is lost. After timeout, sender retransmits:', type: 'MCQ', options: ['Only frame 1','Frames 1,2,3','Frames 1,2,3,4','All frames from 0'], correctAnswer: 'Frames 1,2,3', concept: 'Sliding Window' },
      { text: 'A channel has bandwidth 3000 Hz and SNR=1023. Maximum data rate by Shannon theorem is:', type: 'NAT', options: [], correctAnswer: '30000', concept: 'Channel Capacity' },
      { text: 'In CSMA/CD, the minimum frame size depends on:', type: 'MCQ', options: ['Bandwidth only','Propagation delay only','Both bandwidth and propagation delay (2×propagation×bandwidth)','MTU of the network'], correctAnswer: 'Both bandwidth and propagation delay (2×propagation×bandwidth)', concept: 'MAC Protocols' },
      { text: 'A router has 4 interfaces. It receives a packet with TTL=1. The router:', type: 'MCQ', options: ['Forwards with TTL=0','Drops and sends ICMP Time Exceeded','Forwards with TTL=255','Drops silently'], correctAnswer: 'Drops and sends ICMP Time Exceeded', concept: 'IP Protocol' },
      { text: 'In a sliding window protocol, if sender window size=6 and receiver window size=1, the minimum sequence number bits needed is:', type: 'NAT', options: [], correctAnswer: '3', concept: 'Sliding Window Protocol' },
      { text: 'An Ethernet frame is 1518 bytes. With a preamble of 8 bytes and inter-frame gap of 12 bytes, the efficiency on a 100 Mbps link is approximately:', type: 'MCQ', options: ['98.7%','94.9%','95.7%','100%'], correctAnswer: '98.7%', concept: 'Ethernet Efficiency' },
    ],
    'Theory of Computation': [
      { text: 'The minimum DFA for L = {w ∈ {a,b}* | w has an even number of a\'s and odd number of b\'s} has how many states?', type: 'NAT', options: [], correctAnswer: '4', concept: 'DFA Minimization' },
      { text: 'Consider the grammar S→aS|bS|ε. The language generated is:', type: 'MCQ', options: ['{a,b}*','All strings starting with a','All strings ending with b','Only ε'], correctAnswer: '{a,b}*', concept: 'CFG Languages' },
      { text: 'L = {0^n 1^n | n ≥ 1} is not regular. Using pumping lemma with string w = 0^p 1^p, if we pump the substring of 0\'s, the resulting string:', type: 'MCQ', options: ['Has unequal 0s and 1s, so not in L','Still has equal 0s and 1s','Becomes empty','Has more 1s than 0s'], correctAnswer: 'Has unequal 0s and 1s, so not in L', concept: 'Pumping Lemma' },
      { text: 'An NFA has states {q0,q1,q2}, alphabet={0,1}, transitions: δ(q0,0)={q0,q1}, δ(q0,1)={q0}, δ(q1,1)={q2}. q2 is final. The language accepted is:', type: 'MCQ', options: ['Strings ending in 01','Strings containing 01','Strings starting with 01','All binary strings'], correctAnswer: 'Strings ending in 01', concept: 'NFA Construction' },
      { text: 'The language L = {ww^R | w ∈ {a,b}*} (even-length palindromes) is:', type: 'MCQ', options: ['Regular','DCFL','CFL but not DCFL','CSL but not CFL'], correctAnswer: 'CFL but not DCFL', concept: 'Language Classification' },
      { text: 'A PDA accepts L = {a^i b^j | i ≠ j}. The minimum number of states needed is:', type: 'NAT', options: [], correctAnswer: '4', concept: 'PDA Design' },
      { text: 'The intersection of a CFL and a regular language is always:', type: 'MCQ', options: ['Regular','CFL','CSL','Recursively enumerable'], correctAnswer: 'CFL', concept: 'Closure Properties' },
      { text: 'Rice\'s theorem states that every non-trivial property of RE languages is:', type: 'MCQ', options: ['Decidable','Undecidable','Semi-decidable','NP-complete'], correctAnswer: 'Undecidable', concept: 'Decidability' },
      { text: 'The number of strings of length 4 accepted by the DFA over {0,1} that accepts binary numbers divisible by 3 is:', type: 'NAT', options: [], correctAnswer: '6', concept: 'DFA Language Counting' },
      { text: 'Consider two TMs: M1 accepts {0^n 1^n} and M2 accepts {0^n 1^n 0^n}. Which of the following is true?', type: 'MCQ', options: ['Both M1 and M2 are decidable','M1 is decidable but M2 is not','Both are undecidable','M1 is CFL, M2 is CSL, both decidable'], correctAnswer: 'M1 is CFL, M2 is CSL, both decidable', concept: 'Chomsky Hierarchy' },
    ],
    'Compiler Design': [
      { text: 'Grammar: E→E+T|T, T→T*F|F, F→(E)|id. FIRST(E) is:', type: 'MCQ', options: ['{(, id}','{+, *, (, id}','{E, T, F}','{(, id, +}'], correctAnswer: '{(, id}', concept: 'FIRST Sets' },
      { text: 'For the grammar S→AB, A→a|ε, B→b|ε. FOLLOW(A) is:', type: 'MCQ', options: ['{b, $}','{a, b}','{$}','{b}'], correctAnswer: '{b, $}', concept: 'FOLLOW Sets' },
      { text: 'The string "id + id * id" is parsed by an SLR(1) parser. The number of reductions performed is:', type: 'NAT', options: [], correctAnswer: '5', concept: 'SLR Parsing' },
      { text: 'Given grammar S→aABe, A→Abc|b, B→d. The string "abbcde" is parsed using shift-reduce. The handle after reading "abb" is:', type: 'MCQ', options: ['abb','bb','b (rightmost b)','ab'], correctAnswer: 'b (rightmost b)', concept: 'Bottom-up Parsing' },
      { text: 'Three-address code for x = a[i] + b[j] requires how many instructions (including array access)?', type: 'NAT', options: [], correctAnswer: '4', concept: 'Intermediate Code' },
      { text: 'An LL(1) grammar must be:', type: 'MCQ', options: ['Left recursive','Right recursive or non-recursive','Ambiguous','Left factored with no left recursion'], correctAnswer: 'Left factored with no left recursion', concept: 'LL Parsing Constraints' },
      { text: 'In a DAG representation of expression a+a*(b-c)+(b-c)*d, the number of interior nodes is:', type: 'NAT', options: [], correctAnswer: '4', concept: 'DAG Optimization' },
      { text: 'A lexer uses the regex (a|b)*abb to recognize tokens. The minimum DFA states needed is:', type: 'NAT', options: [], correctAnswer: '4', concept: 'Lexical Analysis DFA' },
      { text: 'Live variable analysis is a:', type: 'MCQ', options: ['Forward, may analysis','Forward, must analysis','Backward, may analysis','Backward, must analysis'], correctAnswer: 'Backward, may analysis', concept: 'Data Flow Analysis' },
      { text: 'In an LR(0) item set, the item S→A.B indicates:', type: 'MCQ', options: ['A has been fully parsed','B is yet to be parsed','Both A and B are parsed','Neither is parsed'], correctAnswer: 'B is yet to be parsed', concept: 'LR Parsing' },
    ],
    'Digital Logic': [
      { text: 'F(A,B,C,D) = Σm(0,1,2,5,8,9,10) with don\'t cares d(3,7). After K-map minimization, the number of prime implicants is:', type: 'NAT', options: [], correctAnswer: '3', concept: 'K-Map Minimization' },
      { text: 'A synchronous counter counts: 000→001→010→011→100→000. The number of flip-flops and the type of counter is:', type: 'MCQ', options: ['3 flip-flops, mod-5','3 flip-flops, mod-8','4 flip-flops, mod-5','2 flip-flops, mod-5'], correctAnswer: '3 flip-flops, mod-5', concept: 'Counter Design' },
      { text: 'Implement F(A,B,C) = Σm(1,2,5,7) using an 8:1 MUX with A,B,C as select lines. The input to line 0 is:', type: 'NAT', options: [], correctAnswer: '0', concept: 'MUX Implementation' },
      { text: 'A master-slave JK flip-flop has J=1, K=1. If current Q=0, after one clock pulse Q becomes:', type: 'NAT', options: [], correctAnswer: '1', concept: 'Flip-Flop Behavior' },
      { text: 'The Boolean function F = AB\'C + A\'BC + ABC\' + ABC can be simplified to:', type: 'MCQ', options: ['AB + BC + AC','A + BC','AB + C','A(B+C) + BC'], correctAnswer: 'AB + BC + AC', concept: 'Boolean Simplification' },
      { text: 'A 4-bit ripple carry adder adds 0110 and 1011. The sum and carry out are:', type: 'MCQ', options: ['10001 (sum=0001, Cout=1)','01001 (sum=1001, Cout=0)','10010 (sum=0010, Cout=1)','00001 (sum=0001, Cout=0)'], correctAnswer: '10001 (sum=0001, Cout=1)', concept: 'Adder Circuits' },
      { text: 'A 3-to-8 decoder with enable is used to implement F(A,B,C) = Σm(1,3,5,7). The output is taken from:', type: 'MCQ', options: ['OR of outputs 1,3,5,7','AND of outputs 1,3,5,7','NAND of outputs 0,2,4,6','NOR of outputs 1,3,5,7'], correctAnswer: 'OR of outputs 1,3,5,7', concept: 'Decoder Applications' },
      { text: 'A finite state machine has 12 states. The minimum number of state variables (flip-flops) needed is:', type: 'NAT', options: [], correctAnswer: '4', concept: 'FSM Design' },
      { text: 'In a mealy machine, the output changes:', type: 'MCQ', options: ['Only on clock edge','On input change between clock edges','Only on state change','Never asynchronously'], correctAnswer: 'On input change between clock edges', concept: 'Mealy vs Moore' },
      { text: 'A ROM of size 256×8 can implement how many Boolean functions of 8 variables simultaneously?', type: 'NAT', options: [], correctAnswer: '8', concept: 'ROM as Function Generator' },
    ],
  },
  'GATE ECE': {
    'Network Theory': [
      { text: 'In a series RLC circuit with R=5Ω, L=0.1H, C=1mF, the resonant frequency in rad/s is:', type: 'NAT', options: [], correctAnswer: '100', concept: 'Resonance' },
      { text: 'Thevenin voltage across terminals A-B of a circuit with 12V source and 4Ω, 6Ω in series (A-B across 6Ω) is:', type: 'NAT', options: [], correctAnswer: '7.2', concept: 'Thevenin Theorem' },
      { text: 'For a two-port network with Z11=10, Z12=3, Z21=3, Z22=5, the network is reciprocal because:', type: 'MCQ', options: ['Z11=Z22','Z12=Z21','Z11·Z22-Z12·Z21=41','All parameters are positive'], correctAnswer: 'Z12=Z21', concept: 'Two-Port Networks' },
      { text: 'An RC circuit with R=1kΩ, C=1μF is charged to 10V. Voltage across C at t=1ms is approximately:', type: 'MCQ', options: ['3.68V','6.32V','0V','10V'], correctAnswer: '3.68V', concept: 'Transient Analysis' },
      { text: 'In a graph with 5 nodes, 8 branches, and 2 separate parts, the independent mesh equations:', type: 'NAT', options: [], correctAnswer: '5', concept: 'Graph Theory' },
      { text: 'Maximum power transferred to load when source has Zth=4+j3Ω is when ZL equals:', type: 'MCQ', options: ['4+j3','4-j3','5Ω','7Ω'], correctAnswer: '4-j3', concept: 'Max Power Transfer' },
      { text: 'H(s)=10s/(s²+3s+2). The poles are at s=:', type: 'MCQ', options: ['-1 and -2','1 and 2','-1 and 2','0 and -3'], correctAnswer: '-1 and -2', concept: 'Pole-Zero Analysis' },
      { text: 'The initial current through a 2H inductor with stored energy 8J is:', type: 'MCQ', options: ['2A','2.83A','4A','1A'], correctAnswer: '2.83A', concept: 'Inductor Energy' },
      { text: 'Balanced Wheatstone bridge: R1=100Ω, R2=200Ω, R3=150Ω. R4 equals:', type: 'NAT', options: [], correctAnswer: '300', concept: 'Bridge Circuits' },
      { text: 'A circuit has two current sources 5A and 3A in parallel with internal resistances 4Ω and 6Ω. Norton current is:', type: 'MCQ', options: ['8A','2A','3.8A','5A'], correctAnswer: '3.8A', concept: 'Norton Theorem' },
    ],
    'Signals and Systems': [
      { text: 'A signal x(t) has bandwidth 4kHz sampled at 10kHz. The signal is perfectly reconstructed because fs=10kHz which is:', type: 'MCQ', options: ['Equal to 2fm','Greater than 2fm','Less than 2fm','Equal to fm'], correctAnswer: 'Greater than 2fm', concept: 'Nyquist Sampling' },
      { text: 'H(z)=(z-1)/(z-0.5) with ROC |z|>0.5. For input x[n]=u[n], the value of y[1] is:', type: 'NAT', options: [], correctAnswer: '0.5', concept: 'Z-Transform Analysis' },
      { text: 'System y[n]=x[n]+x[n-1]. The magnitude response |H(e^jω)| at ω=π is:', type: 'NAT', options: [], correctAnswer: '0', concept: 'Frequency Response' },
      { text: 'h[n]=(0.5)^n u[n]. The system is stable because Σ|h[n]| converges to:', type: 'NAT', options: [], correctAnswer: '2', concept: 'BIBO Stability' },
      { text: 'x(t)=cos(100πt)+cos(200πt). Minimum sampling rate to avoid aliasing is:', type: 'NAT', options: [], correctAnswer: '200', concept: 'Sampling Rate' },
      { text: 'The autocorrelation Rxx(0) of x(t)=3cos(10t)+4sin(10t) is:', type: 'NAT', options: [], correctAnswer: '12.5', concept: 'Autocorrelation' },
      { text: 'y(t)=x(2t) is time-variant because:', type: 'MCQ', options: ['It compresses the signal','Shifting input by t0 gives x(2t-2t0) not x(2(t-t0))','It doubles frequency','It is non-causal'], correctAnswer: 'Shifting input by t0 gives x(2t-2t0) not x(2(t-t0))', concept: 'Time Invariance' },
      { text: 'The Laplace transform of t·u(t) is:', type: 'MCQ', options: ['1/s','1/s²','2/s³','s'], correctAnswer: '1/s²', concept: 'Laplace Transform' },
      { text: 'DFT of x[n]={1,1,1,1} (N=4). X[0] equals:', type: 'NAT', options: [], correctAnswer: '4', concept: 'DFT' },
      { text: 'A system with h(t)=e^(2t)u(t) is unstable because:', type: 'MCQ', options: ['h(t) is non-causal','∫|h(t)|dt diverges','h(t) has a pole in RHP','Both ∫|h(t)|dt diverges and pole in RHP'], correctAnswer: 'Both ∫|h(t)|dt diverges and pole in RHP', concept: 'Stability Analysis' },
    ],
    'Digital Circuits': [
      { text: 'A 4-bit synchronous up-counter starts at 1010. After 7 clock pulses, the output is:', type: 'MCQ', options: ['0001','0010','0000','0011'], correctAnswer: '0001', concept: 'Counters' },
      { text: 'A 16K×8 memory chip requires total address+data lines:', type: 'NAT', options: [], correctAnswer: '22', concept: 'Memory Organization' },
      { text: 'F=Σm(0,2,5,7) using 4:1 MUX with A,B as select. Input I0 in terms of C is:', type: 'MCQ', options: ['C\'','C','1','0'], correctAnswer: 'C\'', concept: 'MUX Design' },
      { text: 'An 8-bit successive approximation ADC with 1MHz clock completes one conversion in μs:', type: 'NAT', options: [], correctAnswer: '8', concept: 'ADC Timing' },
      { text: 'Propagation delay of a 32-bit ripple carry adder (each FA delay=10ns) is:', type: 'NAT', options: [], correctAnswer: '320', concept: 'Adder Delay Analysis' },
      { text: 'Moore FSM for detecting "101" in serial bit stream needs minimum states:', type: 'NAT', options: [], correctAnswer: '4', concept: 'Sequence Detector' },
      { text: 'Two 4K×4 RAM chips combined create memory of size:', type: 'MCQ', options: ['4K×8','8K×4','8K×8','4K×16'], correctAnswer: '4K×8', concept: 'Memory Expansion' },
      { text: 'A 3-bit flash ADC requires comparators:', type: 'NAT', options: [], correctAnswer: '7', concept: 'Flash ADC' },
      { text: 'A hazard in combinational circuits is eliminated by:', type: 'MCQ', options: ['Adding redundant prime implicants','Removing essential PI','Using more gates','Reducing variables'], correctAnswer: 'Adding redundant prime implicants', concept: 'Hazard Elimination' },
      { text: 'A shift register loaded with 1011 after 2 right shifts (serial input=0) contains:', type: 'MCQ', options: ['0010','0011','1101','0101'], correctAnswer: '0010', concept: 'Shift Registers' },
    ],
    'Communications': [
      { text: 'AM signal: carrier power=10W, modulation index=0.5. Total sideband power in watts is:', type: 'NAT', options: [], correctAnswer: '1.25', concept: 'AM Power' },
      { text: 'FM signal: m(t) bandwidth=10kHz, kf=50kHz/V, max|m(t)|=2V. Carson bandwidth in Hz is:', type: 'NAT', options: [], correctAnswer: '220000', concept: 'FM Bandwidth' },
      { text: 'In 16-QAM, bits per symbol is:', type: 'NAT', options: [], correctAnswer: '4', concept: 'Digital Modulation' },
      { text: 'PCM: 8kHz sampling, 8 bits/sample. The bit rate in bps is:', type: 'NAT', options: [], correctAnswer: '64000', concept: 'PCM Bit Rate' },
      { text: 'Superheterodyne receiver with IF=455kHz tuned to 1MHz. Image frequency in Hz is:', type: 'NAT', options: [], correctAnswer: '1910000', concept: 'Image Frequency' },
      { text: 'Channel bandwidth=4kHz, SNR=31. Shannon capacity in kbps is:', type: 'NAT', options: [], correctAnswer: '20', concept: 'Channel Capacity' },
      { text: 'QPSK spectral efficiency compared to BPSK is:', type: 'MCQ', options: ['Same','Twice','Half','Four times'], correctAnswer: 'Twice', concept: 'Spectral Efficiency' },
      { text: 'A (7,4) Hamming code can correct up to how many errors per codeword?', type: 'NAT', options: [], correctAnswer: '1', concept: 'Error Correction' },
      { text: 'Delta modulation slope overload occurs when the input signal changes:', type: 'MCQ', options: ['Too slowly','Too rapidly','At constant rate','Not at all'], correctAnswer: 'Too rapidly', concept: 'Delta Modulation' },
      { text: 'Entropy of a source with probabilities {0.5, 0.25, 0.125, 0.125} in bits is:', type: 'NAT', options: [], correctAnswer: '1.75', concept: 'Information Theory' },
    ],
    'Control Systems': [
      { text: 'G(s)=K/s(s+2)(s+4). By Routh criterion, the range of K for stability is:', type: 'MCQ', options: ['0<K<48','0<K<24','K>48','K>0'], correctAnswer: '0<K<48', concept: 'Routh-Hurwitz' },
      { text: 'Second-order system: ωn=10 rad/s, ζ=0.5. Peak time tp is approximately:', type: 'MCQ', options: ['0.363s','0.628s','0.1s','1.0s'], correctAnswer: '0.363s', concept: 'Time Response' },
      { text: 'G(s)H(s)=K(s+1)/s²(s+5). The system type is:', type: 'NAT', options: [], correctAnswer: '2', concept: 'System Type' },
      { text: 'Unity feedback, G(s)=10/s(s+1). Steady-state error for ramp input is:', type: 'NAT', options: [], correctAnswer: '0.1', concept: 'Steady-State Error' },
      { text: 'Root locus of G(s)H(s)=K/s(s+3)(s+5): asymptote angles are:', type: 'MCQ', options: ['60°,180°,300°','90°,270°','0°,120°,240°','45°,135°,225°'], correctAnswer: '60°,180°,300°', concept: 'Root Locus' },
      { text: 'Lag compensator has pole closer to origin than zero. This improves:', type: 'MCQ', options: ['Transient response','Steady-state accuracy','Bandwidth','Rise time'], correctAnswer: 'Steady-state accuracy', concept: 'Compensator Design' },
      { text: 'Number of asymptotes in root locus of G(s)=K/(s(s+1)(s+3)) is:', type: 'NAT', options: [], correctAnswer: '3', concept: 'Root Locus Properties' },
      { text: 'State matrix A=[[0,1],[-2,-3]]. The eigenvalues are:', type: 'MCQ', options: ['-1 and -2','1 and 2','-1 and 2','0 and -3'], correctAnswer: '-1 and -2', concept: 'State Space' },
      { text: 'G(s)=100/(s+10). The DC gain in dB is:', type: 'NAT', options: [], correctAnswer: '20', concept: 'Bode Plot' },
      { text: 'G(jω)=1/(jω(jω+1)). Phase at ω=1 rad/s is:', type: 'MCQ', options: ['-90°','-135°','-180°','-45°'], correctAnswer: '-135°', concept: 'Phase Analysis' },
    ],
  },
  'JEE Main': {
    'Physics - Mechanics': [
      { text: 'A block slides down a 30° incline with μ=0.3. If g=10m/s², the acceleration in m/s² is:', type: 'NAT', options: [], correctAnswer: '2.4', concept: 'Inclined Plane' },
      { text: 'Two masses 3kg and 5kg connected by a string over a frictionless pulley (Atwood machine). The acceleration is (g=10m/s²):', type: 'NAT', options: [], correctAnswer: '2.5', concept: 'Newton Laws' },
      { text: 'A projectile is fired at 60° with velocity 40m/s. Maximum height reached is (g=10m/s²):', type: 'NAT', options: [], correctAnswer: '60', concept: 'Projectile Motion' },
      { text: 'A disc of mass 2kg and radius 0.5m rolls without slipping. Its total KE at v=4m/s is:', type: 'NAT', options: [], correctAnswer: '24', concept: 'Rolling Motion' },
      { text: 'A satellite orbits Earth at height h=R (R=radius of Earth). Its orbital velocity relative to surface velocity is:', type: 'MCQ', options: ['v₀/√2','v₀×√2','v₀/2','2v₀'], correctAnswer: 'v₀/√2', concept: 'Orbital Mechanics' },
      { text: 'Spring constant k=500N/m, mass=2kg in SHM. The time period in seconds is:', type: 'MCQ', options: ['0.4π','0.2π','2π','π'], correctAnswer: '0.4π', concept: 'SHM' },
      { text: 'A 2kg ball moving at 5m/s collides elastically with a stationary 3kg ball. Speed of 2kg ball after collision is:', type: 'NAT', options: [], correctAnswer: '1', concept: 'Elastic Collision' },
      { text: 'Work done by gravity on a 5kg mass sliding 10m down a 37° incline is (g=10m/s²):', type: 'NAT', options: [], correctAnswer: '300', concept: 'Work Energy' },
      { text: 'A torque of 20Nm is applied to a wheel of moment of inertia 4kg·m². Angular acceleration in rad/s² is:', type: 'NAT', options: [], correctAnswer: '5', concept: 'Rotational Dynamics' },
      { text: 'A body starts from rest with acceleration 2m/s². Distance covered in the 5th second is:', type: 'NAT', options: [], correctAnswer: '9', concept: 'Kinematics' },
    ],
    'Physics - Electromagnetism': [
      { text: 'Three capacitors 2μF, 3μF, 6μF in parallel. Equivalent capacitance in μF is:', type: 'NAT', options: [], correctAnswer: '11', concept: 'Capacitance' },
      { text: 'A wire of resistance 12Ω is bent into a circle. Resistance between diametrically opposite points is:', type: 'NAT', options: [], correctAnswer: '3', concept: 'Resistance Networks' },
      { text: 'A circular coil of 100 turns, area 0.01m² in B=0.1T rotates at 50 rev/s. Peak EMF in volts is:', type: 'MCQ', options: ['10π','100π','π','50π'], correctAnswer: '10π', concept: 'Electromagnetic Induction' },
      { text: 'A proton enters uniform B=0.5T perpendicular to its velocity v=10⁶m/s. Radius of circular path (mp=1.67×10⁻²⁷kg) is:', type: 'MCQ', options: ['0.021m','0.21m','2.1m','0.0021m'], correctAnswer: '0.021m', concept: 'Charged Particle Motion' },
      { text: 'In an LCR series circuit, L=0.1H, C=100μF, R=10Ω. The quality factor is:', type: 'MCQ', options: ['3.16','10','1','31.6'], correctAnswer: '3.16', concept: 'AC Circuits' },
      { text: 'A parallel plate capacitor with plate area 0.01m², separation 1mm, εr=5. Capacitance in pF is:', type: 'NAT', options: [], correctAnswer: '443', concept: 'Capacitors' },
      { text: 'Current I=2A in a solenoid of 500 turns, length 0.5m. Magnetic field inside in mT is:', type: 'NAT', options: [], correctAnswer: '2.51', concept: 'Solenoid' },
      { text: 'A galvanometer of resistance 50Ω gives full deflection at 1mA. Shunt needed for 1A ammeter is:', type: 'MCQ', options: ['0.05Ω','0.5Ω','5Ω','50Ω'], correctAnswer: '0.05Ω', concept: 'Galvanometer Conversion' },
      { text: 'Electric field at distance 10cm from a line charge of λ=2×10⁻⁶ C/m is (in kV/m):', type: 'NAT', options: [], correctAnswer: '360', concept: 'Electric Field' },
      { text: 'A transformer steps down 220V to 22V. If primary has 1000 turns, secondary turns:', type: 'NAT', options: [], correctAnswer: '100', concept: 'Transformers' },
    ],
    'Chemistry - Organic': [
      { text: 'CH₃CH=CH₂ + HBr → product by Markovnikov rule is:', type: 'MCQ', options: ['1-Bromopropane','2-Bromopropane','1,2-Dibromopropane','Propane'], correctAnswer: '2-Bromopropane', concept: 'Addition Reactions' },
      { text: 'The number of sp² hybridized carbons in CH₂=CH-CH=CH₂ is:', type: 'NAT', options: [], correctAnswer: '4', concept: 'Hybridization' },
      { text: 'SN2 rate is fastest for which substrate?', type: 'MCQ', options: ['CH₃Br','(CH₃)₂CHBr','(CH₃)₃CBr','C₆H₅CHBrCH₃'], correctAnswer: 'CH₃Br', concept: 'Nucleophilic Substitution' },
      { text: 'The number of structural isomers of C₅H₁₂ is:', type: 'NAT', options: [], correctAnswer: '3', concept: 'Structural Isomerism' },
      { text: 'Ozonolysis of 2-butene produces:', type: 'MCQ', options: ['2 moles of acetaldehyde','1 mole formaldehyde + 1 mole acetaldehyde','2 moles of formaldehyde','1 mole acetone + 1 mole formaldehyde'], correctAnswer: '2 moles of acetaldehyde', concept: 'Ozonolysis' },
      { text: 'In the Cannizzaro reaction, benzaldehyde gives:', type: 'MCQ', options: ['Benzyl alcohol + benzoic acid','Benzene + CO₂','Benzophenone','Cinnamaldehyde'], correctAnswer: 'Benzyl alcohol + benzoic acid', concept: 'Aldehyde Reactions' },
      { text: 'The degree of unsaturation in C₆H₅NO₂ is:', type: 'NAT', options: [], correctAnswer: '5', concept: 'Degree of Unsaturation' },
      { text: 'Lucas test gives turbidity fastest with:', type: 'MCQ', options: ['Primary alcohol','Secondary alcohol','Tertiary alcohol','Methanol'], correctAnswer: 'Tertiary alcohol', concept: 'Alcohol Tests' },
      { text: 'How many monosubstitution products does neopentane give on chlorination?', type: 'NAT', options: [], correctAnswer: '1', concept: 'Halogenation' },
      { text: 'The product of aldol condensation of acetaldehyde is:', type: 'MCQ', options: ['3-Hydroxybutanal','Butanal','Crotonaldehyde','Acetic acid'], correctAnswer: '3-Hydroxybutanal', concept: 'Aldol Condensation' },
    ],
    'Chemistry - Inorganic': [
      { text: 'The oxidation state of Mn in KMnO₄ is:', type: 'NAT', options: [], correctAnswer: '7', concept: 'Oxidation States' },
      { text: 'An FCC unit cell contains effectively how many atoms?', type: 'NAT', options: [], correctAnswer: '4', concept: 'Solid State' },
      { text: 'PCl₅ has shape trigonal bipyramidal. The number of 90° Cl-P-Cl bond angles is:', type: 'NAT', options: [], correctAnswer: '6', concept: 'VSEPR Theory' },
      { text: 'The magnetic moment of Ti³⁺ (Z=22) in BM is approximately:', type: 'MCQ', options: ['1.73','2.83','3.87','0'], correctAnswer: '1.73', concept: 'd-Block Elements' },
      { text: '[Co(NH₃)₆]³⁺ is diamagnetic. Co³⁺ (d⁶) must be in which field?', type: 'MCQ', options: ['Weak field','Strong field','No field','Medium field'], correctAnswer: 'Strong field', concept: 'Crystal Field Theory' },
      { text: 'The number of lone pairs on Xe in XeF₄ is:', type: 'NAT', options: [], correctAnswer: '2', concept: 'Noble Gas Compounds' },
      { text: 'In the thermite reaction, Al reduces Fe₂O₃. Al acts as:', type: 'MCQ', options: ['Oxidizing agent','Reducing agent','Catalyst','Flux'], correctAnswer: 'Reducing agent', concept: 'Metallurgy' },
      { text: 'The packing efficiency of BCC structure is approximately:', type: 'MCQ', options: ['52%','68%','74%','90%'], correctAnswer: '68%', concept: 'Solid State Packing' },
      { text: 'Among Na, Mg, Al, Si — which has the highest ionization energy?', type: 'MCQ', options: ['Na','Mg','Al','Si'], correctAnswer: 'Si', concept: 'Periodic Trends' },
      { text: 'The bond order of NO is:', type: 'NAT', options: [], correctAnswer: '2.5', concept: 'MOT' },
    ],
    'Mathematics - Calculus': [
      { text: 'If f(x)=x³-3x²+2, the local minimum occurs at x=:', type: 'NAT', options: [], correctAnswer: '2', concept: 'Maxima Minima' },
      { text: '∫₀¹ x·eˣ dx equals:', type: 'MCQ', options: ['1','e-1','2e-1','e'], correctAnswer: '1', concept: 'Integration by Parts' },
      { text: 'lim(x→0) (eˣ-1-x)/x² equals:', type: 'MCQ', options: ['0','1/2','1','∞'], correctAnswer: '1/2', concept: 'L\'Hopital Rule' },
      { text: 'The area enclosed between y=x² and y=2x is:', type: 'NAT', options: [], correctAnswer: '1.33', concept: 'Area Between Curves' },
      { text: 'dy/dx + 2y = e⁻ˣ. The integrating factor is:', type: 'MCQ', options: ['e²ˣ','e⁻²ˣ','eˣ','2x'], correctAnswer: 'e²ˣ', concept: 'Linear Differential Equations' },
      { text: 'The radius of curvature of y=x² at origin is:', type: 'NAT', options: [], correctAnswer: '0.5', concept: 'Curvature' },
      { text: 'd/dx[tan⁻¹(sinx/(1+cosx))] equals:', type: 'MCQ', options: ['1/2','1','cosx','1/(1+cosx)'], correctAnswer: '1/2', concept: 'Differentiation' },
      { text: '∫ dx/(x²+4x+8) requires completing the square. The answer involves:', type: 'MCQ', options: ['tan⁻¹','sin⁻¹','log','sec⁻¹'], correctAnswer: 'tan⁻¹', concept: 'Integration Techniques' },
      { text: 'The solution of dy/dx = y/x with y(1)=2 at x=3 gives y=:', type: 'NAT', options: [], correctAnswer: '6', concept: 'Separable ODE' },
      { text: 'The volume of solid of revolution of y=√x from x=0 to x=4 about x-axis is:', type: 'MCQ', options: ['8π','4π','16π','2π'], correctAnswer: '8π', concept: 'Solid of Revolution' },
    ],
    'Mathematics - Algebra': [
      { text: 'If roots of 2x²-5x+k=0 are in ratio 2:3, then k equals:', type: 'NAT', options: [], correctAnswer: '3', concept: 'Quadratic Equations' },
      { text: 'det([[1,2,3],[4,5,6],[7,8,9]]) equals:', type: 'NAT', options: [], correctAnswer: '0', concept: 'Determinants' },
      { text: 'Sum of GP: 3+6+12+...+768. Number of terms is:', type: 'NAT', options: [], correctAnswer: '9', concept: 'Geometric Series' },
      { text: 'If A is 3×3 matrix with det(A)=5, then det(adj(A)) is:', type: 'NAT', options: [], correctAnswer: '25', concept: 'Adjoint Matrix' },
      { text: 'The number of 4-letter words from MATHEMATICS with no repetition is:', type: 'MCQ', options: ['5040','2520','1680','840'], correctAnswer: '2520', concept: 'Permutations' },
      { text: 'In how many ways can 8 people sit around a circular table?', type: 'NAT', options: [], correctAnswer: '5040', concept: 'Circular Permutations' },
      { text: 'If |z|=2 and arg(z)=π/3, then z in rectangular form is:', type: 'MCQ', options: ['1+i√3','2+i√3','1+i2','√3+i'], correctAnswer: '1+i√3', concept: 'Complex Numbers' },
      { text: 'The coefficient of x³ in (1+x)¹⁰ is:', type: 'NAT', options: [], correctAnswer: '120', concept: 'Binomial Theorem' },
      { text: 'If A={1,2,3,4}, the number of subsets containing element 1 is:', type: 'NAT', options: [], correctAnswer: '8', concept: 'Set Theory' },
      { text: 'Sum to infinity: 1-1/3+1/9-1/27+... equals:', type: 'MCQ', options: ['3/4','2/3','1/2','4/3'], correctAnswer: '3/4', concept: 'Infinite GP' },
    ],
  },
  'NEET': {
    'Biology - Botany': [
      { text: 'In C3 plants, the first stable product of CO₂ fixation is 3-PGA (3-carbon). In C4 plants, it is OAA which has how many carbons?', type: 'NAT', options: [], correctAnswer: '4', concept: 'Photosynthesis Pathways' },
      { text: 'During meiosis I, crossing over occurs at pachytene. If a cell has 2n=46, the number of tetrads formed is:', type: 'NAT', options: [], correctAnswer: '23', concept: 'Cell Division' },
      { text: 'A plant shows genotype RrYy. By Mendel\'s law of independent assortment, the number of distinct gamete types is:', type: 'NAT', options: [], correctAnswer: '4', concept: 'Genetics' },
      { text: 'In aerobic respiration, 1 NADH entering ETC produces approximately how many ATP via oxidative phosphorylation?', type: 'MCQ', options: ['1.5','2','2.5','3'], correctAnswer: '2.5', concept: 'Respiration Efficiency' },
      { text: 'A pea plant heterozygous for height (Tt) is crossed with a dwarf plant (tt). The expected ratio of tall to dwarf offspring is:', type: 'MCQ', options: ['3:1','1:1','1:3','All tall'], correctAnswer: '1:1', concept: 'Mendelian Genetics' },
      { text: 'Photorespiration in C3 plants is catalyzed by RuBisCO acting on:', type: 'MCQ', options: ['CO₂ only','O₂ only','Both CO₂ and O₂','Neither'], correctAnswer: 'Both CO₂ and O₂', concept: 'Photorespiration' },
      { text: 'If a plant cell is placed in a hypertonic solution, it undergoes:', type: 'MCQ', options: ['Turgidity','Plasmolysis','Lysis','No change'], correctAnswer: 'Plasmolysis', concept: 'Osmosis' },
      { text: 'The ratio of phenotypes in a dihybrid cross F2 generation is:', type: 'MCQ', options: ['3:1','9:3:3:1','1:2:1','1:1:1:1'], correctAnswer: '9:3:3:1', concept: 'Dihybrid Cross' },
      { text: 'How many NADPH molecules are required to fix one molecule of CO₂ in the Calvin cycle?', type: 'NAT', options: [], correctAnswer: '2', concept: 'Calvin Cycle' },
      { text: 'Auxin moves basipetally in stems. This is an example of:', type: 'MCQ', options: ['Osmosis','Polar transport','Active transport','Facilitated diffusion'], correctAnswer: 'Polar transport', concept: 'Plant Hormones' },
    ],
    'Biology - Zoology': [
      { text: 'GFR in a healthy human kidney is approximately (in mL/min):', type: 'NAT', options: [], correctAnswer: '125', concept: 'Renal Physiology' },
      { text: 'A person with blood group AB can receive blood from:', type: 'MCQ', options: ['O only','A and B only','AB only','All blood groups (universal recipient)'], correctAnswer: 'All blood groups (universal recipient)', concept: 'Blood Groups' },
      { text: 'If both parents are carriers (Aa) for sickle cell anemia, probability of an affected child is:', type: 'MCQ', options: ['1/4','1/2','3/4','1'], correctAnswer: '1/4', concept: 'Human Genetics' },
      { text: 'The cardiac output = stroke volume × heart rate. If SV=70mL and HR=72/min, CO in L/min is:', type: 'NAT', options: [], correctAnswer: '5.04', concept: 'Cardiac Physiology' },
      { text: 'A codon has 3 bases. With 4 types of nucleotides, the total possible codons are:', type: 'NAT', options: [], correctAnswer: '64', concept: 'Molecular Biology' },
      { text: 'Oxyhaemoglobin dissociation curve shifts right (Bohr effect) in:', type: 'MCQ', options: ['Low CO₂ and high pH','High CO₂ and low pH','Low temperature','High O₂ concentration'], correctAnswer: 'High CO₂ and low pH', concept: 'Respiratory Physiology' },
      { text: 'In the human karyotype, total autosomes in a somatic cell are:', type: 'NAT', options: [], correctAnswer: '44', concept: 'Chromosomes' },
      { text: 'The neurotransmitter at neuromuscular junction is:', type: 'MCQ', options: ['Dopamine','Serotonin','Acetylcholine','GABA'], correctAnswer: 'Acetylcholine', concept: 'Neural Signaling' },
      { text: 'Antibodies are produced by:', type: 'MCQ', options: ['T-helper cells','B-lymphocytes (plasma cells)','Macrophages','NK cells'], correctAnswer: 'B-lymphocytes (plasma cells)', concept: 'Immunology' },
      { text: 'During DNA replication, Okazaki fragments are formed on which strand?', type: 'MCQ', options: ['Leading strand','Lagging strand','Both strands','Neither strand'], correctAnswer: 'Lagging strand', concept: 'DNA Replication' },
    ],
    'Physics': [
      { text: 'A concave mirror has focal length 15cm. An object at 30cm forms image at:', type: 'NAT', options: [], correctAnswer: '30', concept: 'Ray Optics' },
      { text: 'Two resistors 4Ω and 12Ω in parallel. A 6V battery is connected. Total current drawn is:', type: 'NAT', options: [], correctAnswer: '2', concept: 'Circuits' },
      { text: 'A convex lens of focal length 10cm. Object at 15cm. Image distance is:', type: 'NAT', options: [], correctAnswer: '30', concept: 'Lens Formula' },
      { text: 'Photon of frequency 5×10¹⁴ Hz. Its energy in eV is (h=6.6×10⁻³⁴, 1eV=1.6×10⁻¹⁹):', type: 'MCQ', options: ['2.06','3.3','1.03','4.12'], correctAnswer: '2.06', concept: 'Photoelectric Effect' },
      { text: 'A body of mass 2kg moving at 3m/s collides with a wall and bounces back at 2m/s. Change in momentum (in kg·m/s) is:', type: 'NAT', options: [], correctAnswer: '10', concept: 'Impulse Momentum' },
      { text: 'In Young\'s experiment, λ=600nm, d=0.1mm, D=1m. Fringe width in mm is:', type: 'NAT', options: [], correctAnswer: '6', concept: 'Wave Optics' },
      { text: 'A radioactive element has half-life 20 min. After 1 hour, the fraction remaining is:', type: 'MCQ', options: ['1/2','1/4','1/8','1/16'], correctAnswer: '1/8', concept: 'Nuclear Physics' },
      { text: 'EMF of 2 cells (1.5V, 0.5Ω each) in series with external resistance 4Ω. Current is:', type: 'MCQ', options: ['0.5A','0.6A','0.75A','1A'], correctAnswer: '0.6A', concept: 'EMF and Internal Resistance' },
      { text: 'A wire of length L and resistance R is stretched to 2L. New resistance is:', type: 'MCQ', options: ['R','2R','4R','R/2'], correctAnswer: '4R', concept: 'Resistance' },
      { text: 'A myopic eye has far point 2m. The corrective lens power in diopters is:', type: 'NAT', options: [], correctAnswer: '-0.5', concept: 'Defects of Vision' },
    ],
    'Chemistry': [
      { text: 'The pH of 0.01M HCl solution is:', type: 'NAT', options: [], correctAnswer: '2', concept: 'pH Calculation' },
      { text: 'How many moles of NaOH are needed to neutralize 0.5 moles of H₂SO₄?', type: 'NAT', options: [], correctAnswer: '1', concept: 'Stoichiometry' },
      { text: 'At STP, 22.4L of any ideal gas contains molecules equal to:', type: 'MCQ', options: ['6.022×10²²','6.022×10²³','3.011×10²³','12.044×10²³'], correctAnswer: '6.022×10²³', concept: 'Mole Concept' },
      { text: 'The freezing point of 0.1m NaCl (i=2) is depressed by (Kf=1.86): ΔTf =', type: 'MCQ', options: ['0.186°C','0.372°C','1.86°C','3.72°C'], correctAnswer: '0.372°C', concept: 'Colligative Properties' },
      { text: 'For a first-order reaction with k=0.693 min⁻¹, the half-life in minutes is:', type: 'NAT', options: [], correctAnswer: '1', concept: 'Chemical Kinetics' },
      { text: 'In the electrochemical series, which metal is the strongest reducing agent?', type: 'MCQ', options: ['Zinc','Iron','Lithium','Sodium'], correctAnswer: 'Lithium', concept: 'Electrochemistry' },
      { text: 'ΔG = ΔH - TΔS. A reaction is spontaneous at all temperatures when:', type: 'MCQ', options: ['ΔH>0, ΔS>0','ΔH<0, ΔS>0','ΔH<0, ΔS<0','ΔH>0, ΔS<0'], correctAnswer: 'ΔH<0, ΔS>0', concept: 'Thermodynamics' },
      { text: 'The number of sigma and pi bonds in ethyne (C₂H₂) are respectively:', type: 'MCQ', options: ['3σ, 2π','2σ, 3π','5σ, 0π','2σ, 2π'], correctAnswer: '3σ, 2π', concept: 'Chemical Bonding' },
      { text: 'Equilibrium constant Kp for N₂+3H₂⇌2NH₃ is related to Kc by Kp=Kc(RT)^Δn. Here Δn is:', type: 'NAT', options: [], correctAnswer: '-2', concept: 'Chemical Equilibrium' },
      { text: 'The molarity of a solution with 40g NaOH in 500mL is:', type: 'NAT', options: [], correctAnswer: '2', concept: 'Solution Chemistry' },
    ],
  },
  'JEE Advanced': {
    'Physics': [
      { text: 'A uniform rod of mass M, length L pivoted at one end oscillates as a physical pendulum. Its time period is T=2π√(2L/3g). If L=1.5m, T is approximately:', type: 'MCQ', options: ['2.0s','1.4s','1.0s','2.8s'], correctAnswer: '2.0s', concept: 'Physical Pendulum' },
      { text: 'In YDSE, slit separation d=0.5mm, screen distance D=1m, λ=500nm. If one slit is covered with a thin film (μ=1.5, t=1μm), the central fringe shifts by how many fringes?', type: 'NAT', options: [], correctAnswer: '1', concept: 'Wave Optics' },
      { text: 'Electron accelerated through 150V. de Broglie wavelength in angstroms is approximately:', type: 'NAT', options: [], correctAnswer: '1', concept: 'Quantum Mechanics' },
      { text: 'Carnot engine: T_hot=600K, T_cold=300K, absorbs 1000J. Work output in joules is:', type: 'NAT', options: [], correctAnswer: '500', concept: 'Thermodynamics' },
      { text: 'A solid sphere rolls down an incline of height h without slipping. Velocity at bottom is v=√(10gh/7). If h=3.5m, v is approximately:', type: 'NAT', options: [], correctAnswer: '7', concept: 'Rolling Motion' },
      { text: 'Two charges +2μC and -2μC separated by 10cm. Electric field at midpoint is (k=9×10⁹):', type: 'MCQ', options: ['14.4×10⁶ N/C','7.2×10⁶ N/C','28.8×10⁶ N/C','0'], correctAnswer: '14.4×10⁶ N/C', concept: 'Dipole Field' },
      { text: 'An LC circuit has L=1mH, C=1μF. The oscillation frequency in kHz is:', type: 'MCQ', options: ['5.03','15.9','1.59','50.3'], correctAnswer: '5.03', concept: 'LC Oscillations' },
      { text: 'Photoelectric effect: φ=2eV, photon energy=5eV. Maximum KE of emitted electrons is:', type: 'NAT', options: [], correctAnswer: '3', concept: 'Photoelectric Effect' },
      { text: 'A gas undergoes adiabatic expansion. If γ=1.4 and volume doubles, temperature changes by factor:', type: 'MCQ', options: ['2^0.4','1/2^0.4','2','1/2'], correctAnswer: '1/2^0.4', concept: 'Adiabatic Process' },
      { text: 'Two identical springs (k=100N/m) in parallel support a 2kg mass. Time period of vertical oscillation is:', type: 'MCQ', options: ['0.2π s','0.1π s','π/5 s','2π/5 s'], correctAnswer: '0.2π s', concept: 'SHM Springs' },
    ],
    'Chemistry': [
      { text: 'For 3d orbital: n=3, l=2. The total number of radial nodes is:', type: 'NAT', options: [], correctAnswer: '0', concept: 'Quantum Numbers' },
      { text: 'ΔG°=-nFE°. For a cell with E°=1.1V and n=2, ΔG° in kJ/mol is (F=96500):', type: 'MCQ', options: ['-212.3','-106.15','212.3','-96.5'], correctAnswer: '-212.3', concept: 'Electrochemistry' },
      { text: 'A reaction A→B has rate=k[A]². When [A] is doubled, rate becomes:', type: 'MCQ', options: ['2 times','4 times','8 times','Unchanged'], correctAnswer: '4 times', concept: 'Reaction Order' },
      { text: 'Crystal field splitting: [Fe(CN)₆]⁴⁻ has how many unpaired electrons? (CN⁻ is strong field)', type: 'NAT', options: [], correctAnswer: '0', concept: 'CFT' },
      { text: 'Benzaldehyde with dilute NaOH undergoes Cannizzaro. The organic acid product is:', type: 'MCQ', options: ['Benzoic acid','Acetic acid','Formic acid','Phenylacetic acid'], correctAnswer: 'Benzoic acid', concept: 'Organic Reactions' },
      { text: 'The van\'t Hoff factor for K₃[Fe(CN)₆] is:', type: 'NAT', options: [], correctAnswer: '4', concept: 'Colligative Properties' },
      { text: 'Optical isomers exist when a molecule has no plane of symmetry. The number of chiral centers in tartaric acid is:', type: 'NAT', options: [], correctAnswer: '2', concept: 'Stereochemistry' },
      { text: '2-Butanol dehydration gives predominantly:', type: 'MCQ', options: ['1-Butene','2-Butene (Saytzeff)','Butadiene','Isobutylene'], correctAnswer: '2-Butene (Saytzeff)', concept: 'Elimination Reactions' },
      { text: 'Osmotic pressure π=iCRT. A 0.1M BaCl₂ solution (i=3) at 300K has π (R=0.082):', type: 'MCQ', options: ['7.38 atm','2.46 atm','24.6 atm','0.82 atm'], correctAnswer: '7.38 atm', concept: 'Osmotic Pressure' },
      { text: 'Half-life of a zero-order reaction with k=0.1 M/s and [A]₀=2M is:', type: 'NAT', options: [], correctAnswer: '10', concept: 'Zero Order Kinetics' },
    ],
    'Mathematics': [
      { text: 'The area bounded by y=x² and y=x from x=0 to x=1 is:', type: 'NAT', options: [], correctAnswer: '0.167', concept: 'Area Between Curves' },
      { text: 'A conic section has equation x²/16 - y²/9 = 1. Its eccentricity is:', type: 'NAT', options: [], correctAnswer: '1.25', concept: 'Conic Sections' },
      { text: 'The shortest distance between lines r=(1,2,3)+t(1,0,-1) and r=(2,1,0)+s(0,1,1) is:', type: 'MCQ', options: ['1/√3','2/√3','√3','0'], correctAnswer: '1/√3', concept: '3D Geometry' },
      { text: 'P(A)=0.6, P(B)=0.5, P(A∪B)=0.8. P(A|B) equals:', type: 'MCQ', options: ['0.3','0.5','0.6','0.8'], correctAnswer: '0.6', concept: 'Conditional Probability' },
      { text: 'The sum Σ(k=1 to n) k³ = [n(n+1)/2]². For n=5, the sum is:', type: 'NAT', options: [], correctAnswer: '225', concept: 'Series Summation' },
      { text: '∫₀^(π/2) sin³x dx equals:', type: 'MCQ', options: ['2/3','1/3','4/3','π/4'], correctAnswer: '2/3', concept: 'Definite Integrals' },
      { text: 'The equation of tangent to y=eˣ at x=0 is:', type: 'MCQ', options: ['y=x+1','y=x','y=x-1','y=2x+1'], correctAnswer: 'y=x+1', concept: 'Application of Derivatives' },
      { text: 'If f(x)=x³-6x²+9x+1, the number of real roots is:', type: 'NAT', options: [], correctAnswer: '3', concept: 'Calculus + Algebra' },
      { text: 'The angle between planes 2x+y-z=3 and x-y+2z=5 is:', type: 'MCQ', options: ['60°','90°','45°','30°'], correctAnswer: '60°', concept: '3D Geometry' },
      { text: 'The matrix [[1,2],[3,4]] has eigenvalues:', type: 'MCQ', options: ['(5+√33)/2 and (5-√33)/2','1 and 4','2 and 3','0 and 5'], correctAnswer: '(5+√33)/2 and (5-√33)/2', concept: 'Linear Algebra' },
    ],
  },
  'UPSC': {
    'History': [
      { text: 'Which of the following Indus Valley sites shows evidence of a dockyard? 1.Lothal 2.Kalibangan 3.Dholavira 4.Mohenjodaro', type: 'MCQ', options: ['1 only','1 and 3','2 and 4','1, 2 and 3'], correctAnswer: '1 only', concept: 'Ancient India' },
      { text: 'Consider: 1.Cripps Mission offered Dominion status after war 2.Cabinet Mission proposed a three-tier federal structure. Which is/are correct?', type: 'MCQ', options: ['1 only','2 only','Both 1 and 2','Neither'], correctAnswer: 'Both 1 and 2', concept: 'Modern India' },
      { text: 'The Rowlatt Act of 1919 was opposed because it:', type: 'MCQ', options: ['Imposed heavy taxes','Allowed detention without trial','Banned political parties','Restricted press freedom only'], correctAnswer: 'Allowed detention without trial', concept: 'Freedom Movement' },
      { text: 'Match: A.Subsidiary Alliance-Lord Wellesley B.Doctrine of Lapse-Lord Dalhousie C.Permanent Settlement-Lord Cornwallis. Correct pairs:', type: 'MCQ', options: ['A and B only','B and C only','A, B and C','A and C only'], correctAnswer: 'A, B and C', concept: 'British Policies' },
      { text: 'The Simon Commission was boycotted because:', type: 'MCQ', options: ['It had no Indian member','It proposed partition','It imposed martial law','It dissolved Congress'], correctAnswer: 'It had no Indian member', concept: 'Freedom Movement' },
      { text: 'Consider: 1.Gandhara art shows Greek influence 2.Mathura art is purely indigenous. Which is/are correct?', type: 'MCQ', options: ['1 only','2 only','Both','Neither'], correctAnswer: 'Both', concept: 'Art and Culture' },
      { text: 'Arrange chronologically: 1.Quit India 2.Dandi March 3.Non-Cooperation 4.Civil Disobedience', type: 'MCQ', options: ['3,2,4,1','3,4,2,1','2,3,4,1','3,2,1,4'], correctAnswer: '3,2,4,1', concept: 'National Movement Timeline' },
      { text: 'The Charter Act of 1833 made the Governor-General of Bengal the Governor-General of:', type: 'MCQ', options: ['Bengal Presidency','Madras and Bombay','India','British territories only'], correctAnswer: 'India', concept: 'Constitutional History' },
      { text: 'Which Mughal emperor abolished Jizya tax?', type: 'MCQ', options: ['Babur','Humayun','Akbar','Shah Jahan'], correctAnswer: 'Akbar', concept: 'Medieval India' },
      { text: 'The Vernacular Press Act was passed during the Viceroyalty of:', type: 'MCQ', options: ['Lord Lytton','Lord Ripon','Lord Curzon','Lord Dufferin'], correctAnswer: 'Lord Lytton', concept: 'British India Press' },
    ],
    'Geography': [
      { text: 'Consider: 1.Western Ghats are older than Himalayas 2.Eastern Ghats are continuous mountain range. Which is/are correct?', type: 'MCQ', options: ['1 only','2 only','Both','Neither'], correctAnswer: '1 only', concept: 'Indian Physiography' },
      { text: 'The Tropic of Cancer does NOT pass through:', type: 'MCQ', options: ['Rajasthan','Madhya Pradesh','Bihar','Jharkhand'], correctAnswer: 'Bihar', concept: 'Indian Geography' },
      { text: 'Arrange rivers by length (longest first): 1.Ganga 2.Godavari 3.Krishna 4.Narmada', type: 'MCQ', options: ['1,2,3,4','1,2,4,3','2,1,3,4','1,3,2,4'], correctAnswer: '1,2,3,4', concept: 'Indian Rivers' },
      { text: 'Jet streams affect Indian monsoon because they:', type: 'MCQ', options: ['Bring moisture from ocean','Shift the position of ITCZ','Create cyclonic conditions','Cool the upper atmosphere only'], correctAnswer: 'Shift the position of ITCZ', concept: 'Monsoon Mechanism' },
      { text: 'Which soil type is self-ploughing due to its expansion and contraction?', type: 'MCQ', options: ['Alluvial','Black (Regur)','Laterite','Red'], correctAnswer: 'Black (Regur)', concept: 'Indian Soils' },
      { text: 'Consider: 1.Earthquakes occur at plate boundaries 2.India lies entirely on the Indo-Australian plate. Which is/are correct?', type: 'MCQ', options: ['1 only','2 only','Both','Neither'], correctAnswer: 'Both', concept: 'Plate Tectonics' },
      { text: 'The 180° meridian mostly coincides with the:', type: 'MCQ', options: ['Prime Meridian','International Date Line','Equator','Tropic of Capricorn'], correctAnswer: 'International Date Line', concept: 'World Geography' },
      { text: 'Western disturbances bring winter rainfall to which part of India?', type: 'MCQ', options: ['South India','North-West India','North-East India','Central India'], correctAnswer: 'North-West India', concept: 'Indian Climate' },
      { text: 'Mangrove forests in India are most extensive in:', type: 'MCQ', options: ['Kerala coast','Sundarbans','Gulf of Kutch','Andaman Islands'], correctAnswer: 'Sundarbans', concept: 'Indian Vegetation' },
      { text: 'El Niño weakens the Indian monsoon because:', type: 'MCQ', options: ['It cools the Indian Ocean','It warms eastern Pacific, reducing pressure gradient','It increases Himalayan snowfall','It blocks jet streams'], correctAnswer: 'It warms eastern Pacific, reducing pressure gradient', concept: 'Climate Phenomena' },
    ],
    'Polity': [
      { text: 'Consider: 1.Article 14 guarantees equality before law 2.Article 19 gives 6 freedoms to all persons. Which is/are correct?', type: 'MCQ', options: ['1 only','2 only','Both','Neither'], correctAnswer: '1 only', concept: 'Fundamental Rights' },
      { text: 'A Money Bill can be introduced in:', type: 'MCQ', options: ['Lok Sabha only','Rajya Sabha only','Either House','Joint session'], correctAnswer: 'Lok Sabha only', concept: 'Legislative Process' },
      { text: 'The 42nd Amendment is called \'Mini Constitution\' because it:', type: 'MCQ', options: ['Added Fundamental Duties','Changed Preamble wording','Made extensive changes to multiple parts','All of the above'], correctAnswer: 'All of the above', concept: 'Constitutional Amendments' },
      { text: 'Which writ is issued to a person holding public office illegally?', type: 'MCQ', options: ['Habeas Corpus','Mandamus','Quo Warranto','Certiorari'], correctAnswer: 'Quo Warranto', concept: 'Writs' },
      { text: 'Rajya Sabha can delay a Money Bill for a maximum of:', type: 'MCQ', options: ['30 days','14 days','6 months','No delay possible'], correctAnswer: '14 days', concept: 'Financial Legislation' },
      { text: 'The concept of \'Basic Structure\' of Constitution was established in:', type: 'MCQ', options: ['Golaknath case','Kesavananda Bharati case','Minerva Mills case','Maneka Gandhi case'], correctAnswer: 'Kesavananda Bharati case', concept: 'Judicial Doctrine' },
      { text: 'The 73rd Amendment requires reservation of how many seats for women in Panchayats?', type: 'MCQ', options: ['25%','33%','50%','No reservation'], correctAnswer: '33%', concept: 'Local Governance' },
      { text: 'Which Schedule contains the anti-defection provisions?', type: 'MCQ', options: ['8th Schedule','9th Schedule','10th Schedule','11th Schedule'], correctAnswer: '10th Schedule', concept: 'Anti-Defection' },
      { text: 'The President can proclaim Financial Emergency under Article:', type: 'NAT', options: [], correctAnswer: '360', concept: 'Emergency Powers' },
      { text: 'Inter-state disputes regarding water are adjudicated by:', type: 'MCQ', options: ['Supreme Court','High Court','Inter-State Water Tribunal','Parliament'], correctAnswer: 'Inter-State Water Tribunal', concept: 'Federal Relations' },
    ],
    'Economy': [
      { text: 'If CRR is increased by RBI, the effect on money supply is:', type: 'MCQ', options: ['Increases','Decreases','No change','Becomes zero'], correctAnswer: 'Decreases', concept: 'Monetary Policy' },
      { text: 'Consider: 1.Revenue deficit = Revenue expenditure - Revenue receipts 2.Fiscal deficit includes borrowings. Which is/are correct?', type: 'MCQ', options: ['1 only','2 only','Both','Neither'], correctAnswer: 'Both', concept: 'Public Finance' },
      { text: 'GDP deflator = (Nominal GDP/Real GDP)×100. If nominal GDP=200 and real GDP=160, inflation measured by deflator is:', type: 'NAT', options: [], correctAnswer: '25', concept: 'National Income' },
      { text: 'GST is a destination-based tax. This means tax revenue goes to:', type: 'MCQ', options: ['State where goods are manufactured','State where goods are consumed','Central government only','Equally to both states'], correctAnswer: 'State where goods are consumed', concept: 'Taxation' },
      { text: 'Consider: 1.SLR is maintained with RBI 2.CRR is maintained as liquid assets by banks. Which is/are correct?', type: 'MCQ', options: ['1 only','2 only','Both','Neither (both are reversed)'], correctAnswer: 'Neither (both are reversed)', concept: 'Banking Ratios' },
      { text: 'If marginal propensity to consume is 0.8, the fiscal multiplier is:', type: 'NAT', options: [], correctAnswer: '5', concept: 'Keynesian Economics' },
      { text: 'Which of the following is NOT a function of SEBI?', type: 'MCQ', options: ['Regulate stock exchanges','Protect investor interests','Control inflation','Prohibit insider trading'], correctAnswer: 'Control inflation', concept: 'Capital Markets' },
      { text: 'The Phillips curve shows an inverse relationship between:', type: 'MCQ', options: ['GDP and inflation','Unemployment and inflation','Interest rate and investment','Savings and consumption'], correctAnswer: 'Unemployment and inflation', concept: 'Macroeconomics' },
      { text: 'Current Account Deficit includes: 1.Trade deficit 2.Net invisibles 3.Capital transfers. Select correct:', type: 'MCQ', options: ['1 only','1 and 2','1, 2 and 3','2 and 3'], correctAnswer: '1 and 2', concept: 'External Sector' },
      { text: 'The base effect in inflation means that:', type: 'MCQ', options: ['Higher base year lowers current inflation rate','Lower base year lowers inflation','Base year has no effect','It only affects WPI'], correctAnswer: 'Higher base year lowers current inflation rate', concept: 'Inflation Analysis' },
    ],
    'Science and Technology': [
      { text: 'Consider: 1.Chandrayaan-3 landed near the lunar south pole 2.ISRO used a cryogenic upper stage for GSLV. Which is/are correct?', type: 'MCQ', options: ['1 only','2 only','Both','Neither'], correctAnswer: 'Both', concept: 'Space Technology' },
      { text: 'CRISPR-Cas9 edits DNA by:', type: 'MCQ', options: ['Adding new chromosomes','Cutting DNA at specific sequences','Changing RNA only','Inserting plasmids randomly'], correctAnswer: 'Cutting DNA at specific sequences', concept: 'Gene Editing' },
      { text: 'Quantum computing uses qubits which can be in superposition. This means:', type: 'MCQ', options: ['They are faster classical bits','They can be 0 and 1 simultaneously','They use quantum tunneling only','They operate at room temperature'], correctAnswer: 'They can be 0 and 1 simultaneously', concept: 'Quantum Technology' },
      { text: 'Consider: 1.mRNA vaccines use weakened virus 2.mRNA vaccines instruct cells to produce spike protein. Which is/are correct?', type: 'MCQ', options: ['1 only','2 only','Both','Neither'], correctAnswer: '2 only', concept: 'Vaccine Technology' },
      { text: 'Blockchain ensures data integrity through:', type: 'MCQ', options: ['Central server validation','Cryptographic hashing and consensus','Firewall protection','Password encryption only'], correctAnswer: 'Cryptographic hashing and consensus', concept: 'Information Technology' },
      { text: 'Nuclear fusion is preferred over fission because: 1.No radioactive waste 2.Fuel (hydrogen) is abundant. Select correct:', type: 'MCQ', options: ['1 only','2 only','Both','Neither'], correctAnswer: '2 only', concept: 'Nuclear Energy' },
      { text: 'The GPS system requires a minimum of how many satellites for 3D positioning?', type: 'NAT', options: [], correctAnswer: '4', concept: 'Navigation Technology' },
      { text: 'India\'s NavIC navigation system covers which region?', type: 'MCQ', options: ['Global coverage','India and 1500km beyond borders','Asia only','Northern hemisphere'], correctAnswer: 'India and 1500km beyond borders', concept: 'Indian Space Tech' },
      { text: '5G\'s key advantage over 4G is:', type: 'MCQ', options: ['Higher frequency only','Low latency and higher bandwidth','Longer range','Lower power consumption only'], correctAnswer: 'Low latency and higher bandwidth', concept: 'Telecom Technology' },
      { text: 'Green hydrogen is produced by:', type: 'MCQ', options: ['Steam methane reforming','Electrolysis using renewable energy','Coal gasification','Nuclear power'], correctAnswer: 'Electrolysis using renewable energy', concept: 'Clean Energy' },
    ],
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// getParaphrasedPYQs — Picks random PYQs and sends them to AI for
// paraphrasing. Returns questions in the same format as AI-generated ones.
// ═══════════════════════════════════════════════════════════════════════════
export function pickRandomPYQs(examName, topic, count = 8) {
  const examBank = PYQ_BANK[examName];
  if (!examBank) return [];
  const topicBank = examBank[topic];
  if (!topicBank || topicBank.length === 0) return [];

  // Shuffle and pick 'count' questions
  const shuffled = [...topicBank].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

export function buildParaphrasePrompt(questions, examName, topic) {
  const qList = questions.map((q, i) => {
    const opts = q.options.length > 0
      ? `\nOptions: ${q.options.map((o, j) => `${String.fromCharCode(65+j)}. ${o}`).join(' | ')}`
      : ' [NAT — numerical answer]';
    return `Q${i+1}. ${q.text}${opts}\nCorrect Answer: ${q.correctAnswer}\nConcept: ${q.concept}`;
  }).join('\n\n');

  return `You are an expert ${examName} question paraphraser for the topic "${topic}".

TASK: Paraphrase each question below. Follow these rules STRICTLY:

FOR MCQ QUESTIONS:
- Rewrite the question text using different words but SAME concept
- Rewrite ALL options using different wording but keep the meaning
- The correct answer must map to the SAME reworded option
- Shuffle the order of options randomly

FOR NAT (Numerical) QUESTIONS:
- Change the numerical values in the question (different numbers)
- Recalculate the correct answer based on new values
- Show your calculation in "reasoning"

FOR ALL QUESTIONS:
- Keep the same difficulty level
- Keep the same concept tag
- Keep the same question type (MCQ/NAT)
- The question must still be about "${topic}" for "${examName}"
- Add "reasoning" field with 2-3 sentence explanation

ORIGINAL QUESTIONS:
${qList}

Return ONLY a valid JSON array:
[{"text":"paraphrased question","type":"MCQ","options":["opt1","opt2","opt3","opt4"],"correctAnswer":"correct option text","reasoning":"brief explanation","marks":2,"negativeMarks":0.67,"concept":"same concept"},...]`;
}

export default SUBJECT_KNOWLEDGE;
