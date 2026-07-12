/**
 * Universal Learning Ontology (ULO)
 * Based on the UHKT + ULO architecture defined in Doc.rtf
 *
 * Every user query has MULTIPLE dimensions:
 *   1. Knowledge Domain (WHAT is being learned)
 *   2. Skill Type      (WHAT KIND of learning)
 *   3. Teaching Method (HOW to teach it)
 *   4. Visualization   (WHAT engine to render)
 *   5. Tool Context    (IS this software being taught)
 *   6. Accessibility   (WHO is learning / special needs)
 *
 * The Master Router reads this file and picks the right combination
 * for any topic on earth.
 */

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

export type VisualizationEngine =
    | 'jsxgraph'           // Math / graphs / economics charts
    | 'concept_diagram'    // SVG concept diagrams (biology, earth science)
    | 'mermaid_diagram'    // Auto-generated flowcharts / process maps
    | 'anatomy'            // 3D organ viewer (Three.js / React Three Fiber)
    | 'molecule_view'      // 3D molecule viewer (3Dmol.js)
    | 'lab_simulation'     // Physics / chemistry interactive sim (P5.js)
    | 'general_image'      // Wikipedia image + AI description
    | 'timeline'           // Horizontal timeline (history, biographies)
    | 'code_playground'    // Live code editor (future: CodeMirror / Sandpack)
    | 'space_simulator'    // Orbital mechanics / solar system (future)
    | 'piano_roll'         // Music notation / chord diagrams (future)
    | 'interactive_globe'  // World map / geography (future)
    | 'recipe_animation'   // Step-by-step cooking / baking (future)
    | 'architecture_3d'    // 3D building viewer (future)
    | 'skeleton_animation' // Dance / martial arts / sports biomechanics (future)
    | 'driving_simulator'  // Automotive / driving theory (future)
    | 'hand_avatar'        // Sign language (future)
    | 'step_diagram';      // Generic step-by-step trades / repair guide

export type SkillType =
    | 'conceptual'     // Understanding ideas (gravity, democracy)
    | 'procedural'     // Step-by-step execution (cooking, carpentry)
    | 'analytical'     // Data, patterns, reasoning (stats, economics)
    | 'creative'       // Open-ended output (music, art, design)
    | 'physical'       // Body / motor skills (sports, martial arts, dance)
    | 'tool_based'     // Learning specific software (Blender, VS Code)
    | 'linguistic'     // Language, communication, writing
    | 'social';        // Etiquette, relationships, emotional intelligence

export type TeachingMethod =
    | 'socratic'       // Question-driven discovery
    | 'story'          // Narrative / historical framing
    | 'simulation'     // Interactive visual experiment
    | 'diagram'        // Visual diagram walk-through
    | 'analogy'        // Relate to everyday life
    | 'example'        // Worked examples
    | 'step_by_step'   // Ordered instructions
    | 'quiz'           // Test comprehension
    | 'debate'         // Explore multiple perspectives
    | 'roleplay'       // Social scenario practice
    | 'case_study'     // Real-world application
    | 'sandbox';       // Free exploration

export interface DomainConfig {
    /** Short display name */
    label: string;
    /** Primary rendering engine */
    engine: VisualizationEngine;
    /** Fallback engine if primary unavailable */
    fallback: VisualizationEngine;
    /** What kind of skill this domain primarily develops */
    skillType: SkillType;
    /** Preferred teaching approach for Momentum */
    teachingMethod: TeachingMethod;
    /** Injected into the teacher prompt for domain-specific tone/structure */
    promptHint: string;
    /** True if this is a software tool rather than a conceptual domain */
    isSoftwareTool?: boolean;
    /** Keywords that trigger this domain during fuzzy routing */
    keywords: string[];
}

// ─────────────────────────────────────────────────────────────
// UNIVERSAL LEARNING ONTOLOGY — DOMAIN MAP
// All 100+ root nodes from the ULO tree
// ─────────────────────────────────────────────────────────────

export const ULO: Record<string, DomainConfig> = {

    // ── FORMAL SCIENCES ────────────────────────────────────────
    mathematics: {
        label: 'Mathematics',
        engine: 'jsxgraph',
        fallback: 'concept_diagram',
        skillType: 'analytical',
        teachingMethod: 'socratic',
        promptHint: 'Use worked examples and interactive graphs. Build from simple to complex. Always ask the student to solve a small step themselves.',
        keywords: ['math', 'maths', 'arithmetic', 'algebra', 'geometry', 'calculus', 'trigonometry', 'statistics', 'probability', 'linear algebra', 'topology', 'number theory', 'combinatorics', 'differential equations', 'set theory', 'category theory'],
    },
    logic: {
        label: 'Logic',
        engine: 'mermaid_diagram',
        fallback: 'concept_diagram',
        skillType: 'analytical',
        teachingMethod: 'socratic',
        promptHint: 'Use truth tables and logical flow diagrams. Show proofs step-by-step. Challenge assumptions.',
        keywords: ['logic', 'formal logic', 'predicate logic', 'boolean logic', 'symbolic logic', 'proof theory', 'modal logic'],
    },

    // ── PHYSICAL SCIENCES ─────────────────────────────────────
    physics: {
        label: 'Physics',
        engine: 'lab_simulation',
        fallback: 'concept_diagram',
        skillType: 'conceptual',
        teachingMethod: 'simulation',
        promptHint: 'Run interactive simulations. Relate abstract concepts to everyday objects. Use the Feynman technique — if you cannot explain it simply, you do not understand it.',
        keywords: ['physics', 'mechanics', 'thermodynamics', 'optics', 'electromagnetism', 'quantum mechanics', 'relativity', 'nuclear physics', 'particle physics', 'waves', 'forces', 'motion', 'energy'],
    },
    chemistry: {
        label: 'Chemistry',
        engine: 'molecule_view',
        fallback: 'concept_diagram',
        skillType: 'conceptual',
        teachingMethod: 'simulation',
        promptHint: 'Visualize molecules and reactions in 3D. Explain bonds as personality traits between atoms. Always relate to real chemicals the student has encountered.',
        keywords: ['chemistry', 'organic chemistry', 'inorganic chemistry', 'physical chemistry', 'analytical chemistry', 'biochemistry', 'molecules', 'atoms', 'periodic table', 'reactions', 'bonds'],
    },

    // ── LIFE SCIENCES ─────────────────────────────────────────
    biology: {
        label: 'Biology',
        engine: 'concept_diagram',
        fallback: 'mermaid_diagram',
        skillType: 'conceptual',
        teachingMethod: 'diagram',
        promptHint: 'Use vivid analogies for biological processes. The cell is a city. DNA is a blueprint. Evolution is a slow design process. Make it come alive.',
        keywords: ['biology', 'genetics', 'evolution', 'zoology', 'botany', 'microbiology', 'cell biology', 'ecology', 'marine biology', 'photosynthesis', 'dna', 'rna', 'proteins'],
    },
    anatomy: {
        label: 'Anatomy',
        engine: 'anatomy',
        fallback: 'concept_diagram',
        skillType: 'conceptual',
        teachingMethod: 'simulation',
        promptHint: 'Navigate the 3D body interactively. Highlight parts as you speak. Relate organ functions to things the student does every day (heart pumps like a water pump).',
        keywords: ['anatomy', 'human body', 'skeleton', 'muscles', 'organs', 'nervous system', 'digestive', 'cardiovascular', 'respiratory', 'brain', 'heart', 'kidney', 'liver'],
    },

    // ── EARTH SCIENCES ────────────────────────────────────────
    earth_sciences: {
        label: 'Earth Sciences',
        engine: 'concept_diagram',
        fallback: 'mermaid_diagram',
        skillType: 'conceptual',
        teachingMethod: 'story',
        promptHint: 'Earth is a living system. Explain geological time scales with relatable analogies. Use the "if Earth was a day" comparison to help scale.',
        keywords: ['earth', 'geology', 'meteorology', 'oceanography', 'seismology', 'volcanology', 'paleontology', 'plate tectonics', 'earthquakes', 'climate', 'rock cycle', 'water cycle'],
    },

    // ── SPACE SCIENCES ─────────────────────────────────────────
    astronomy: {
        label: 'Astronomy & Space Sciences',
        engine: 'space_simulator',
        fallback: 'concept_diagram',
        skillType: 'conceptual',
        teachingMethod: 'simulation',
        promptHint: 'Scale is everything in astronomy. Use comparisons: the Sun is a bowling ball, Earth is a peppercorn. Make the student feel the size of the cosmos.',
        keywords: ['astronomy', 'astrophysics', 'cosmology', 'space', 'planets', 'solar system', 'stars', 'galaxies', 'black holes', 'nebula', 'orbital mechanics', 'stellar evolution', 'universe', 'dark matter', 'dark energy'],
    },

    // ── COMPUTER SCIENCE ──────────────────────────────────────
    computer_science: {
        label: 'Computer Science',
        engine: 'mermaid_diagram',
        fallback: 'code_playground',
        skillType: 'analytical',
        teachingMethod: 'example',
        promptHint: 'Think like a compiler. Break every concept into its smallest logical unit. Use pseudocode before real code. Always show what happens step by step — memory addresses, call stacks, the works.',
        keywords: ['computer science', 'algorithms', 'data structures', 'operating systems', 'networking', 'compilers', 'databases', 'computer graphics', 'HCI', 'theory of computation', 'automata', 'turing machine'],
    },
    programming: {
        label: 'Programming',
        engine: 'code_playground',
        fallback: 'mermaid_diagram',
        skillType: 'procedural',
        teachingMethod: 'example',
        promptHint: 'Write real code together. Show output immediately. Explain every line. Use the simplest possible example first, then build complexity. Never write code the student cannot run themselves.',
        keywords: ['programming', 'coding', 'python', 'javascript', 'typescript', 'java', 'c++', 'c#', 'rust', 'go', 'swift', 'kotlin', 'ruby', 'php', 'bash', 'shell', 'html', 'css', 'sql', 'r', 'matlab', 'lua', 'perl', 'scala', 'haskell', 'assembly', 'webdev', 'backend', 'frontend', 'fullstack', 'api', 'functions', 'variables', 'loops', 'classes', 'oop', 'async', 'recursion'],
    },
    artificial_intelligence: {
        label: 'Artificial Intelligence & ML',
        engine: 'mermaid_diagram',
        fallback: 'jsxgraph',
        skillType: 'analytical',
        teachingMethod: 'analogy',
        promptHint: 'AI learns like a baby — through examples, not rules. Neural networks are loose approximations of the brain. Always demystify: gradient descent is just walking downhill in the dark.',
        keywords: ['ai', 'artificial intelligence', 'machine learning', 'deep learning', 'neural networks', 'nlp', 'computer vision', 'reinforcement learning', 'transformers', 'llm', 'large language model', 'gpt', 'diffusion models', 'clustering', 'regression', 'classification'],
    },
    cybersecurity: {
        label: 'Cybersecurity',
        engine: 'mermaid_diagram',
        fallback: 'code_playground',
        skillType: 'analytical',
        teachingMethod: 'case_study',
        promptHint: 'Think like an attacker first, then a defender. Real-world breaches make the best lessons. Explain every attack with its defence. Keep it thriller-level engaging.',
        keywords: ['cybersecurity', 'hacking', 'penetration testing', 'encryption', 'cryptography', 'network security', 'malware', 'phishing', 'social engineering', 'firewall', 'zero day', 'ctf', 'infosec', 'vulnerability'],
    },

    // ── SOFTWARE TOOLS (Tool Ontology) ────────────────────────
    blender: {
        label: 'Blender (3D Software)',
        engine: 'step_diagram',
        fallback: 'mermaid_diagram',
        skillType: 'tool_based',
        teachingMethod: 'step_by_step',
        promptHint: 'Teach Blender UI panel-by-panel. Always state the keyboard shortcut before explaining an action. E.g., "Press G to Grab, then Z to constrain to the Z-axis." Keep it hands-on.',
        isSoftwareTool: true,
        keywords: ['blender', '3d modeling', 'blender 3d', 'cycles', 'eevee', 'sculpting', 'rigging', 'animation blender'],
    },
    figma: {
        label: 'Figma (Design Tool)',
        engine: 'step_diagram',
        fallback: 'mermaid_diagram',
        skillType: 'tool_based',
        teachingMethod: 'step_by_step',
        promptHint: 'Walk through the Figma interface panel by panel. Show keyboard shortcuts. Explain frames vs groups, components vs instances. Design-thinking first, then execution.',
        isSoftwareTool: true,
        keywords: ['figma', 'ui design', 'ux design', 'prototyping', 'wireframe', 'design system', 'components figma'],
    },
    vscode: {
        label: 'VS Code / IDE',
        engine: 'step_diagram',
        fallback: 'mermaid_diagram',
        skillType: 'tool_based',
        teachingMethod: 'step_by_step',
        promptHint: 'Show keyboard shortcuts constantly. Explain the editor layout. Cover extensions, debugging, terminal integration, and Git integration. Make the student faster.',
        isSoftwareTool: true,
        keywords: ['vs code', 'vscode', 'visual studio code', 'ide', 'cursor ide', 'neovim', 'vim', 'emacs', 'jetbrains', 'intellij', 'pycharm'],
    },
    excel: {
        label: 'Excel / Spreadsheets',
        engine: 'step_diagram',
        fallback: 'jsxgraph',
        skillType: 'tool_based',
        teachingMethod: 'step_by_step',
        promptHint: 'Excel is a superpower most people barely scratch the surface of. Walk through formulas step-by-step. Always show the BEFORE and AFTER of the spreadsheet.',
        isSoftwareTool: true,
        keywords: ['excel', 'spreadsheet', 'google sheets', 'formulas', 'pivot table', 'vlookup', 'xlookup', 'power query', 'macros', 'vba'],
    },
    git: {
        label: 'Git & Version Control',
        engine: 'mermaid_diagram',
        fallback: 'step_diagram',
        skillType: 'tool_based',
        teachingMethod: 'analogy',
        promptHint: 'Git is a time machine for code. A commit is a save point. A branch is an alternate timeline. Merging is combining two timelines. Always use the tree/graph mental model.',
        isSoftwareTool: true,
        keywords: ['git', 'github', 'gitlab', 'version control', 'commit', 'branch', 'merge', 'pull request', 'rebase', 'gitflow'],
    },
    photoshop: {
        label: 'Photoshop / Photo Editing',
        engine: 'step_diagram',
        fallback: 'general_image',
        skillType: 'tool_based',
        teachingMethod: 'step_by_step',
        promptHint: 'Layers are everything. Always explain: what tool, where to find it, what modifier keys change it. Show expected result after each step.',
        isSoftwareTool: true,
        keywords: ['photoshop', 'photo editing', 'lightroom', 'gimp', 'adobe', 'retouching', 'layers', 'masks'],
    },
    autocad: {
        label: 'AutoCAD / CAD Software',
        engine: 'step_diagram',
        fallback: 'mermaid_diagram',
        skillType: 'tool_based',
        teachingMethod: 'step_by_step',
        promptHint: 'CAD is precision. Teach command-line first. Every action has an alias. Explain coordinate systems, layers, and dimensioning from day one.',
        isSoftwareTool: true,
        keywords: ['autocad', 'cad', 'solidworks', 'fusion 360', 'drafting', 'technical drawing', 'parametric design'],
    },
    unity: {
        label: 'Unity / Game Development',
        engine: 'step_diagram',
        fallback: 'code_playground',
        skillType: 'tool_based',
        teachingMethod: 'step_by_step',
        promptHint: 'Game engines are magic made systematic. Inspector, Scene view, Hierarchy, Project panel — explain each. Walk through a complete game loop: input → update → render.',
        isSoftwareTool: true,
        keywords: ['unity', 'unreal engine', 'game dev', 'game development', 'godot', 'game engine', 'c# unity', 'blueprints unreal'],
    },

    // ── ENGINEERING ───────────────────────────────────────────
    mechanical_engineering: {
        label: 'Mechanical Engineering',
        engine: 'lab_simulation',
        fallback: 'concept_diagram',
        skillType: 'analytical',
        teachingMethod: 'simulation',
        promptHint: 'Forces, torques, and materials. Always draw a free body diagram first. Relate every concept to machines the student has seen — engines, bridges, gears.',
        keywords: ['mechanical engineering', 'machines', 'robotics', 'engines', 'hvac', 'manufacturing', 'thermodynamics engineering', 'fluid mechanics', 'statics', 'dynamics'],
    },
    electrical_engineering: {
        label: 'Electrical Engineering',
        engine: 'lab_simulation',
        fallback: 'concept_diagram',
        skillType: 'analytical',
        teachingMethod: 'simulation',
        promptHint: 'Electrons are lazy — they take the path of least resistance. Always build circuit diagrams. Ohm\'s Law first, everything else second.',
        keywords: ['electrical engineering', 'electronics', 'circuits', 'power systems', 'embedded systems', 'pcb', 'transistors', 'amplifiers', 'signal processing'],
    },
    civil_engineering: {
        label: 'Civil Engineering',
        engine: 'mermaid_diagram',
        fallback: 'concept_diagram',
        skillType: 'analytical',
        teachingMethod: 'case_study',
        promptHint: 'Everything must stand up. Structural logic first. Use famous engineering failures as cautionary tales — the Tacoma Narrows Bridge, the Hyatt Regency walkway.',
        keywords: ['civil engineering', 'bridges', 'roads', 'structural design', 'construction engineering', 'geotechnical', 'infrastructure'],
    },
    aerospace_engineering: {
        label: 'Aerospace Engineering',
        engine: 'space_simulator',
        fallback: 'concept_diagram',
        skillType: 'analytical',
        teachingMethod: 'simulation',
        promptHint: 'Rockets are controlled explosions pointed at the ground. Aerodynamics, propulsion, orbital mechanics — connect it all. Use real missions as teaching examples.',
        keywords: ['aerospace', 'rockets', 'aircraft', 'spacecraft', 'propulsion', 'aerodynamics', 'orbital mechanics engineering'],
    },

    // ── HEALTH & MEDICINE ─────────────────────────────────────
    medicine: {
        label: 'Medicine & Health Sciences',
        engine: 'anatomy',
        fallback: 'concept_diagram',
        skillType: 'conceptual',
        teachingMethod: 'case_study',
        promptHint: 'Every disease is a story of malfunction. Start from normal physiology, then show what breaks and why. Clinical cases make abstract pathology real.',
        keywords: ['medicine', 'medical', 'pharmacology', 'pathology', 'surgery', 'diagnosis', 'treatment', 'immunology', 'clinical'],
    },
    nutrition: {
        label: 'Nutrition & Dietetics',
        engine: 'concept_diagram',
        fallback: 'mermaid_diagram',
        skillType: 'conceptual',
        teachingMethod: 'analogy',
        promptHint: 'Food is information for the body. Macros, micros, gut microbiome — make it feel relevant. Always connect to what the student actually eats.',
        keywords: ['nutrition', 'diet', 'macronutrients', 'micronutrients', 'calories', 'protein', 'carbs', 'fat', 'vitamins', 'gut health'],
    },
    mental_health: {
        label: 'Mental Health & Psychology',
        engine: 'concept_diagram',
        fallback: 'mermaid_diagram',
        skillType: 'social',
        teachingMethod: 'story',
        promptHint: 'Be gentle. Mental health topics require empathy first, science second. Use real (anonymized) scenarios. Normalize vulnerability.',
        keywords: ['mental health', 'psychology', 'depression', 'anxiety', 'therapy', 'cbt', 'trauma', 'mindfulness', 'psychiatry', 'wellbeing'],
    },

    // ── SOCIAL SCIENCES ───────────────────────────────────────
    economics: {
        label: 'Economics',
        engine: 'jsxgraph',
        fallback: 'mermaid_diagram',
        skillType: 'analytical',
        teachingMethod: 'case_study',
        promptHint: 'Economics is incentives and trade-offs. Use supply-demand graphs constantly. Real-world examples: housing market, oil prices, inflation. Make abstract theory tangible.',
        keywords: ['economics', 'microeconomics', 'macroeconomics', 'gdp', 'inflation', 'supply', 'demand', 'market', 'fiscal policy', 'monetary policy', 'trade'],
    },
    sociology: {
        label: 'Sociology & Anthropology',
        engine: 'mermaid_diagram',
        fallback: 'concept_diagram',
        skillType: 'analytical',
        teachingMethod: 'case_study',
        promptHint: 'Zoom out — societies are just people at scale. Use comparative examples across cultures. Challenge assumptions about what is "normal."',
        keywords: ['sociology', 'anthropology', 'culture', 'society', 'social structures', 'institutions', 'norms', 'ethnography'],
    },
    political_science: {
        label: 'Political Science & Governance',
        engine: 'mermaid_diagram',
        fallback: 'concept_diagram',
        skillType: 'analytical',
        teachingMethod: 'debate',
        promptHint: 'Present multiple perspectives on political topics. The goal is understanding systems, not promoting ideology. Use Socratic questioning to push the student to think deeper.',
        keywords: ['politics', 'political science', 'democracy', 'government', 'constitution', 'elections', 'political theory', 'diplomacy', 'geopolitics', 'international relations'],
    },
    geography: {
        label: 'Geography',
        engine: 'interactive_globe',
        fallback: 'concept_diagram',
        skillType: 'conceptual',
        teachingMethod: 'story',
        promptHint: 'Place shapes people. Connect geography to history, economics, and culture constantly. Use maps liberally. Make students feel like explorers.',
        keywords: ['geography', 'maps', 'countries', 'capitals', 'physical geography', 'human geography', 'climate zones', 'biomes', 'rivers', 'mountains'],
    },

    // ── BUSINESS & FINANCE ────────────────────────────────────
    business: {
        label: 'Business & Entrepreneurship',
        engine: 'mermaid_diagram',
        fallback: 'jsxgraph',
        skillType: 'analytical',
        teachingMethod: 'case_study',
        promptHint: 'Business is organised common sense. Use startup stories and case studies. Connect every concept to "how does this make or save money?"',
        keywords: ['business', 'entrepreneurship', 'startup', 'management', 'strategy', 'operations', 'supply chain', 'b2b', 'b2c', 'business model'],
    },
    finance: {
        label: 'Finance & Investing',
        engine: 'jsxgraph',
        fallback: 'mermaid_diagram',
        skillType: 'analytical',
        teachingMethod: 'example',
        promptHint: 'Money has a time value. Show compound interest visually. Every financial concept should be demonstrated with real numbers the student can relate to.',
        keywords: ['finance', 'investing', 'stocks', 'bonds', 'portfolio', 'compound interest', 'valuation', 'dcf', 'options', 'derivatives', 'crypto', 'budgeting', 'accounting'],
    },
    marketing: {
        label: 'Marketing',
        engine: 'mermaid_diagram',
        fallback: 'concept_diagram',
        skillType: 'creative',
        teachingMethod: 'case_study',
        promptHint: 'Marketing is understanding people, then speaking their language. Use iconic campaigns as examples. Funnel thinking — awareness to conversion.',
        keywords: ['marketing', 'branding', 'advertising', 'seo', 'social media marketing', 'content marketing', 'email marketing', 'growth hacking', 'copywriting'],
    },
    law: {
        label: 'Law & Legal Studies',
        engine: 'mermaid_diagram',
        fallback: 'concept_diagram',
        skillType: 'analytical',
        teachingMethod: 'case_study',
        promptHint: 'Law is rules with consequences. Use landmark cases to teach principles. Build up from the rule, to the exception, to the edge case. Logic and precedent above all.',
        keywords: ['law', 'legal', 'contracts', 'criminal law', 'constitutional law', 'human rights', 'intellectual property', 'corporate law', 'litigation', 'jurisprudence'],
    },

    // ── HUMANITIES ────────────────────────────────────────────
    history: {
        label: 'History',
        engine: 'timeline',
        fallback: 'mermaid_diagram',
        skillType: 'conceptual',
        teachingMethod: 'story',
        promptHint: 'History is biography at scale. Find the human story inside every event. Cause and effect chains make everything logical in hindsight. Connect past to present.',
        keywords: ['history', 'world history', 'ancient history', 'medieval', 'world war', 'revolution', 'empire', 'civilization', 'archaeology'],
    },
    philosophy: {
        label: 'Philosophy',
        engine: 'concept_diagram',
        fallback: 'mermaid_diagram',
        skillType: 'analytical',
        teachingMethod: 'socratic',
        promptHint: 'Good philosophy makes you question everything you thought you knew. Use the Socratic method hard. Present the strongest version of each position before critiquing it.',
        keywords: ['philosophy', 'ethics', 'logic philosophy', 'epistemology', 'metaphysics', 'existentialism', 'stoicism', 'phenomenology', 'moral philosophy'],
    },
    religion: {
        label: 'Religion & Spirituality',
        engine: 'concept_diagram',
        fallback: 'timeline',
        skillType: 'conceptual',
        teachingMethod: 'story',
        promptHint: 'Approach religion with deep respect. Present beliefs on their own terms, not as myths. Academic tone for comparative religion; warm and empathetic for personal faith questions.',
        keywords: ['religion', 'christianity', 'islam', 'hinduism', 'buddhism', 'judaism', 'sikhism', 'taoism', 'shinto', 'theology', 'spirituality', 'faith'],
    },
    mythology: {
        label: 'Mythology & Folklore',
        engine: 'concept_diagram',
        fallback: 'general_image',
        skillType: 'conceptual',
        teachingMethod: 'story',
        promptHint: 'Myths are how ancient people understood the universe. Bring gods and heroes to life. Connect mythological themes to modern stories (Star Wars, Harry Potter).',
        keywords: ['mythology', 'greek mythology', 'norse mythology', 'egyptian mythology', 'hindu mythology', 'folklore', 'legends', 'gods', 'heroes', 'myths'],
    },
    esoteric: {
        label: 'Esoteric & Occult',
        engine: 'concept_diagram',
        fallback: 'general_image',
        skillType: 'conceptual',
        teachingMethod: 'story',
        promptHint: 'Present these topics as cultural belief systems with rich historical context. Do not frame them as scientifically proven. Explore symbolism, tradition, and psychology of belief.',
        keywords: ['astrology', 'tarot', 'numerology', 'alchemy', 'hermeticism', 'kabbalah', 'divination', 'occult', 'esoteric', 'zodiac', 'horoscope'],
    },

    // ── ARTS & CREATIVE DISCIPLINES ───────────────────────────
    music: {
        label: 'Music',
        engine: 'piano_roll',
        fallback: 'mermaid_diagram',
        skillType: 'creative',
        teachingMethod: 'example',
        promptHint: 'Music is organised sound. Always describe how things SOUND before showing theory. Chord progressions as emotional journeys. Rhythm as conversation. Make theory feel like discovery.',
        keywords: ['music', 'music theory', 'piano', 'guitar', 'drums', 'singing', 'composition', 'chords', 'scales', 'melody', 'harmony', 'rhythm', 'intervals', 'notation', 'instruments'],
    },
    visual_arts: {
        label: 'Visual Arts & Drawing',
        engine: 'general_image',
        fallback: 'step_diagram',
        skillType: 'creative',
        teachingMethod: 'example',
        promptHint: 'Art is seeing. Train the eye before the hand. Explain composition, light, shadow, perspective with examples from masters. Then guide hands-on practice.',
        keywords: ['painting', 'drawing', 'sculpture', 'art', 'illustration', 'sketching', 'watercolor', 'oil painting', 'charcoal', 'perspective drawing', 'color theory'],
    },
    photography: {
        label: 'Photography & Film',
        engine: 'general_image',
        fallback: 'step_diagram',
        skillType: 'creative',
        teachingMethod: 'example',
        promptHint: 'Photography is painting with light. Teach the exposure triangle viscerally: aperture = eye pupil, shutter speed = blink speed, ISO = eye sensitivity.',
        keywords: ['photography', 'camera', 'film', 'cinematography', 'aperture', 'shutter speed', 'iso', 'composition', 'editing photos', 'lightroom'],
    },
    graphic_design: {
        label: 'Graphic Design & UX/UI',
        engine: 'general_image',
        fallback: 'step_diagram',
        skillType: 'creative',
        teachingMethod: 'example',
        promptHint: 'Design is communication. Every choice — color, font, spacing — sends a message. Teach Gestalt principles first. Show good and bad examples side by side.',
        keywords: ['graphic design', 'ui', 'ux', 'ux design', 'typography', 'layout', 'branding', 'logo design', 'color theory design', 'user experience', 'user interface'],
    },
    dance: {
        label: 'Dance',
        engine: 'skeleton_animation',
        fallback: 'general_image',
        skillType: 'physical',
        teachingMethod: 'step_by_step',
        promptHint: 'Dance is music made visible. Break choreography into counts and positions. Explain body mechanics. Reference the style\'s cultural roots.',
        keywords: ['dance', 'ballet', 'hip hop dance', 'contemporary dance', 'salsa', 'tango', 'breakdancing', 'choreography', 'dance technique'],
    },
    performing_arts: {
        label: 'Theatre & Performing Arts',
        engine: 'general_image',
        fallback: 'mermaid_diagram',
        skillType: 'creative',
        teachingMethod: 'roleplay',
        promptHint: 'Theatre is truth under imaginary circumstances. Acting, directing, stagecraft — connect technical elements to emotional truth. Use famous scenes as references.',
        keywords: ['theatre', 'acting', 'drama', 'stage', 'directing', 'screenplay', 'playwriting', 'performance', 'improv', 'storytelling'],
    },

    // ── LANGUAGES & COMMUNICATION ─────────────────────────────
    languages: {
        label: 'Languages',
        engine: 'mermaid_diagram',
        fallback: 'concept_diagram',
        skillType: 'linguistic',
        teachingMethod: 'roleplay',
        promptHint: 'Language is culture compressed into sound. Teach in context, not in isolated vocabulary. Role-play real conversations. Grammar as a tool, not a cage.',
        keywords: ['english', 'hindi', 'french', 'spanish', 'japanese', 'chinese', 'arabic', 'german', 'portuguese', 'korean', 'language learning', 'grammar', 'vocabulary', 'pronunciation', 'linguistics'],
    },
    communication: {
        label: 'Communication & Public Speaking',
        engine: 'concept_diagram',
        fallback: 'mermaid_diagram',
        skillType: 'social',
        teachingMethod: 'roleplay',
        promptHint: 'Great communication is 90% listening and 10% talking. Teach body language, silence, storytelling structure. Use real speeches as examples.',
        keywords: ['public speaking', 'communication', 'negotiation', 'debate', 'presentation', 'body language', 'rhetoric', 'persuasion', 'copywriting', 'writing skills'],
    },

    // ── TRADES & SKILLED PROFESSIONS ──────────────────────────
    carpentry: {
        label: 'Carpentry & Woodworking',
        engine: 'step_diagram',
        fallback: 'mermaid_diagram',
        skillType: 'procedural',
        teachingMethod: 'step_by_step',
        promptHint: 'Safety first — always list PPE requirements. Then materials, then tools, then steps. Measure twice, cut once. Explain WHY each technique works, not just what to do.',
        keywords: ['carpentry', 'woodworking', 'joinery', 'cabinetmaking', 'furniture making', 'wood joints', 'sawing', 'sanding', 'finishing wood'],
    },
    welding: {
        label: 'Welding & Metalwork',
        engine: 'step_diagram',
        fallback: 'mermaid_diagram',
        skillType: 'procedural',
        teachingMethod: 'step_by_step',
        promptHint: 'Safety is not optional in welding. Always start with PPE. Explain metallurgy basics — why metals behave differently under heat. Walk through technique step by step.',
        keywords: ['welding', 'mig welding', 'tig welding', 'stick welding', 'metalwork', 'fabrication', 'cnc', 'machining', 'lathe'],
    },
    plumbing: {
        label: 'Plumbing',
        engine: 'step_diagram',
        fallback: 'mermaid_diagram',
        skillType: 'procedural',
        teachingMethod: 'step_by_step',
        promptHint: 'Water flows downhill and takes the path of least resistance. Systems thinking: supply vs drain. Always check local code. Step-by-step with tools listed.',
        keywords: ['plumbing', 'pipes', 'fittings', 'drainage', 'water supply', 'fixtures', 'soldering pipes'],
    },
    electrical_trade: {
        label: 'Electrical Work (Trade)',
        engine: 'step_diagram',
        fallback: 'lab_simulation',
        skillType: 'procedural',
        teachingMethod: 'step_by_step',
        promptHint: 'Electricity can kill — safety and lockout/tagout procedures first, always. Explain circuits practically. Work from the breaker box outward.',
        keywords: ['electrician', 'electrical work', 'wiring', 'circuits trade', 'solar installation', 'panel', 'breaker', 'outlet'],
    },
    culinary: {
        label: 'Cooking & Culinary Arts',
        engine: 'recipe_animation',
        fallback: 'step_diagram',
        skillType: 'procedural',
        teachingMethod: 'step_by_step',
        promptHint: 'Cooking is applied chemistry and physics. Explain why things happen (Maillard reaction, emulsification) not just how. Always note substitutions and variations.',
        keywords: ['cooking', 'culinary', 'recipes', 'baking', 'chef', 'kitchen', 'food', 'cuisine', 'technique cooking', 'knife skills', 'sauces', 'pastry'],
    },
    auto_repair: {
        label: 'Automotive & Mechanics',
        engine: 'step_diagram',
        fallback: 'concept_diagram',
        skillType: 'procedural',
        teachingMethod: 'step_by_step',
        promptHint: 'A car is just a rolling collection of systems. Engine, transmission, brakes, electrical — teach each system in isolation then show how they connect.',
        keywords: ['car repair', 'auto mechanic', 'automotive', 'engine', 'transmission', 'brakes', 'tires', 'oil change', 'diagnostics', 'obd'],
    },
    beauty: {
        label: 'Beauty & Personal Styling',
        engine: 'step_diagram',
        fallback: 'general_image',
        skillType: 'procedural',
        teachingMethod: 'step_by_step',
        promptHint: 'Beauty is technical skill meeting artistic vision. Explain face shapes, color theory, technique, tools. Always show the finished result as the goal.',
        keywords: ['barbering', 'makeup', 'hair styling', 'skincare', 'beauty', 'cosmetology', 'nail art', 'hairdressing'],
    },

    // ── DAILY LIFE SKILLS ─────────────────────────────────────
    etiquette: {
        label: 'Etiquette & Social Skills',
        engine: 'concept_diagram',
        fallback: 'mermaid_diagram',
        skillType: 'social',
        teachingMethod: 'roleplay',
        promptHint: 'Etiquette is about making others feel comfortable, not about rigid rules. Always explain the WHY behind the rule. Use real social scenarios. Warm, non-judgmental tone.',
        keywords: ['etiquette', 'manners', 'social skills', 'dining etiquette', 'business etiquette', 'japanese etiquette', 'protocol', 'netiquette', 'dress code'],
    },
    personal_development: {
        label: 'Personal Development',
        engine: 'concept_diagram',
        fallback: 'mermaid_diagram',
        skillType: 'social',
        teachingMethod: 'story',
        promptHint: 'Real change comes from systems, not willpower. Use evidence-based psychology: habit loops, identity-based change, spaced repetition. Practical and actionable always.',
        keywords: ['productivity', 'habits', 'goal setting', 'self improvement', 'time management', 'discipline', 'focus', 'procrastination', 'motivation', 'mindset'],
    },
    personal_finance: {
        label: 'Personal Finance',
        engine: 'jsxgraph',
        fallback: 'concept_diagram',
        skillType: 'analytical',
        teachingMethod: 'example',
        promptHint: 'Financial literacy should be taught in schools but isn\'t. Use real-life numbers — rent, groceries, salaries. Compound interest shown visually blows people\'s minds.',
        keywords: ['personal finance', 'budgeting', 'taxes', 'insurance', 'investing basics', 'savings', 'debt', 'credit score', 'emergency fund'],
    },
    relationships: {
        label: 'Relationships & Emotional Intelligence',
        engine: 'concept_diagram',
        fallback: 'mermaid_diagram',
        skillType: 'social',
        teachingMethod: 'roleplay',
        promptHint: 'Relationships are the most important thing most people know the least about. Use empathy and real scenarios. No judgment. Connect to psychology research.',
        keywords: ['relationships', 'emotional intelligence', 'eq', 'conflict resolution', 'communication relationships', 'attachment styles', 'empathy', 'boundaries'],
    },
    first_aid: {
        label: 'First Aid & Emergency Response',
        engine: 'step_diagram',
        fallback: 'concept_diagram',
        skillType: 'procedural',
        teachingMethod: 'step_by_step',
        promptHint: 'In an emergency, clarity saves lives. Step-by-step, numbered, no ambiguity. CPR beats per minute. The Heimlich maneuver. Always practical and memorable.',
        keywords: ['first aid', 'cpr', 'heimlich', 'emergency', 'wound care', 'choking', 'burns', 'fractures', 'disaster preparedness'],
    },

    // ── SPORTS & PHYSICAL PERFORMANCE ─────────────────────────
    sports: {
        label: 'Sports & Athletics',
        engine: 'skeleton_animation',
        fallback: 'concept_diagram',
        skillType: 'physical',
        teachingMethod: 'step_by_step',
        promptHint: 'Sports are physics applied to the human body. Break technique into biomechanical components. Use slow-motion mental imagery. Connect training science (periodization, recovery) to performance.',
        keywords: ['sports', 'football', 'basketball', 'cricket', 'tennis', 'swimming', 'running', 'athletics', 'training', 'coaching', 'sports science', 'biomechanics'],
    },
    fitness: {
        label: 'Fitness & Exercise Science',
        engine: 'anatomy',
        fallback: 'step_diagram',
        skillType: 'physical',
        teachingMethod: 'step_by_step',
        promptHint: 'The body adapts to the demands placed on it — progressive overload is everything. Explain exercise science: muscle fiber types, EPOC, VO2 max. Make science feel like a superpower.',
        keywords: ['fitness', 'strength training', 'weightlifting', 'cardio', 'yoga', 'pilates', 'martial arts', 'gymnastics', 'climbing', 'crossfit', 'exercise'],
    },

    // ── AGRICULTURE & ENVIRONMENT ─────────────────────────────
    agriculture: {
        label: 'Agriculture & Farming',
        engine: 'concept_diagram',
        fallback: 'mermaid_diagram',
        skillType: 'procedural',
        teachingMethod: 'step_by_step',
        promptHint: 'Farming is applied biology and chemistry. Soil is a living ecosystem. Seasons dictate everything. Connect traditional wisdom to modern science.',
        keywords: ['farming', 'agriculture', 'horticulture', 'animal husbandry', 'forestry', 'soil science', 'irrigation', 'crops', 'sustainability farming'],
    },
    climate_science: {
        label: 'Climate Science & Sustainability',
        engine: 'concept_diagram',
        fallback: 'jsxgraph',
        skillType: 'analytical',
        teachingMethod: 'case_study',
        promptHint: 'This is the defining challenge of the century. Present the science rigorously. Use data and graphs. Be honest about uncertainty while being clear about scientific consensus.',
        keywords: ['climate change', 'climate science', 'global warming', 'carbon emissions', 'sustainability', 'renewable energy', 'environmental science', 'ecology'],
    },

    // ── MILITARY & SECURITY ───────────────────────────────────
    military: {
        label: 'Military & Security Studies',
        engine: 'timeline',
        fallback: 'mermaid_diagram',
        skillType: 'analytical',
        teachingMethod: 'case_study',
        promptHint: 'Military history is strategy made visible. Campaign maps and decision trees. Present multiple perspectives on conflicts. Connect tactical decisions to strategic outcomes.',
        keywords: ['military', 'military history', 'strategy', 'tactics', 'war', 'naval warfare', 'air warfare', 'intelligence', 'peacekeeping', 'national security'],
    },

    // ── TRANSPORTATION ────────────────────────────────────────
    aviation: {
        label: 'Aviation & Flying',
        engine: 'concept_diagram',
        fallback: 'step_diagram',
        skillType: 'procedural',
        teachingMethod: 'simulation',
        promptHint: 'Flying is physics, procedure, and situational awareness. Bernoulli\'s principle, lift, drag, thrust. Always connect to the cockpit environment.',
        keywords: ['aviation', 'flying', 'pilot', 'aeronautics', 'aircraft operation', 'atc', 'navigation aviation'],
    },
    driving: {
        label: 'Driving & Automotive',
        engine: 'driving_simulator',
        fallback: 'step_diagram',
        skillType: 'procedural',
        teachingMethod: 'simulation',
        promptHint: 'Driving is a skill that kills when done badly. Hazard perception first. Traffic rules and WHY they exist. Smooth control inputs as the goal.',
        keywords: ['driving', 'driver\'s license', 'traffic rules', 'road safety', 'car driving', 'defensive driving'],
    },

    // ── INTERDISCIPLINARY & EMERGING ─────────────────────────
    neuroscience: {
        label: 'Neuroscience & Cognitive Science',
        engine: 'anatomy',
        fallback: 'concept_diagram',
        skillType: 'conceptual',
        teachingMethod: 'analogy',
        promptHint: 'The brain is the most complex object in the known universe. Use hardware/software analogies carefully — the brain is NOT a computer, but the analogy helps. Focus on neuroplasticity and practical applications.',
        keywords: ['neuroscience', 'cognitive science', 'brain', 'neurons', 'neuroplasticity', 'memory neuroscience', 'perception', 'consciousness', 'decision making'],
    },
    data_science: {
        label: 'Data Science & Analytics',
        engine: 'jsxgraph',
        fallback: 'code_playground',
        skillType: 'analytical',
        teachingMethod: 'example',
        promptHint: 'Data science is detective work at scale. Always ask: what question are we answering? Walk through the full pipeline: collect → clean → explore → model → communicate.',
        keywords: ['data science', 'data analysis', 'machine learning data', 'pandas', 'numpy', 'visualization data', 'statistics data', 'jupyter', 'r programming', 'tableau'],
    },
    robotics: {
        label: 'Robotics',
        engine: 'lab_simulation',
        fallback: 'mermaid_diagram',
        skillType: 'analytical',
        teachingMethod: 'simulation',
        promptHint: 'Robots are physical algorithms. Sensor → compute → actuate. Connect to both CS and mechanical engineering. Make it feel like bringing code to life.',
        keywords: ['robotics', 'automation', 'actuators', 'sensors', 'ros', 'robot programming', 'arduino', 'raspberry pi', 'servo motors'],
    },
    quantum_computing: {
        label: 'Quantum Computing & Technologies',
        engine: 'concept_diagram',
        fallback: 'mermaid_diagram',
        skillType: 'conceptual',
        teachingMethod: 'analogy',
        promptHint: 'Classical bits are light switches; qubits are spinning coins. Superposition, entanglement, interference — use vivid metaphors before equations. This is genuinely mind-bending.',
        keywords: ['quantum computing', 'qubits', 'quantum mechanics computing', 'quantum cryptography', 'quantum algorithms', 'superposition', 'entanglement'],
    },

    // ── EDUCATION & LEARNING SCIENCES ────────────────────────
    learning_science: {
        label: 'Education & Learning Sciences',
        engine: 'concept_diagram',
        fallback: 'mermaid_diagram',
        skillType: 'analytical',
        teachingMethod: 'example',
        promptHint: 'Teach the student HOW to learn. Spaced repetition, retrieval practice, interleaving, the Feynman Technique. Meta-cognition is the highest-leverage skill.',
        keywords: ['learning how to learn', 'memory techniques', 'spaced repetition', 'feynman technique', 'study skills', 'teaching', 'pedagogy', 'instructional design'],
    },

    // ── GAMES, HOBBIES & CULTURE ─────────────────────────────
    games: {
        label: 'Games, Esports & Gaming',
        engine: 'mermaid_diagram',
        fallback: 'concept_diagram',
        skillType: 'analytical',
        teachingMethod: 'example',
        promptHint: 'Games are systems. Understand the meta, the mechanics, and the decision trees. Use game theory where applicable. Strategy is strategy whether in chess or a shooter.',
        keywords: ['gaming', 'esports', 'chess', 'game strategy', 'game mechanics', 'speedrunning', 'competitive gaming', 'game design'],
    },
    travel: {
        label: 'Travel & Culture',
        engine: 'interactive_globe',
        fallback: 'general_image',
        skillType: 'conceptual',
        teachingMethod: 'story',
        promptHint: 'Travel is the fastest education money can buy. Cultural context, logistics, language basics, local etiquette. Make it feel like an adventure worth taking.',
        keywords: ['travel', 'culture', 'tourism', 'backpacking', 'visa', 'packing', 'travel planning', 'cultural etiquette travel'],
    },

    // ── ARCHITECTURE & DESIGN ─────────────────────────────────
    architecture: {
        label: 'Architecture & Interior Design',
        engine: 'architecture_3d',
        fallback: 'mermaid_diagram',
        skillType: 'creative',
        teachingMethod: 'example',
        promptHint: 'Architecture is frozen music. Form follows function. Teach styles through their historical context. Space, light, and material as the three fundamental tools.',
        keywords: ['architecture', 'interior design', 'building design', 'structural architecture', 'urban planning', 'landscape architecture', 'architectural history', 'construction design'],
    },
    fashion: {
        label: 'Fashion & Textile Design',
        engine: 'general_image',
        fallback: 'step_diagram',
        skillType: 'creative',
        teachingMethod: 'example',
        promptHint: 'Fashion is culture made wearable. Teach historical context, construction, and the intersection of art and commerce. Reference iconic designers and collections.',
        keywords: ['fashion', 'clothing', 'textile', 'sewing', 'tailoring', 'fashion design', 'style', 'streetwear', 'haute couture'],
    },
};

// ─────────────────────────────────────────────────────────────
// SKILL TYPE DESCRIPTIONS (Ontology 2)
// ─────────────────────────────────────────────────────────────

export const SkillOntology: Record<SkillType, string> = {
    conceptual:   'Understanding ideas, theories, and principles',
    procedural:   'Step-by-step execution of a physical or digital process',
    analytical:   'Working with data, patterns, and logical reasoning',
    creative:     'Open-ended artistic or design expression',
    physical:     'Body mechanics, motor skills, and physical performance',
    tool_based:   'Operating specific software or hardware tools',
    linguistic:   'Language acquisition and communication',
    social:       'Interpersonal dynamics, etiquette, and emotional intelligence',
};

// ─────────────────────────────────────────────────────────────
// TEACHING METHOD DESCRIPTIONS (Ontology 4)
// ─────────────────────────────────────────────────────────────

export const TeachingMethodOntology: Record<TeachingMethod, string> = {
    socratic:     'Question-driven discovery — challenge the student at every step',
    story:        'Narrative framing — history, biography, cause and effect',
    simulation:   'Interactive visual experiment — see and feel the concept',
    diagram:      'Visual walk-through of a structured diagram',
    analogy:      'Connect abstract ideas to everyday familiar things',
    example:      'Concrete worked examples before abstract theory',
    step_by_step: 'Numbered procedural instructions with tools and safety notes',
    quiz:         'Test comprehension with targeted questions',
    debate:       'Explore multiple perspectives without taking sides',
    roleplay:     'Social scenario practice and conversation simulation',
    case_study:   'Real-world application of the principle being learned',
    sandbox:      'Free exploration with guardrails — let the student discover',
};

// ─────────────────────────────────────────────────────────────
// ACCESSIBILITY FLAGS (Ontology 7)
// ─────────────────────────────────────────────────────────────

export const AccessibilityOntology = {
    blind:              { prioritize: ['audio', 'screen_reader', 'verbal_descriptions'], avoid: ['image_only'] },
    low_vision:         { prioritize: ['high_contrast', 'large_text', 'zoom'], avoid: [] },
    deaf:               { prioritize: ['captions', 'visual_only', 'text'], avoid: ['audio_only'] },
    dyslexia:           { prioritize: ['short_sentences', 'bullet_points', 'fonts'], avoid: ['dense_text'] },
    adhd:               { prioritize: ['short_chunks', 'interactivity', 'gamification'], avoid: ['long_lectures'] },
    autism:             { prioritize: ['literal_language', 'predictable_structure', 'explicit_rules'], avoid: ['ambiguity', 'sarcasm'] },
    young_child:        { prioritize: ['simple_words', 'fun_analogies', 'story', 'colour'], avoid: ['jargon'] },
};

// ─────────────────────────────────────────────────────────────
// MASTER LOOKUP — fuzzy domain matching
// Given any topic string, find the best matching domain
// ─────────────────────────────────────────────────────────────

export function findDomain(topic: string): [string, DomainConfig] | null {
    const lower = topic.toLowerCase();

    // Direct key match first
    if (ULO[lower]) return [lower, ULO[lower]];

    // Keyword match — score by number of matching keywords
    let bestKey = '';
    let bestScore = 0;

    for (const [key, config] of Object.entries(ULO)) {
        let score = 0;
        for (const kw of config.keywords) {
            if (lower.includes(kw)) {
                score += kw.length; // longer keyword = more specific match
            }
        }
        if (score > bestScore) {
            bestScore = score;
            bestKey = key;
        }
    }

    if (bestScore > 0) return [bestKey, ULO[bestKey]];
    return null;
}

// ─────────────────────────────────────────────────────────────
// PROMPT BUILDER — used by getMasterRouterPrompt
// Returns a compact domain list for the LLM to classify into
// ─────────────────────────────────────────────────────────────

export function buildDomainListForPrompt(): string {
    return Object.entries(ULO)
        .map(([key, cfg]) => `- ${key}: ${cfg.label} (engine: ${cfg.engine}, skill: ${cfg.skillType})`)
        .join('\n');
}
