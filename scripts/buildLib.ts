import fs from "node:fs"
import path from "node:path"
import type { RollupWatcher, RollupWatcherEvent } from "rollup"
import { build as viteBuild, createServer, defineConfig } from "vite"
import tsconfigPaths from "vite-tsconfig-paths"

export type Entry = {
  /** Used for bundle file names */
  name: string

  /** Entry point, under `Config.srcDir` */
  path: string

  /** Only built on `Config.isDev = true` */
  isDevEntry?: boolean
}

export type EntryGroup = {
  /** `Config.srcDir` unless specified */
  root?: string

  entries: Entry[]
}

export type Config = {
  isDev: boolean
  isWatch: boolean
  srcDir: string
  outDir: string

  /** Dev server port */
  port: number

  /** Inlined if single entry or chunked if multiple */
  entryGroups: EntryGroup[]
}

export async function startWatch(config: Config) {
  fs.rmSync(config.outDir, { recursive: true, force: true })
  await startWatchEntries(config)
  await startDevServer(config)
}

export async function startBuild(config: Config) {
  fs.rmSync(config.outDir, { recursive: true, force: true })

  for (const group of config.entryGroups) {
    const names = group.entries.map((it) => it.name).join(", ")
    const inline = group.entries.length === 1

    console.info(`\n-------------- [${names}] --------------`)

    await build(group, config, inline)
  }
}

function build(group: EntryGroup, config: Config, inline: boolean) {
  type ViteInput = {
    [name: string]: string
  }

  const input: ViteInput = group.entries.reduce((result, entry) => {
    result[entry.name] = path.join(config.srcDir, entry.path)
    return result
  }, {} as ViteInput)

  const viteConfig = defineConfig({
    root: group.root ?? config.srcDir,
    mode: config.isDev ? "development" : "production",
    build: {
      watch: config.isWatch ? {} : null,
      outDir: config.outDir,
      emptyOutDir: false,
      minify: false,
      reportCompressedSize: !config.isDev,
      cssCodeSplit: true,
      cssMinify: true,
      rollupOptions: {
        input,
        output: {
          inlineDynamicImports: inline,
          entryFileNames: `[name]/[name].bundle.js`,
          chunkFileNames: `chunks/[name].chunk.js`,
          assetFileNames: `[name]/[name][extname]`,
        },
      },
    },
    plugins: [tsconfigPaths()],
  })

  return viteBuild(viteConfig)
}

/**
 * This starts building entries on watch mode, gathers initial build results,
 * and reports initial build result.
 *
 * Entries will be built separately for individual report.
 *
 * Entries will be inlined for simplicity.
 *   - NOTE: content scripts cannot be chunked without some setup
 */
async function startWatchEntries(config: Config) {
  type WatchEntryResult = [Entry, success: boolean]

  const singleEntryGroups = config.entryGroups.flatMap<EntryGroup>((group) =>
    group.entries.map<EntryGroup>((entry) => ({
      entries: [entry],
      root: group.root ?? config.srcDir,
    }))
  )

  const promises = singleEntryGroups.map(
    (group) =>
      new Promise<WatchEntryResult>(async (resolvePromise) => {
        const watcher = (await build(
          group,
          config,
          true // inline everything for watch
        )) as RollupWatcher

        const catchBundleSuccess = (evt: RollupWatcherEvent) => {
          if (evt.code === "BUNDLE_END") {
            resolvePromise([group.entries[0], true])
            watcher.off("event", catchBundleSuccess)
          } else if (evt.code === "ERROR") {
            resolvePromise([group.entries[0], false])
            watcher.off("event", catchBundleSuccess)
          }
        }

        watcher.on("event", catchBundleSuccess)
      })
  )

  /* Report initial bundle results */
  function reportResult([entry, success]: WatchEntryResult) {
    console.info(` - [${entry.name}]`.padEnd(32), success ? "✅" : "❌")
  }

  const allEntries = await Promise.all(promises)
  const appEntries = allEntries.filter(([e]) => !e.isDevEntry)
  const devEntries = allEntries.filter(([e]) => e.isDevEntry)

  console.info("\n----------------------------------------\n")
  console.info("[*] App Bundle")
  appEntries.forEach(reportResult)

  if (devEntries.length) {
    console.info("\n[*] Dev Entries")
    devEntries.forEach(reportResult)
  }
}

async function startDevServer(config: Config) {
  console.info("\n[*] Start dev server")

  const server = await createServer({
    configFile: false,
    clearScreen: false,
    root: config.outDir,
    server: {
      port: config.port,
    },
  })

  await server.listen()

  /* Print URLs */
  console.info("Local: ")

  config.entryGroups.forEach((group) => {
    group.entries
      .filter(({ path }) => path.endsWith(".html"))
      .forEach(({ path: srcPath }) => {
        // Entries are built with `root=EntryGroup.root` in viteBuild()
        const realpath = path.join(config.srcDir, srcPath)
        const relpath = path.relative(group.root ?? config.srcDir, realpath)
        console.info(` - ${server.resolvedUrls?.local[0]}${relpath}`)
      })
  })
}
