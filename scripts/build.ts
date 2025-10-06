import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { startBuild, startWatch, type Config, type Entry } from "./buildLib"

function main() {
  const __dirname = path.dirname(fileURLToPath(import.meta.url))
  const projectRoot = path.join(__dirname, "..")

  const isDev = process.argv.some((arg) => arg.includes("--dev"))
  const isWatch = process.argv.some((arg) => arg.includes("--watch"))
  const useDevEntries = isDev && isWatch

  const srcDir = path.join(projectRoot, "src")
  const outDir = path.join(projectRoot, isDev ? "debug" : "build")
  const uiRoot = path.join(projectRoot, "src/ui")

  const config: Config = {
    isDev: isDev,
    isWatch: isWatch,
    srcDir: srcDir,
    outDir: outDir,
    port: 3000,

    entryGroups: [
      {
        entries: [
          {
            name: "inject",
            path: "inject.ts",
          },
        ],
      },
      {
        root: uiRoot,
        entries: [
          {
            name: "options",
            path: "ui/options/index.html",
          },
          {
            name: "background",
            path: "background/index.ts",
          },
        ],
      },
    ],
  }

  if (useDevEntries) {
    config.entryGroups.push({
      entries: getTestEntries(srcDir, "test-pages"),
    })
  }

  process.env.NODE_ENV = isDev ? "development" : "production"

  if (isWatch) {
    startWatch(config)
  } else {
    startBuild(config)
  }
}

/** {srcDir}/{testDir}/<Entry.name>/index.html */
function getTestEntries(srcDir: string, testDir: string): Entry[] {
  return fs
    .readdirSync(path.join(srcDir, testDir), { withFileTypes: true })
    .filter((dirEnt) => dirEnt.isDirectory())
    .map<Entry>(({ name: dirname }) => ({
      name: dirname,
      path: path.join(testDir, dirname, "index.html"),
      isDevEntry: true,
    }))
}

main()
