/**
 * src/lib/pedagogy.ts
 * Pedagogical Teaching Strategy module for AI Teacher.
 * Classifies user intent and provides structured teaching strategies.
 */

export type PedagogicalIntent =
  | "Definition"
  | "Explanation"
  | "Procedure"
  | "Comparison"
  | "Problem Solving"
  | "Conceptual Understanding"
  | "Revision"
  | "Quiz"
  | "Follow-up Question";

/**
 * Classifies user request into one of 9 pedagogical categories based on pattern matching
 * and current teaching session phase.
 */
export function classifyPedagogicalIntent(userMessage: string, phase?: string): PedagogicalIntent {
  const msg = userMessage.trim();
  if (!msg) {
    return phase === "drill" || phase === "challenge" ? "Quiz" : "Explanation";
  }

  // 1. Quiz / Testing
  if (
    /\b(quiz|test me|exam|ask me a question|question me|check my knowledge|ready for quiz|drill me)\b/i.test(msg) ||
    ((phase === "drill" || phase === "challenge") && msg.length < 100 && !/\b(what|why|how|explain|define)\b/i.test(msg))
  ) {
    return "Quiz";
  }

  // 2. Comparison
  if (/\b(vs|versus|compare|difference between|similarities|differ|better than|instead of|compared to)\b/i.test(msg)) {
    return "Comparison";
  }

  // 3. Procedure / Step-by-Step
  if (/\b(how do i|how to|steps to|procedure|recipe|process of|guide for|instructions to|how can i build|how do we make)\b/i.test(msg)) {
    return "Procedure";
  }

  // 4. Problem Solving / Math / Troubleshooting
  if (/\b(solve|calculate|compute|find the|why is this error|fix this|troubleshoot|debug|equation|value of|evaluate)\b/i.test(msg) || /[\d]+\s*[\+\-\*\/\=]\s*[\d]+/.test(msg)) {
    return "Problem Solving";
  }

  // 5. Definition
  if (/\b(what is|what are|define|meaning of|what does .* mean|definition of)\b/i.test(msg)) {
    return "Definition";
  }

  // 6. Revision / Summary
  if (/\b(revise|review|recap|summarize|summary|refresh|remind me|recap of)\b/i.test(msg)) {
    return "Revision";
  }

  // 7. Conceptual Understanding
  if (/\b(why does|how does .* work|concept of|intuition behind|understand|mental model|explain why|theory behind|big picture)\b/i.test(msg)) {
    return "Conceptual Understanding";
  }

  // 8. Follow-up Question
  if (msg.split(/\s+/).length <= 6 || /\b(and then|what about|why|how come|can you elaborate|what if|another example|more|continue|yes|no|go on)\b/i.test(msg)) {
    return "Follow-up Question";
  }

  // 9. Default Explanation
  return "Explanation";
}

/**
 * Returns the structural teaching rules for a specific pedagogical category.
 */
export function getStrategyPrompt(intent: PedagogicalIntent): string {
  switch (intent) {
    case "Definition":
      return `
- One sentence definition.
- Simple explanation in plain English.
- One real-world example that makes it instantly relatable.`.trim();

    case "Explanation":
      return `
- Introduce the concept simply.
- Explain step-by-step without skipping logical leaps.
- Give an intuitive real-world analogy.
- Summarize the core takeaway in one sentence.`.trim();

    case "Procedure":
      return `
- Provide ordered steps (Step 1, Step 2, etc.).
- Mention important precautions or common mistakes to avoid.
- End with a quick recap of the process.`.trim();

    case "Comparison":
      return `
- Briefly explain Item A.
- Briefly explain Item B.
- Highlight key similarities.
- Highlight critical differences.
- Clearly state when each item should be used.`.trim();

    case "Problem Solving":
      return `
- Clarify and understand the problem first.
- Explain the underlying reasoning and formula/rule needed.
- Solve step-by-step clearly.
- State the final answer explicitly.
- Ask if the student needs another example or practice problem.`.trim();

    case "Conceptual Understanding":
      return `
- Connect the concept to the student's prior knowledge.
- Build intuition before introducing technical jargon.
- Provide a clear mental model or visual framework.
- Test their grasp with a quick thought experiment or challenge question.`.trim();

    case "Revision":
      return `
- Give a quick recap of the key takeaways.
- Highlight common pitfalls and misunderstandings.
- Check memory retention with a targeted review question.`.trim();

    case "Quiz":
      return `
- Ask ONE question at a time. Never ask multiple questions at once.
- Wait for the student's answer.
- Give constructive, specific feedback on their response.
- Continue to the next question only after the student has responded.`.trim();

    case "Follow-up Question":
      return `
- Acknowledge the context of the previous turn.
- Answer the follow-up question directly and concisely.
- Tie the answer back to the main learning topic.
- Ask a checking question to verify their understanding.`.trim();
  }
}

/**
 * Formats the full pedagogical framework for inclusion in the AI Teacher system prompt.
 */
export function getPedagogicalRules(intent: PedagogicalIntent): string {
  return `
PEDAGOGICAL TEACHING STRATEGY (ACTIVE INTENT: ${intent.toUpperCase()}):
You are teaching like an elite, compassionate, real-world educator — never like a generic chatbot or textbook.
You must adopt the following structural teaching strategy for this response:
${getStrategyPrompt(intent)}

CORE PEDAGOGICAL RULES:
1. Keep spoken responses concise: Target 30–90 seconds of speech (~60–140 words max). Never lecture endlessly.
2. Avoid information dumping: Teach incrementally. If an explanation requires more depth, explain ONE section and ask if the student wants to continue.
3. Frequently verify understanding: Always end your speech or question field with a checking phrase (e.g., "Does that make sense?", "Would you like an example?", "Can you tell me what you understood so far?").
4. Never overwhelm beginners: Use simple language, short paragraphs, concrete examples, and relatable analogies.
`.trim();
}
