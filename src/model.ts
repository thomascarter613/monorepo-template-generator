import { GENERATOR_VERSION } from "./blueprint";
import type { Blueprint, Capability } from "./types";

export interface PackageJsonFile {
  name: string;
  private: boolean;
  type: "module";
  packageManager: string;
  workspaces: string[];
  scripts: Record<string, string>;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
}

export interface RepoModel {
  rootPackageJson: PackageJsonFile;
  textFiles: Map<string, string>;
  jsonFiles: Map<string, unknown>;
}

export function createModel(blueprint: Blueprint): RepoModel {
  return {
    rootPackageJson: {
      name: blueprint.repo.name,
      private: true,
      type: "module",
      packageManager: "bun@1",
      workspaces: ["apps/*", "packages/*"],
      scripts: {},
      dependencies: {},
      devDependencies: {},
    },
    textFiles: new Map(),
    jsonFiles: new Map(),
  };
}

export function addScript(
  model: RepoModel,
  name: string,
  command: string,
): void {
  model.rootPackageJson.scripts[name] = command;
}

export function addDependency(
  model: RepoModel,
  name: string,
  version = "latest",
): void {
  model.rootPackageJson.dependencies[name] = version;
}

export function addDevDependency(
  model: RepoModel,
  name: string,
  version = "latest",
): void {
  model.rootPackageJson.devDependencies[name] = version;
}

export function writeText(
  model: RepoModel,
  path: string,
  content: string,
): void {
  model.textFiles.set(path, content.trimEnd() + "\n");
}

export function writeJson(
  model: RepoModel,
  path: string,
  value: unknown,
): void {
  model.jsonFiles.set(path, value);
}

export function renderArtifacts(input: {
  blueprint: Blueprint;
  resolvedCapabilities: Capability[];
  model: RepoModel;
}): Map<string, string> {
  const { blueprint, resolvedCapabilities, model } = input;

  const artifacts = new Map<string, string>();

  artifacts.set(
    "package.json",
    JSON.stringify(model.rootPackageJson, null, 2) + "\n",
  );

  for (const [path, value] of model.jsonFiles.entries()) {
    artifacts.set(path, JSON.stringify(value, null, 2) + "\n");
  }

  for (const [path, value] of model.textFiles.entries()) {
    artifacts.set(path, value);
  }

  artifacts.set(
    ".monofactory/manifest.json",
    JSON.stringify(
      {
        blueprint,
        resolvedCapabilities,
      },
      null,
      2,
    ) + "\n",
  );

  artifacts.set(
    ".monofactory/state.json",
    JSON.stringify(
      {
        generatorVersion: GENERATOR_VERSION,
        resolvedCapabilities,
      },
      null,
      2,
    ) + "\n",
  );

  return artifacts;
}