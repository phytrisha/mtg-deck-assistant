import { readFileSync } from "fs";
import { join } from "path";

export type PromptType =
  | "overview"
  | "synergies"
  | "mulligan"
  | "matchups"
  | "tactics"
  | "sideboarding"
  | "cardAnalysis"
  | "analyze-card"
  | "strategy";

export function loadPrompt(type: PromptType, variables: Record<string, string> = {}): string {
  const promptPath = join(process.cwd(), "lib", "prompts", `${type}.txt`);
  let prompt = readFileSync(promptPath, "utf-8");

  // Replace variables in the prompt
  for (const [key, value] of Object.entries(variables)) {
    prompt = prompt.replace(new RegExp(`\\{${key}\\}`, "g"), value);
  }

  return prompt;
}
