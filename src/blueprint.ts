import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import type { Blueprint } from "./types";
import { BlueprintSchema } from "./types";

export const BLUEPRINT_FILE = "monofactory.blueprint.json";
export const GENERATOR_VERSION = "0.1.0";

export function createBlueprint(input: {
  repoName: string;
  outputDir: string;
}): Blueprint {
  return {
    version: 1,
    outputDir: input.outputDir,
    repo: {
      name: input.repoName,
      packageManager: "bun",
      monorepoTool: "turbo",
      languages: ["typescript"],
    },
    topology: {
      apps: true,
      packages: true,
      infra: true,
      docs: true,
      governance: true,
    },
    policySelections: {
      disabledShoulds: [],
      enabledCoulds: [],
    },
    policies: {
      conventionalCommits: true,
      requireReadme: true,
      requireSecurityMd: true,
      requireContributingMd: true,
    },
  };
}

export function loadBlueprint(file = BLUEPRINT_FILE): Blueprint {
  const raw = JSON.parse(readFileSync(resolve(file), "utf8"));
  return BlueprintSchema.parse(raw);
}

export function saveBlueprint(
  blueprint: Blueprint,
  file = BLUEPRINT_FILE,
): void {
  writeFileSync(
    resolve(file),
    JSON.stringify(blueprint, null, 2) + "\n",
    "utf8",
  );
}