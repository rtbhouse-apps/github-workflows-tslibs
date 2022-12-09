import test from "ava";
import * as fs from "fs/promises";
import * as path from "path";
import { dirname } from "path";
import semver from "semver";
import { fileURLToPath } from "url";

import { mock, shouldPublishPackage } from "./should-publish-package.js";
import * as utils from "./utils.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

test("shouldPublishPackage", async (t) => {
  await utils.withTmpDir(async (tmpDir) => {
    await fs.copyFile(path.join(__dirname, "testdata/prod-version-package.json"), path.join(tmpDir, "package.json"));
    process.chdir(tmpDir);
    mock(async () => [new semver.SemVer("0.1.0"), new semver.SemVer("0.2.0")]);

    const publish = await shouldPublishPackage("dummy", "dummy", "dummy");

    t.true(publish);
  });
});

test("shouldPublishPackageEmptyResponse", async (t) => {
  await utils.withTmpDir(async (tmpDir) => {
    await fs.copyFile(path.join(__dirname, "testdata/prod-version-package.json"), path.join(tmpDir, "package.json"));
    process.chdir(tmpDir);
    mock(async () => []);

    const publish = await shouldPublishPackage("dummy", "dummy", "dummy");

    t.true(publish);
  });
});

test("shouldPublishPackageThrowsError", async (t) => {
  await utils.withTmpDir(async (tmpDir) => {
    await fs.copyFile(path.join(__dirname, "testdata/prod-version-package.json"), path.join(tmpDir, "package.json"));
    process.chdir(tmpDir);
    mock(async () => [new semver.SemVer("0.2.0"), new semver.SemVer("0.3.0")]);

    const publish = await shouldPublishPackage("dummy", "dummy", "dummy");

    t.false(publish);
  });
});
