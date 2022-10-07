import { readFile } from "fs/promises";
import pacote from "pacote";
import semver from "semver";

interface PackageJson {
  name: string;
  version: string;
}

interface HttpErrorGeneral extends Error {
  statusCode: number;
}

export async function getPackageJson(): Promise<PackageJson> {
  const packageJsonStr = await readFile("package.json", "utf8");
  return JSON.parse(packageJsonStr);
}

export async function getAllPackageVersions(
  packageName: string,
  registry: string,
  registryToken: string,
): Promise<semver.SemVer[]> {
  let pack: pacote.Packument | null = null;
  try {
    const registryUrl = new URL(registry);
    pack = await pacote.packument(packageName, {
      registry: registryUrl.toString(),
      [`//${registryUrl.host}/:_authToken`]: registryToken,
      fullMetadata: true,
    });
  } catch (err) {
    if (errorIsHttpErrorGeneral(err) && "statusCode" in err) {
      return [];
    }
    throw err;
  }

  const versions = Object.keys(pack.versions).map((versionStr) => {
    const version = semver.parse(versionStr);
    if (version === null) {
      throw new Error(`Failed to parse version: ${versionStr} fetched from remote registry`);
    }
    return version;
  });
  return versions;
}

function errorIsHttpErrorGeneral(err: unknown): err is HttpErrorGeneral {
  return err instanceof Error && "statusCode" in err;
}
