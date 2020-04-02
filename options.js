// html script

const modifiers = ["Control", "Alt", "Shift", "Meta"]

function preventDefault(e) {
  e.preventDefault()
}

function stopContextMenu() {
  addEventListener("contextmenu", preventDefault, true)
}

function stopCustomInput(isCancel = false) {
  if (isCancel) {
    // TODO - show prev combo
    // config.default
    document.getElementById("activation").innertext = "Mouse 1"
  }

  // reset from combo input mode
  document.removeEventListener("pointerlockchange", handleCancelPointerLock)
  document.exitPointerLock()

  setTimeout(() => {
    removeEventListener("contextmenu", preventDefault, true)
  }, 500)

  removeEventListener("keydown", listenComboInput, true)
  removeEventListener("mousedown", listenComboInput, true)

  document.getElementById("activation").disabled = false
  document.getElementById("activation").classList.remove("editing")
}

function listenComboInput(e) {
  e.preventDefault()
  e.stopPropagation()
  e.stopImmediatePropagation()

  if (e.type == "keydown" && modifiers.indexOf(e.key) != -1) {
    // ignore only modifier
    return
  } else if (e.key != "Escape") {
    var combos = []

    for (mod of modifiers) {
      if (e.getModifierState(mod)) {
        combos.push(mod)
      }
    }

    if (e.type == "keydown") {
      combos.push(e.key.toUpperCase())
    } else {
      combos.push("Mouse " + (parseInt(e.button) + 1))
    }

    document.getElementById("activation").innerText = combos.join(" + ")
    checkMouse3Warning()
    return stopCustomInput()
  }
}

function makeTestArticles() {
  const context = document.getElementById("test-context")

  for (var i = 0; i < 30; i++) {
    var h = document.createElement("h2")
    var p = document.createElement("p")

    h.innerText = "Article " + (i + 1)
    p.innerText = `
      Lorem ipsum dolor sit amet consectetur adipisicing elit. Impedit
      corrupti accusantium sunt! Quam, a illo reprehenderit eveniet
      officiis minima, vitae molestias earum voluptatum repellendus
      nostrum tempore modi aliquam, praesentium magnam.`

    context.appendChild(h)
    context.appendChild(p)
  }
}

// END - html script

var storageSetting

function loadSetting() {
  chrome.storage.sync.get("setting", ({ setting }) => {
    storageSetting = setting

    console.log(setting)
    for (key in setting) {
      if (setting[key].type === "options") {
        document.querySelector(
          "input[type=checkbox][name=" + key + "]"
        ).checked = setting[key].value
      }
    }

    // document.getElementById("mbutton-activation").value =
    //   setting.buttonActivation
    // document.getElementById("scroll-direction").checked =
    //   setting.isNaturalScrolling
    // document.getElementById("key-activation").value = setting.keyActivation
    // document.getElementById("key-non-activation").value =
    //   setting.keyNonActivation
  })
}

function setValue(key, value) {
  // only set value, change ext's setting is up to caller to this.

  storageSetting = {
    ...storageSetting,
    [key]: value
  }

  chrome.storage.sync.set({ setting: storageSetting })
}

function attachEvents() {
  // replaced to custom input

  // document.getElementById("mbutton-activation").addEventListener('change', e => {
  //   const value = e.target.value
  //   setValue('buttonActivation', value)
  // })
  // document.getElementById("key-activation").addEventListener('change', e => {
  //   const value = e.target.value
  //   setValue('keyActivation', value)
  // })

  // TODO: change to "chips"
  // document
  //   .getElementById("key-non-activation")
  //   .addEventListener("change", e => {
  //     const value = e.target.value
  //     setValue("keyNonActivation", value)
  //   })

  // TODO: make programatical method
  // document.getElementById("scroll-direction").addEventListener("change", e => {
  //   const value = e.target.checked
  //   setValue("isNaturalScrolling", value)
  // })

  // programatic method
  document.querySelectorAll(".checkbox input[type=checkbox]").forEach(elm => {
    elm.addEventListener("change", e => {
      const key = elm.name
      const value = elm.checked
      setValue(key, {
        type: "options",
        value
      })
    })
  })

  // console.log("options - event attached")

  // NEW
  // custom input button event
  document.getElementById("activation").addEventListener("click", e => {
    document.getElementById("activation").disabled = true

    document.body.requestPointerLock()

    document.getElementById("activation").innerText = "hit combo"
    document.getElementById("activation").classList.add("editing")

    stopContextMenu()

    window.addEventListener("keydown", listenComboInput, true)
    addEventListener("mousedown", listenComboInput, true)

    // cancel custom input
    document.addEventListener("pointerlockchange", handleCancelPointerLock)
  })
}

function handleCancelPointerLock(e) {
  if (!document.pointerLockElement) {
    document.removeEventListener("pointerlockchange", handleCancelPointerLock)
    stopCustomInput(true)
  }
}

function checkMouse3Warning() {
  // TODO: if current activation == 'mouse3 only'
  // this will both affect when changed to this OR start in this (user set to this.)
  if (true) {
    document.getElementById("warning-mouse3").classList.remove("hidden")
  } else {
    document.getElementById("warning-mouse3").classList.add("hidden")
  }
}

makeTestArticles()

loadSetting()
attachEvents()
// checkMouse3Warning()
