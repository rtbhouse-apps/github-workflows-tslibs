#!/usr/bin/env node

import * as core from "@actions/core";

import { getPackageJson } from "./common.js";
import { shouldPublishPackage } from "./should-publish-package.js";

async function run() {
  // const repositoryUrl = core.getInput("repository-url", { required: true });
  // const repositoryToken = core.getInput("repository-token", { required: true });
  const repositoryUrl = process.env.REPOSITORY_URL;
  const repositoryToken = process.env.REPOSITORY_TOKEN;
  const publish = await shouldPublishPackage(repositoryUrl, repositoryToken);
  if (publish) {
    core.setOutput("publish", "1");
  } else {
    const packageJson = await getPackageJson();
    core.warning(
      `Package ${packageJson.name} with version ${packageJson.version} already exists in repository. ` +
        `Did you forget to bump the version?`,
    );
  }
}

async function runWrapper() {
  try {
    await run();
  } catch (error) {
    core.setFailed(`should-publish-package action failed: ${error}`);
    console.log(error); // eslint-disable-line no-console
  }
}

void runWrapper();
