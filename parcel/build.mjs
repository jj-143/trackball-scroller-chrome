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
  .filter((filename) => fs.existsSync(filename))

function getDistDir() {
  const isProduction = process.env.NODE_ENV === "production"
  return isProduction ? "build" : "debug"
}

async function clean() {
  await fs.remove(path.join(__dirname, "..", getDistDir()))
  if (process.env.NODE_ENV !== "production") {
    await fs.remove(path.join(__dirname, "..", "debug-serve"))
  }
}

function build({ mode }) {
  const distDir = getDistDir()
  const extensionBundler = new Parcel({
    entries: ["src/manifest.json"],
    defaultConfig: "@parcel/config-webextension",
    mode: process.env.NODE_ENV || "development",
    defaultTargetOptions: {
      distDir,
    },
  })

  console.info("[*] distDir:", distDir)

  if (mode === "production") {
    extensionBundler.run()
    return
  }

  // Serving dev pages for HMR (without loading in a browser).
  // Mixing both entries using one bundler gives unnecessary error messages
  // due to unable to HMR on browser extension with MV3
  const devEntriesBundler = new Parcel({
    entries: [
      "src/options/options.html",
      // to prevent single entry of options:
      // parcel outputs single entry on root and removes options/ folder
      "src/inject.ts",
      ...(mode === "all" ? testEntries : []),
    ],
    defaultTargetOptions: {
      distDir: "debug-serve",
    },
    defaultConfig: "@parcel/config-default",
    mode: "development",
    // config
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

  console.info("[*] Server running.")
  console.info("- Options: http://localhost:3000/options/options.html")
  if (mode === "all") {
    console.info("- Test Pages")
    testEntries.forEach((entry) => {
      const url = entry.match(/^src\/(.+)\/index.html$/)[1]
      console.info(`  - http://localhost:3000/${url}`)
    })
  }

  // run dev server
  extensionBundler.watch(errorHandler)
  devEntriesBundler.watch(errorHandler)
}

function errorHandler(err, buildEvent) {
  if (err) throw err
  switch (buildEvent.type) {
    case "buildFailure":
      console.error(buildEvent.diagnostics)
      break
  }
}

function run() {
  const mode = process.argv[2]
  process.env.NODE_ENV ||= mode === "production" ? "production" : "development"

  console.info("[*] NODE_ENV:", process.env.NODE_ENV)
  clean().then(() => build({ mode }))
}

run()
