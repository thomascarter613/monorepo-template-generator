import type {
  Blueprint,
  Capability,
  CapabilityDefinition,
  ResolutionResult,
} from "./types";

export const capabilityRegistry: Record<Capability, CapabilityDefinition> = {
  "repo-core": {
    name: "repo-core",
    tier: "must",
    dependsOn: [],
    conflictsWith: [],
    rationale: "Canonical repository structure and generator metadata are non-negotiable.",
  },
  turbo: {
    name: "turbo",
    tier: "should",
    dependsOn: ["repo-core"],
    conflictsWith: [],
    rationale: "Turborepo is the default orchestrator for this generator.",
  },
  "typescript-starter": {
    name: "typescript-starter",
    tier: "should",
    dependsOn: ["repo-core", "turbo"],
    conflictsWith: [],
    rationale: "A TypeScript starter slice is part of the recommended baseline.",
  },
  biome: {
    name: "biome",
    tier: "should",
    dependsOn: ["repo-core"],
    conflictsWith: [],
    rationale: "Biome is the default formatter and linter for the generated workspace.",
  },
};

function unique(values: Capability[]): Capability[] {
  return [...new Set(values)];
}

function visit(
  capability: Capability,
  visited: Set<Capability>,
  result: Capability[],
): void {
  if (visited.has(capability)) {
    return;
  }

  visited.add(capability);

  const definition = capabilityRegistry[capability];
  for (const dependency of definition.dependsOn) {
    visit(dependency, visited, result);
  }

  result.push(capability);
}

export function resolveCapabilities(blueprint: Blueprint): ResolutionResult {
  const definitions = Object.values(capabilityRegistry);

  const must = definitions
    .filter((definition) => definition.tier === "must")
    .map((definition) => definition.name);

  const should = definitions
    .filter((definition) => definition.tier === "should")
    .map((definition) => definition.name);

  const could = definitions
    .filter((definition) => definition.tier === "could")
    .map((definition) => definition.name);

  const wont = definitions
    .filter((definition) => definition.tier === "wont")
    .map((definition) => definition.name);

  const disabledShoulds = unique(
    blueprint.policySelections.disabledShoulds.filter((capability) =>
      should.includes(capability),
    ),
  );

  const enabledCoulds = unique(
    blueprint.policySelections.enabledCoulds.filter((capability) =>
      could.includes(capability),
    ),
  );

  const selected = unique([
    ...must,
    ...should.filter((capability) => !disabledShoulds.includes(capability)),
    ...enabledCoulds,
  ]);

  const visited = new Set<Capability>();
  const resolved: Capability[] = [];

  for (const capability of selected) {
    visit(capability, visited, resolved);
  }

  for (const capability of resolved) {
    const definition = capabilityRegistry[capability];

    for (const conflict of definition.conflictsWith) {
      if (resolved.includes(conflict)) {
        throw new Error(
          `Capability conflict: ${capability} cannot be used with ${conflict}`,
        );
      }
    }

    if (wont.includes(capability)) {
      throw new Error(`Forbidden capability resolved: ${capability}`);
    }
  }

  return {
    must,
    should,
    could,
    wont,
    disabledShoulds,
    enabledCoulds,
    resolved: unique(resolved),
  };
}