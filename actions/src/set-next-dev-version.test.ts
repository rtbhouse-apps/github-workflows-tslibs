import test from "ava";
import * as fs from "fs/promises";
import * as path from "path";
import { dirname } from "path";
import semver from "semver";
import { fileURLToPath } from "url";

import { mock, setNextDevVersion } from "./set-next-dev-version.js";
import * as utils from "./utils.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

for (const [index, [existingVersions, gitBranch, expectedVersion]] of [
  [[], "dev", "0.3.0-dev.0"],
  [["0.3.0-dev.4", "0.3.0-dev.6"], "dev", "0.3.0-dev.7"],
  [["0.3.0-dev.9"], "dev", "0.3.0-dev.10"],
  [["0.3.0-dev.9", "0.3.0-dev.10"], "dev", "0.3.0-dev.11"],
  [["0.3.0-dev.17", "0.3.0-dev.19"], "dev", "0.3.0-dev.20"],
  [["0.3.0-feat-add-some-feature.0"], "feat/add.Some_Feature", "0.3.0-feat-add-some-feature.1"],
].entries()) {
  test(`setNextDevVersion${index}`, async (t) => {
    await utils.withTmpDir(async (tmpDir) => {
      await fs.copyFile(path.join(__dirname, "testdata/prod-version-package.json"), path.join(tmpDir, "package.json"));
      process.chdir(tmpDir);
      mock(
        async () => (existingVersions as string[]).map((version: string) => new semver.SemVer(version)),
        async () => gitBranch as string,
      );

      await t.notThrowsAsync(setNextDevVersion("dummy", "dummy", "dummy"));

      const packageJson = JSON.parse(await fs.readFile("package.json", "utf-8"));
      t.is(packageJson.version, expectedVersion);
    });
  });
}

test("setNextDevVersionOnMasterBranch", async (t) => {
  await utils.withTmpDir(async (tmpDir) => {
    await fs.copyFile(path.join(__dirname, "testdata/prod-version-package.json"), path.join(tmpDir, "package.json"));
    process.chdir(tmpDir);
    mock(
      async () => [],
      async () => "master",
    );

    await t.throwsAsync(setNextDevVersion("dummy", "dummy", "dummy"), {
      message: "Setting next development version can only be performed on a development branch",
    });
  });
});
