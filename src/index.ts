#!/usr/bin/env bun

import { createBlueprint } from "./blueprint";
import { createModel, renderArtifacts } from "./model";
import { applyResolvedCapabilities } from "./modules";
import { resolveCapabilities } from "./resolver";

const blueprint = createBlueprint({
  repoName: "demo-monorepo",
  outputDir: "./demo-monorepo",
});

const resolution = resolveCapabilities(blueprint);
const model = createModel(blueprint);

applyResolvedCapabilities(blueprint, resolution.resolved, model);

const artifacts = renderArtifacts({
  blueprint,
  resolvedCapabilities: resolution.resolved,
  model,
});

console.log("monofactory bootstrap");
console.log(`resolved: ${resolution.resolved.join(", ")}`);
console.log(`artifact count: ${artifacts.size}`);
console.log([...artifacts.keys()].sort().join("\n"));