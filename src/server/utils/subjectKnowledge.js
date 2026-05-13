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

export default SUBJECT_KNOWLEDGE;
