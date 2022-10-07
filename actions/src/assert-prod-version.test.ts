import test from "ava";
import * as fs from "fs/promises";
import * as path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";

import { assertProdVersion } from "./assert-prod-version.js";
import * as utils from "./utils.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

test("assertProdVersion", async (t) => {
  await utils.withTmpDir(async (tmpDir) => {
    await fs.copyFile(path.join(__dirname, "testdata/prod-version-package.json"), path.join(tmpDir, "package.json"));
    process.chdir(tmpDir);
    await t.notThrowsAsync(assertProdVersion());
  });
});

test("assertProdVersionThrowsError", async (t) => {
  await utils.withTmpDir(async (tmpDir) => {
    await fs.copyFile(
      path.join(__dirname, "testdata/not-prod-version-package.json"),
      path.join(tmpDir, "package.json"),
    );
    process.chdir(tmpDir);
    await t.throwsAsync(assertProdVersion(), {
      message: "Version 0.3.0-dev3 is not a production version.",
    });
  });
});
