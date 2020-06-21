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
  "src/main.js",
  "src/background.js",
  "src/options/options.html",
]

const statics = ["src/manifest.json", "src/images"]

const options = {
  sourceMaps: false,
  watch: false,
}

function clean() {
  return fs.remove(Path.join(__dirname, "..", outDir))
}

function build({ watch = false }) {
  const entries = entryFiles.map((f) => Path.join(__dirname, "..", f))
  const bundler = new Bundler(entries, { ...options, outDir, watch: watch })
  const sockets = []

  if (watch) {
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
    outDir = getOutDir({ debug: true })
    clean()
      .then(() => build({ watch: true }))
      .then(copyStatic)
  } else {
    outDir = getOutDir({ debug: false })
    clean().then(build).then(copyStatic)
  }
}

run()