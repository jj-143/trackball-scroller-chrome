const Bundler = require("parcel-bundler")
const Path = require("path")
const fs = require("fs-extra")

const outDir = "build"
const entryFiles = [
  "src/main.js",
  "src/background.js",
  "src/options/options.html",
]

const statics = ["src/manifest.json", "src/images"]

const options = {
  outDir: outDir,
  sourceMaps: false,
  watch: false,
}

function clean() {
  return fs.remove(Path.join(__dirname, "..", outDir))
}

function build({ watch = false }) {
  const entries = entryFiles.map((f) => Path.join(__dirname, "..", f))
  const bundler = new Bundler(entries, { ...options, watch: true })
  if (watch) {
    bundler.on("buildEnd", () => {
      //TODO: [reload code here].
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

  if (args.includes("--watch")) {
    clean()
      .then(() => build({ watch: true }))
      .then(copyStatic)
  } else {
    clean().then(build).then(copyStatic)
  }
}

run()
