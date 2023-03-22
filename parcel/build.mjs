import { Parcel } from "@parcel/core"
import path from "path"
import fs from "fs-extra"
import process from "process"
import { fileURLToPath } from "url"

const __dirname = fileURLToPath(new URL(".", import.meta.url))
let distDir

function getDistDir({ debug = false }) {
  return debug ? "debug" : "build"
}

const entries = [
  "src/background/index.ts",
  "src/inject.ts",
  "src/options/options.html",
]

const statics = ["src/manifest.json", "src/images"]

function clean() {
  return fs.remove(path.join(__dirname, "..", distDir))
}

function build({ debug } = { debug: false }) {
  const bundler = new Parcel({
    entries,
    mode: process.env.NODE_ENV || "development",
    defaultTargetOptions: {
      distDir,
    },
    defaultConfig: "@parcel/config-default",

    // Serving entry files to develop locally without needing to load it as an Extension.
    // NOTE: Using these options causes Chrome to display a CSP issue but it's harmless;
    // Parcel's hmr-runtime is merely checking on the availability of eval().
    serveOptions: {
      port: 3000,
    },
    hmrOptions: {
      // Using different port. see: https://github.com/parcel-bundler/parcel/issues/6061
      // this might be resolved (with a new build setup) if we use a plugin
      // @parcel/config-webextension when migrating to Manifest V3.
      port: 3001,
    },
  })

  console.info(`[*] distDir: ${distDir}`)

  if (debug) {
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
    fs.copy(file, path.join(__dirname, "..", distDir, path.basename(file)))
  }
}

function run() {
  const args = process.argv.slice(2)

  if (args.includes("--debug")) {
    process.env.NODE_ENV = "development"
    distDir = getDistDir({ debug: true })
    clean()
      .then(() => build({ debug: true }))
      .then(copyStatic)
  } else {
    process.env.NODE_ENV = "production"
    distDir = getDistDir({ debug: false })
    clean().then(build).then(copyStatic)
  }
}

run()
