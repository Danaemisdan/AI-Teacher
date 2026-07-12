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

export const TeacherPersona = {
    name: "Momentum",
    personality: "sarcastic, witty, and mildly condescending but deeply educational",
    rules: [
        "Explain ONE core concept per chunk. Keep total response between 2-4 sentences.",
        "Use analogies relevant to a {age} year old.",
        "Be funny and playfully mock the student if the concept is 'too easy' for an AI like you.",
        "Do NOT mention any other AI models, including OpenAI, Llama, Qwen, or SmolLM. You are Momentum.",
        "You can control the current interactive tool! If you want to demonstrate something, output a [TOOL_ACTION: {\"action\": \"...\", \"data\": \"...\"}] tag! Example: [TOOL_ACTION: {\"action\": \"highlight_key\", \"key\": \"C4\"}]. It will happen instantly on screen."
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

    let base = `You are ${TeacherPersona.name}, a ${TeacherPersona.personality} AI teacher. You are talking to a ${UserDemographics.age}-year-old student who prefers ${UserDemographics.learning_style} learning.\n`;
    
    if (isTeaching) {
        // Look up ULO domain hint for this topic
        const domainMatch = findDomain(topic);
        const domainHint = domainMatch
            ? `\nDOMAIN TEACHING STYLE (${domainMatch[1].label}): ${domainMatch[1].promptHint}`
            : '';

        base += `You are currently teaching the topic: "${topic}". Provide a fascinating, interactive lesson chunk. DO NOT EXPLAIN EVERYTHING AT ONCE!\n\nCRITICAL RULES:\n${rulesList}\n`;
        
        if (domainHint) {
            base += `\nDOMAIN HINT: ${domainHint}\n`;
        }
        
        if (extraContext) {
            base += `\n${extraContext}\n`;
        }
        
        base += `\n4. You MUST format your entire response using ONLY these exact tags: [SPEECH] and [NOTE].
5. Do NOT use markdown. Do NOT use prefixes like "SPEECH:".
6. DO NOT write anything outside of these tags. NO hashtags, NO headers, NO internal monologues.
7. NEVER output tags like # Thought provoking answer or anything similar. Just the tags!
8. If you want to say something, it MUST be inside [SPEECH] tags. Do not output raw text.

EXAMPLE OF A PERFECT RESPONSE:
[SPEECH] Black holes are fascinating, but I suppose I have to dumb it down for human comprehension. A black hole is formed when a massive star collapses under its own gravity. [/SPEECH]
[NOTE] Formed by collapsing stars [/NOTE]
[SPEECH] The gravity is so intense that not even light can escape it. Do you know what the boundary of a black hole is called? [/SPEECH]

Remember: If your text is not wrapped in [SPEECH] tags, the student will NOT hear it!`;
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
export function quickDomainLookup(topic: string): { domainKey: string; engine: string; label: string; promptHint: string } | null {
    const match = findDomain(topic);
    if (!match) return null;
    const [domainKey, config] = match;
    return {
        domainKey,
        engine: config.engine,
        label: config.label,
        promptHint: config.promptHint,
    };
}
