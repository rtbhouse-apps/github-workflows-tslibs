import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import resolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import gyp from "rollup-plugin-node-gyp";

export default [
  {
    input: "src/assert-prod-version-action.ts",
    output: {
      file: "lib/assert-prod-version-action/index.js",
      format: "cjs",
    },
    plugins: [typescript(), commonjs(), resolve(), gyp(), json()],
  },
  {
    input: "src/set-next-dev-version-action.ts",
    output: {
      file: "lib/set-next-dev-version-action/index.js",
      format: "es",
    },
    plugins: [typescript(), commonjs(), resolve(), json()],
  },
  {
    input: "src/should-publish-package-action.ts",
    output: {
      file: "lib/should-publish-package-action/index.js",
      format: "es",
    },
    plugins: [typescript(), commonjs(), resolve(), json()],
  },
];
