import semver from "semver";

import { getPackageJson } from "./common.js";

export async function assertProdVersion(): Promise<void> {
  const packageJson = await getPackageJson();
  const version = semver.parse(packageJson.version);
  if (version.prerelease.length > 0 || version.build.length > 0) {
    throw new Error(`Version ${packageJson.version} is not a production version.`);
  }
}
