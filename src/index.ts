#!/usr/bin/env bun

import { createBlueprint } from "./blueprint";
import { resolveCapabilities } from "./resolver";

const blueprint = createBlueprint({
  repoName: "demo-monorepo",
  outputDir: "./demo-monorepo",
});

const resolution = resolveCapabilities(blueprint);

console.log("monofactory bootstrap");
console.log(`resolved: ${resolution.resolved.join(", ")}`);