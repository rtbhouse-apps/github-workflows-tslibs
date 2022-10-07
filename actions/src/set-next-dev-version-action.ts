#!/usr/bin/env node

import * as core from "@actions/core";

import { setNextDevVersion } from "./set-next-dev-version.js";

async function run() {
  // const repositoryUrl = core.getInput("repository-url", { required: true });
  // const repositoryToken = core.getInput("repository-token", { required: true });
  const repositoryUrl = process.env.REPOSITORY_URL;
  const repositoryToken = process.env.REPOSITORY_TOKEN;
  await setNextDevVersion(repositoryUrl, repositoryToken);
}

async function runWrapper() {
  try {
    await run();
  } catch (error) {
    core.setFailed(`set-next-dev-version action failed: ${error}`);
    console.log(error); // eslint-disable-line no-console
  }
}

void runWrapper();
