const PORT = "9992"

function connect() {
  const socket = new WebSocket(`ws://localhost:${PORT}`)
  socket.onmessage = (e) => {
    const { message } = JSON.parse(e.data)
    if (message === "reload") {
      chrome.runtime.reload()
    }
  }
}

module.exports = {
  connect,
}
