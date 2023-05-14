import { Parcel } from "@parcel/core"
import path from "path"
import fs from "fs-extra"
import process from "process"
import { fileURLToPath } from "url"

const __dirname = fileURLToPath(new URL(".", import.meta.url))

const testEntryDir = "src/regressions"
const testEntries = fs
  .readdirSync(testEntryDir)
  .map((filename) => path.join(testEntryDir, filename, "index.html"))

const entries = [
  "src/background/index.ts",
  "src/inject.ts",
  "src/options/options.html",
]

const statics = ["src/manifest.json", "src/images"]

function getDistDir() {
  const isProduction = process.env.NODE_ENV === "production"
  return isProduction ? "build" : "debug"
}

function clean() {
  return fs.remove(path.join(__dirname, "..", getDistDir()))
}

function build({ serve }) {
  const distDir = getDistDir()
  const useHMR = process.env.NODE_ENV !== "production"

  const bundler = new Parcel({
    entries: [
      ...entries,
      ...(process.env.NODE_ENV === "test" ? testEntries : []),
    ],
    mode: process.env.NODE_ENV || "development",
    defaultTargetOptions: {
      distDir,
    },
    defaultConfig: "@parcel/config-default",

    // Serving entry files to develop locally without needing to load it as an Extension.
    // NOTE: Using these options causes Chrome to display a CSP issue but it's harmless;
    // Parcel's hmr-runtime is merely checking on the availability of eval().
    ...(useHMR && {
      serveOptions: {
        port: 3000,
      },
      hmrOptions: {
        // Using different port. see: https://github.com/parcel-bundler/parcel/issues/6061
        // this might be resolved (with a new build setup) if we use a plugin
        // @parcel/config-webextension when migrating to Manifest V3.
        port: 3001,
      },
    }),
  })

  console.info("[*] distDir:", distDir)

  if (serve) {
    console.info("[*] Server running.")
    console.info("    Options: http://localhost:3000/options/options.html")

    return bundler.watch((err, buildEvent) => {
      if (err) throw err

      switch (buildEvent.type) {
        case "buildFailure":
          console.error(buildEvent.diagnostics)
          break
      }
    })
  } else {
    return bundler.run()
  }
}

function copyStatic() {
  const files = statics.map((f) => path.join(__dirname, "..", f))

  for (const file of files) {
    fs.copy(file, path.join(__dirname, "..", getDistDir(), path.basename(file)))
  }
}

function run() {
  const env = process.argv[2]
  process.env.NODE_ENV ||=
    env === "dev" ? "development" : env === "test" ? "test" : "production"

  const isProduction = process.env.NODE_ENV === "production"
  const runDevServer = !isProduction

  console.info("[*] NODE_ENV:", process.env.NODE_ENV)

  clean()
    .then(() => build({ serve: runDevServer }))
    .then(copyStatic)
}

run()
