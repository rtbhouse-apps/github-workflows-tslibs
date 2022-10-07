#!/usr/bin/env node

import * as core from "@actions/core";

import { assertProdVersion } from "./assert-prod-version.js";

async function run() {
  await assertProdVersion();
}

async function runWrapper() {
  try {
    await run();
  } catch (error) {
    core.setFailed(`assert-prod-version action failed: ${error}`);
    console.log(error); // eslint-disable-line no-console
  }
}

void runWrapper();
