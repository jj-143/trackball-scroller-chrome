const Bundler = require("parcel-bundler")
const Path = require("path")
const fs = require("fs-extra")
const WebSocket = require("ws")

const WS_PORT = "9992"
var outDir

function getOutDir({ debug = false }) {
  return debug ? "debug" : "build"
}

const entryFiles = [
  // old - 0.0.3
  // "src/main.js",
  // "src/background.js",
  // new - 1.0.0
  "src/background/index.ts",
  "src/inject.ts",
  "src/options/options.html",
]

const statics = ["src/manifest.json", "src/images"]

const options = {
  sourceMaps: false,
  watch: false,
  contentHash: false,
  minify: false,
}

function clean() {
  return fs.remove(Path.join(__dirname, "..", outDir))
}

function build({ debug } = { debug: false }) {
  const entries = entryFiles.map((f) => Path.join(__dirname, "..", f))
  const bundler = new Bundler(entries, {
    ...options,
    outDir,
    watch: debug,
    minify: debug,
  })
  const sockets = []

  if (debug) {
    const server = new WebSocket.Server({ port: WS_PORT })
    server.on("connection", (ws) => {
      sockets.push(ws)
    })

    bundler.on("buildEnd", () => {
      sockets.forEach((ws) => {
        ws.send(JSON.stringify({ message: "reload" }))
      })
    })
  }
  return bundler.bundle()
}

function copyStatic() {
  const files = statics.map((f) => Path.join(__dirname, "..", f))

  for (const file of files) {
    fs.copy(file, Path.join(__dirname, "..", outDir, Path.basename(file)))
  }
}

function run() {
  const args = process.argv.slice(2)

  if (args.includes("--debug")) {
    process.env.NODE_ENV = "development"
    outDir = getOutDir({ debug: true })
    clean()
      .then(() => build({ debug: true }))
      .then(copyStatic)
  } else {
    outDir = getOutDir({ debug: false })
    clean().then(build).then(copyStatic)
  }
}

run()
