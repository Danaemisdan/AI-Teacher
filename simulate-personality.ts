import { buildSystemPrompt, TeachingContext } from "./src/lib/llm-config";

function runSimulation() {
  console.log("=== SIMULATING PERSONALITY ENGINE ===");
  const userMessage = "What is a Variable?";

  const contexts: { name: string; ctx: TeachingContext }[] = [
    {
      name: "Struggling Student (Frustrated)",
      ctx: { phase: "hook", weakPoint: "I don't understand variables at all", turnCount: 2 }
    },
    {
      name: "Drill Phase (Testing)",
      ctx: { phase: "drill", turnCount: 4 }
    },
    {
      name: "Advanced Question (Deep Dive)",
      ctx: { phase: "hook", turnCount: 6 } // We will pass a different userMessage for this
    },
    {
      name: "Positive Reinforcement (Correct Answer)",
      ctx: { phase: "scaffold", turnCount: 5 } // Divisible by 5 triggers celebratory
    },
    {
      name: "Default Turn 1 (Witty / Storyteller)",
      ctx: { phase: "scaffold", turnCount: 3 }
    },
    {
      name: "Default Turn 2 (Funny / Light Sarcastic)",
      ctx: { phase: "scaffold", turnCount: 4 }
    }
  ];

  for (const scenario of contexts) {
    console.log(`\n\n--- SCENARIO: ${scenario.name} ---`);
    let msg = userMessage;
    if (scenario.name === "Struggling Student (Frustrated)") {
      msg = "I just don't get it at all, this is too hard.";
    } else if (scenario.name === "Advanced Question (Deep Dive)") {
      msg = "But under the hood, how does a variable map to memory?";
    } else if (scenario.name === "Positive Reinforcement (Correct Answer)") {
      msg = "Ah, I understand! It's like a container.";
    }

    const prompt = buildSystemPrompt("high", scenario.ctx, msg);
    
    // Extract just the Personality Strategy block to show what the LLM receives
    const personalityBlock = prompt.split("CURRENT CONTEXT:")[0].trim();
    console.log(`User Message: "${msg}"`);
    console.log(personalityBlock);
  }
}

runSimulation();
