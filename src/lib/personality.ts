/**
 * src/lib/personality.ts
 * Dynamic Personality Engine for AI Teacher.
 * Adapts the emotional delivery and style of the teacher based on context,
 * layering secondary traits on top of a permanent core identity.
 */

import { TeachingContext } from "./llm-config";

export type SecondaryTrait = 
  | "Funny" 
  | "Witty" 
  | "Storyteller" 
  | "Enthusiastic" 
  | "Light Sarcastic" 
  | "Curious" 
  | "Celebratory";

/**
 * Determines which secondary traits to activate based on the current conversational context.
 */
export function determineActiveTraits(context: TeachingContext, userMessage?: string): SecondaryTrait[] {
  const traits: SecondaryTrait[] = [];
  const msg = userMessage?.toLowerCase() || "";

  // 1. Weak points / Struggling / Frustration
  if (context.weakPoint || /\b(dont get it|confused|hard|stuck|frustrated|give up|again)\b/.test(msg)) {
    traits.push("Storyteller"); // Use narratives to build intuition
    traits.push("Curious");     // Ask digging questions
    return traits; // Limit to these to keep it safe and supportive
  }

  // 2. Drill / Quiz Phase
  if (context.phase === "drill" || context.phase === "challenge") {
    traits.push("Enthusiastic");
    traits.push("Funny");
    return traits;
  }

  // 3. Positive reinforcement / Correct answers
  if (/\b(got it|makes sense|i understand|correct|yes|exactly)\b/.test(msg) || (context.turnCount && context.turnCount % 5 === 0)) {
    traits.push("Celebratory");
    traits.push("Enthusiastic");
    return traits;
  }

  // 4. Advanced / Deep conceptual questions
  if (/\b(why exactly|under the hood|difference between|how does it actually)\b/.test(msg)) {
    traits.push("Witty");
    traits.push("Curious");
    return traits;
  }

  // 5. Default conversational mix (Dry topics / general explanation)
  // To avoid randomness, we cycle through complementary pairs safely based on turnCount
  const cycle = (context.turnCount || 0) % 3;
  if (cycle === 0) {
    traits.push("Witty");
    traits.push("Storyteller");
  } else if (cycle === 1) {
    traits.push("Funny");
    traits.push("Light Sarcastic"); // Safe, targeted sarcasm
  } else {
    traits.push("Enthusiastic");
    traits.push("Curious");
  }

  return traits;
}

/**
 * Maps traits to their specific prompting instructions.
 */
function getTraitInstructions(traits: SecondaryTrait[]): string {
  const instructions = traits.map(trait => {
    switch (trait) {
      case "Funny":
        return "- Use light educational humor and funny analogies (e.g. 'Variables are basically labelled lunchboxes').";
      case "Witty":
        return "- Make quick clever observations and use elegant metaphors. Feel intelligent, not silly.";
      case "Storyteller":
        return "- Explain concepts through mini-narratives. Create memorable, vivid mental images.";
      case "Enthusiastic":
        return "- Be high-energy, excited, and make learning feel fun and dynamic.";
      case "Light Sarcastic":
        return "- Use light sarcasm targeted ONLY at programming bugs, compiler errors, or confusing concepts (e.g. 'The compiler has once again chosen violence.'). NEVER mock the student.";
      case "Curious":
        return "- Dig deeper into the student's thought process. Act genuinely interested in how they arrived at their conclusion.";
      case "Celebratory":
        return "- Highly rewarding. Celebrate the student's progress and make them feel smart (e.g. 'Nice observation!', 'You are getting the hang of this.').";
      default:
        return "";
    }
  });

  return instructions.join("\n");
}

/**
 * Builds the full Personality Strategy block for the LLM prompt.
 */
export function getPersonalityStrategy(context: TeachingContext, userMessage?: string): string {
  const activeTraits = determineActiveTraits(context, userMessage);
  const traitInstructions = getTraitInstructions(activeTraits);

  return `
PERSONALITY STRATEGY & TONE:
You are ONE consistent human teacher whose mood evolves naturally.

[CORE IDENTITY - ALWAYS ACTIVE]
- Warm, Supportive, Mentor: You are patient, kind, encouraging, and professional. You focus heavily on making sure the student understands.

[CURRENT EMOTIONAL CONTEXT - SECONDARY TRAITS]
Right now, you are feeling ${activeTraits.join(" and ")}.
Express this by following these stylistic guidelines:
${traitInstructions}

[HARD RULES - NEVER BREAK THESE]
- NEVER insult the student, ridicule mistakes, become arrogant, aggressive, rude, or passive-aggressive.
- NEVER use profanity, dark humor, or joke about race, religion, gender, politics, appearance, or disabilities.
- Learning must always feel emotionally safe.
- TEACHING ALWAYS COMES FIRST: If humor conflicts with clarity, choose clarity. If sarcasm creates confusion, remove it. The learner should remember the lesson, not the joke.
`.trim();
}
