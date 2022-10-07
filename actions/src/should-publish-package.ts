import semver from "semver";

import { getAllPackageVersions as _getAllPackagesVersion, getPackageJson } from "./common.js";

let getAllPackageVersions = _getAllPackagesVersion;

export async function shouldPublishPackage(repositoryUrl: string, repositoryToken: string): Promise<boolean> {
  const packageJson = await getPackageJson();
  const packageName = packageJson.name;
  const currentVersion = semver.parse(packageJson.version);
  const versions = await getAllPackageVersions(packageName, repositoryUrl, repositoryToken);

  return !versions.some((version) => version.version === currentVersion.version);
}

export function mock(mockedGetAllPackageVersions: typeof getAllPackageVersions | undefined = undefined): void {
  getAllPackageVersions = mockedGetAllPackageVersions || _getAllPackagesVersion;
}
