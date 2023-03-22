import { Parcel } from "@parcel/core"
import path from "path"
import fs from "fs-extra"
import process from "process"
import WebSocket from "ws"
import { fileURLToPath } from "url"

const WS_PORT = "9992"

const __dirname = fileURLToPath(new URL(".", import.meta.url))
let distDir

function getDistDir({ debug = false }) {
  return debug ? "debug" : "build"
}

const entries = [
  // old - 0.0.3
  // "src/main.js",
  // "src/background.js",
  // new - 1.0.0
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
  })
  const sockets = []

  if (debug) {
    const server = new WebSocket.Server({ port: WS_PORT })
    server.on("connection", (ws) => {
      sockets.push(ws)
    })

    return bundler.watch((err, buildEvent) => {
      if (err) {
        throw err
      }

      switch (buildEvent.type) {
        case "buildSuccess":
          sockets.forEach((ws) => {
            ws.send(JSON.stringify({ message: "reload" }))
          })
          break
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
