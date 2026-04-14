import { z } from "zod";

export const CapabilitySchema = z.enum([
  "repo-core",
  "turbo",
  "typescript-starter",
  "biome",
]);

export type Capability = z.infer<typeof CapabilitySchema>;

export const PolicyTierSchema = z.enum(["must", "should", "could", "wont"]);

export type PolicyTier = z.infer<typeof PolicyTierSchema>;

export const RepoSchema = z.object({
  name: z.string().min(1),
  packageManager: z.literal("bun"),
  monorepoTool: z.literal("turbo"),
  languages: z.array(z.literal("typescript")).min(1),
});

export type RepoConfig = z.infer<typeof RepoSchema>;

export const TopologySchema = z.object({
  apps: z.boolean(),
  packages: z.boolean(),
  infra: z.boolean(),
  docs: z.boolean(),
  governance: z.boolean(),
});

export type TopologyConfig = z.infer<typeof TopologySchema>;

export const PolicySelectionsSchema = z.object({
  disabledShoulds: z.array(CapabilitySchema).default([]),
  enabledCoulds: z.array(CapabilitySchema).default([]),
});

export type PolicySelections = z.infer<typeof PolicySelectionsSchema>;

export const PoliciesSchema = z.object({
  conventionalCommits: z.boolean(),
  requireReadme: z.boolean(),
  requireSecurityMd: z.boolean(),
  requireContributingMd: z.boolean(),
});

export type PoliciesConfig = z.infer<typeof PoliciesSchema>;

export const BlueprintSchema = z.object({
  version: z.literal(1),
  outputDir: z.string().min(1),
  repo: RepoSchema,
  topology: TopologySchema,
  policySelections: PolicySelectionsSchema,
  policies: PoliciesSchema,
});

export type Blueprint = z.infer<typeof BlueprintSchema>;

export interface CapabilityDefinition {
  name: Capability;
  tier: PolicyTier;
  dependsOn: Capability[];
  conflictsWith: Capability[];
  rationale: string;
}

export interface ResolutionResult {
  must: Capability[];
  should: Capability[];
  could: Capability[];
  wont: Capability[];
  disabledShoulds: Capability[];
  enabledCoulds: Capability[];
  resolved: Capability[];
}