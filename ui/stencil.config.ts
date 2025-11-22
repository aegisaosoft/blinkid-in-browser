/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */
import { Config } from "@stencil/core";
import { postcss } from "@stencil/postcss";
import { sass } from "@stencil/sass";

import autoprefixer from "autoprefixer";

export const config: Config = {
  namespace: "blinkid-in-browser",
  taskQueue: "async",
  extras: {
    // fix for loading in Vite
    experimentalImportInjection: true,
  },
  devServer: {
    address: "0.0.0.0",
    https: {
      cert: "./certs/cert.pem",
      key: "./certs/key.pem",
    },
    port: 3333,
  },
  outputTargets: [
    {
      type: "dist",
      esmLoaderPath: "../loader",
    },
    {
      type: "docs-readme",
      dir: "docs",
      strict: true,
    },
  ],
  plugins: [
    sass({
      // Add path to global SCSS files which should be included in every stylesheet
      injectGlobalPaths: [],
    }),
    postcss({
      plugins: [autoprefixer()],
    }),
  ],
};
