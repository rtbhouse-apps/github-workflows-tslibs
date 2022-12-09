import { exec } from "child_process";
import { writeFile } from "fs/promises";
import semver from "semver";
import { promisify } from "util";

import { getAllPackageVersions as _getAllPackageVersions, getPackageJson } from "./common.js";

const execAsync = promisify(exec);
let [getAllPackageVersions, getGitBranch] = [_getAllPackageVersions, _getGitBranch];

export async function setNextDevVersion(
  repositoryUrl: string,
  repositoryLogin: string,
  repositoryPassword: string,
): Promise<void> {
  const gitBranch = await getGitBranch();
  if (["master", "main"].includes(gitBranch)) {
    throw new Error("Setting next development version can only be performed on a development branch");
  }

  const packageJson = await getPackageJson();
  const packageName = packageJson.name;
  const currentVersion = semver.parse(packageJson.version);
  packageJson.version = (
    await getNextDevVersion(packageName, currentVersion, gitBranch, repositoryUrl, repositoryLogin, repositoryPassword)
  ).version;
  await writeFile("package.json", JSON.stringify(packageJson));
}

async function getNextDevVersion(
  packageName: string,
  currentVersion: semver.SemVer,
  gitBranch: string,
  repositoryUrl: string,
  repositoryLogin: string,
  repositoryPassword: string,
): Promise<semver.SemVer> {
  const currentVersionFinalized = finalizeVersion(currentVersion);
  const gitBranchTokenized = gitBranch.replace(/_|\.|\//g, "-").toLowerCase();
  const allPackageVersions = await getAllPackageVersions(
    packageName,
    repositoryUrl,
    repositoryLogin,
    repositoryPassword,
  );
  const currentDevVersions = allPackageVersions.filter(
    (version) =>
      finalizeVersion(version).version === currentVersionFinalized.version &&
      version.prerelease[0] === gitBranchTokenized,
  );

  let nextDevVersion: semver.SemVer | null = null;
  if (currentDevVersions.length > 0) {
    nextDevVersion = currentDevVersions
      .reduce((prev, current) => (prev.prerelease[1] >= current.prerelease[1] ? prev : current))
      .inc("prerelease");
  } else {
    nextDevVersion = new semver.SemVer(currentVersionFinalized);
    nextDevVersion.prerelease = [gitBranchTokenized, 0];
    nextDevVersion.format();
  }

  return nextDevVersion;
}

async function _getGitBranch(): Promise<string> {
  let stdout: string | null = null;
  try {
    ({ stdout } = await execAsync("git rev-parse --short HEAD", { timeout: 2000, encoding: "utf8" }));
  } catch (err) {
    throw new Error(`Failed to get git branch: ${err}`);
  }

  if (stdout.length === 0) {
    throw new Error("Failed to get git branch: empty output");
  }

  return stdout.trim();
}

function finalizeVersion(version: semver.SemVer): semver.SemVer {
  return new semver.SemVer(`${version.major}.${version.minor}.${version.patch}`);
}

export function mock(
  mockedGetAllPackageVersions: typeof _getAllPackageVersions | undefined = undefined,
  mockedGetGitBranch: typeof _getGitBranch | undefined = undefined,
): void {
  getAllPackageVersions = mockedGetAllPackageVersions || _getAllPackageVersions;
  getGitBranch = mockedGetGitBranch || _getGitBranch;
}
