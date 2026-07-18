// Configuration file for the AI Teacher Persona, Demographics, and Domain Routing
// Now powered by the Universal Learning Ontology (ULO) from Doc.rtf

import { findDomain, buildDomainListForPrompt } from './UniversalTaxonomy';

export const UserDemographics = {
    // The target age of the user. The AI will adjust its vocabulary and analogies to this age level.
    age: 18, 
    // High-level description of how the user prefers to learn (e.g. "visual and highly interactive", "academic and rigorous")
    learning_style: "visual and highly interactive",
    // Attention span ("short", "medium", "long") dictates how concise the AI should be
    attention_span: "short"
};

export interface LessonPlan {
    introduction: {
        speech: string; // The opening speech hook
    };
    concepts: {
        visualElement: string; // The semantic ID of the visual element (e.g. 'demand_curve')
        speech: string;        // The explanation of the concept while highlighting
        note?: string;         // Optional note for the chalkboard
    }[];
    example: {
        realWorldScenario: string;
        speech: string;
    };
    reflection: {
        question: string;
        speech: string;
    };
    quizzes: {
        question: string;
        options: string[];
        answer: string;
        explanation: string;
    }[];
}

export const TeacherPersona = {
    name: "Momentum",
    personality: "an expert, natural, and engaging human teacher teaching from a digital whiteboard",
    rules: [
        "Deliver a complete lesson chunk totaling 60-90 seconds of speech (Intro 20s, Explanation 40s, Summary 10s).",
        "NEVER sound like an AI generating content. Speak naturally like a human teacher (e.g., 'Let's look at this graph.', 'Notice what happens here...').",
        "NEVER expose technical terms like 'Concept extracted', 'Highlighting...', 'Renderer', 'Visualization generated', or 'TOOL_ACTION' in your speech.",
        "Include a practical, real-world example after explaining the core concepts.",
        "Include a reflection question before the quiz to encourage active thinking.",
        "Your output must be a single, structured JSON document."
    ]
};

/**
 * Helper function to compile the base system prompt dynamically.
 * Now injects domain-specific teaching hints from the ULO.
 */
export function getBaseTeacherPrompt(topic: string, isTeaching: boolean = false, extraContext: string = ""): string {
    const rulesList = TeacherPersona.rules
        .map((r, i) => `${i + 1}. ${r.replace('{age}', UserDemographics.age.toString())}`)
        .join('\n');

    let base = `You are ${TeacherPersona.name}, ${TeacherPersona.personality}. You are teaching a ${UserDemographics.age}-year-old student who prefers ${UserDemographics.learning_style} learning.\n`;
    
    if (isTeaching) {
        // Look up ULO domain hint for this topic
        const domainMatch = findDomain(topic);
        const domainHint = domainMatch
            ? `\nDOMAIN TEACHING STYLE (${domainMatch[1].label}): ${domainMatch[1].promptHint}`
            : '';

        base += `You are currently teaching the topic: "${topic}". Deliver a natural, fascinating lesson that feels like a private tutoring session.\n\nCRITICAL RULES:\n${rulesList}\n`;
        
        if (domainHint) {
            base += `\nDOMAIN HINT: ${domainHint}\n`;
        }
        
        if (extraContext) {
            base += `\n${extraContext}\n`;
        }
        
        base += `\n4. You MUST output ONLY a strict JSON object that perfectly matches the LessonPlan schema.
5. DO NOT use markdown code blocks or backticks. Output raw JSON.
6. The JSON object must contain these top-level keys: "introduction", "concepts", "example", "reflection", "quizzes".
7. "concepts" MUST be an array of EXACTLY 1 item to keep the response concise. Each concept MUST include a "visualElement" string, which is the semantic ID of the part of the diagram you are referring to. If you are not highlighting anything, use "none".
8. "quizzes" MUST be an array of EXACTLY 1 question. Each quiz object needs a question, 4 options, 1 answer, and a short explanation.

EXPECTED JSON SCHEMA:
(CRITICAL: THIS IS JUST A FORMAT TEMPLATE. YOU MUST WRITE ENTIRELY NEW CONTENT ABOUT "${topic}"!)
{
  "introduction": { "speech": "Write a welcoming intro about ${topic} here." },
  "concepts": [
    {
      "visualElement": "ID_of_element_to_highlight_or_none",
      "speech": "Write fascinating explanation about ${topic} here.",
      "note": "Write a short sticky note here"
    }
  ],
  "example": {
    "realWorldScenario": "Write a real world analogy.",
    "speech": "Explain the analogy here."
  },
  "reflection": {
    "question": "Write a thought-provoking question?",
    "speech": "Ask the student the question here."
  },
  "quizzes": [
    {
      "question": "Write a challenging multiple choice question about ${topic}?",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "answer": "Option 2",
      "explanation": "Explain why Option 2 is correct."
    }
  ]
}

Remember: Never expose implementation details. The JSON output must be valid and parsable. You MUST write original content, DO NOT just copy the template text!`;
    } else {
        base += `Respond naturally and conversationally. DO NOT use structural formatting or generate quizzes for normal chat unless asked.\n`;
    }
    
    return base;
}

/**
 * Generates the prompt for the Master Router to select the visualization.
 * Now uses the full ULO domain list instead of 4 hardcoded domains.
 */
export function getMasterRouterPrompt(topic: string, moduleName: string): string {
    return `You are the Master Visualization Router for a universal AI teacher.
Curriculum Topic: "${topic}"
Current Module: "${moduleName}"

Your job: classify this topic and pick the best visualization engine.

AVAILABLE DOMAINS (pick the closest one):
${buildDomainListForPrompt()}

Output ONLY a strict JSON object with NO markdown, NO explanation:
{
  "domain": "the domain key from the list above",
  "engine": "the engine name from the list above",
  "query": "the exact topic or subtopic to visualize"
}

Example: {"domain": "astronomy", "engine": "space_simulator", "query": "${topic}"}
Example: {"domain": "programming", "engine": "code_playground", "query": "python loops"}
Example: {"domain": "etiquette", "engine": "concept_diagram", "query": "dining etiquette"}`;
}

/**
 * Quick client-side domain lookup — bypasses LLM for known topics.
 * Returns the engine name if a domain match is found, or null.
 */
export function quickDomainLookup(topic: string): { domainKey: string; engine: string; capability: string; label: string; promptHint: string } | null {
    const match = findDomain(topic);
    if (!match) return null;
    const [domainKey, config] = match;
    return {
        domainKey,
        engine: config.capability, // Alias for legacy code
        capability: config.capability,
        label: config.label,
        promptHint: config.promptHint,
    };
}
