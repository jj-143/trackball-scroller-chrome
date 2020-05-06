// html script

var storageSetting

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

// return setting object to display text e.g "Ctrl + Alt + Mouse 1"
function activationToText(activation) {
  return activation.modifiers.concat(activation.input.text).join(" + ")
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

    // collect pressed modifiers
    for (mod of modifiers) {
      if (e.getModifierState(mod)) {
        combos.push(mod)
      }
    }

    // collect pressed key OR mouse
    var input
    if (e.type == "keydown") {
      input = {
        key: e.key,
        text: e.key.toUpperCase(),
        type: "keydown",
      }
    } else {
      // combos.push("Mouse " + (parseInt(e.button) + 1))
      // input = e.key.toUpperCase()
      input = {
        key: e.button,
        text: "Mouse " + (parseInt(e.button) + 1),
        type: "mouse",
      }
    }

    // set global activation
    activation = {
      modifiers: combos,
      input,
    }

    document.getElementById("activation").innerText = activationToText(
      activation
    )

    setValue("activation", activation)

    checkMouse3Warning()
    return stopCustomInput()
  }
}

function makeTestArticles() {
  const context = document.getElementById("test-context")

  for (var i = 0; i < 60; i++) {
    var h = document.createElement("h2")
    var p = document.createElement("p")

    h.innerText = "Article " + (i + 1)
    p.innerText =
      "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Adipisci, cumque? Ea facilis velit accusantium error sapiente doloribus iure qui suscipit sunt, itaque non veniam ex harum assumenda praesentium magnam. Perferendis?"
    context.appendChild(h)
    context.appendChild(p)
  }
}

// END - html script

function loadSetting() {
  chrome.storage.sync.get("setting", ({ setting }) => {
    storageSetting = setting

    // activation
    document.getElementById("activation").innerText = activationToText(
      setting.activation
    )

    // non-activation
    setting.nonActivation.forEach((key) => {
      document.querySelector(
        "#non-activation input[name=" + key + "]"
      ).checked = true
    })

    // sensitivity
    document.getElementById("sensitivity-value").innerText =
      setting.sensitivityStep

    // options
    for (key in setting) {
      if (setting[key].type === "options") {
        document.querySelector(
          "input[type=checkbox][name=" + key + "]"
        ).checked = setting[key].value
      }
    }

    checkMouse3Warning()
  })
}

function setValue(key, value, cb) {
  // only set value, change ext's setting is up to caller to this.

  storageSetting = {
    ...storageSetting,
    [key]: value,
  }

  chrome.storage.sync.set({ setting: storageSetting }, cb)
}

// multiple values
function setValueObject(obj, cb) {
  storageSetting = {
    ...storageSetting,
    ...obj,
  }

  chrome.storage.sync.set({ setting: storageSetting }, cb)
}

function attachEvents() {
  // non-activation
  document
    .querySelectorAll("#non-activation input[type=checkbox]")
    .forEach((elm) => {
      elm.addEventListener("change", (e) => {
        const newValue = Array.from(
          document.querySelectorAll(
            "#non-activation input[type=checkbox]:checked"
          )
        ).map((checked) => checked.name)
        setValue("nonActivation", newValue)
      })
    })

  // options
  document.querySelectorAll(".checkbox input[type=checkbox]").forEach((elm) => {
    elm.addEventListener("change", (e) => {
      const key = elm.name
      const value = elm.checked
      setValue(key, {
        type: "options",
        value,
      })
    })
  })

  document.querySelectorAll("#option-sensitivity > button").forEach((elm) => {
    elm.addEventListener("click", (e) => {
      console.log(storageSetting)
      // TODO: make value to be integer "steps" and interpret with multiplier .5 when applying

      var newSStep =
        parseFloat(storageSetting.sensitivityStep) + parseInt(elm.value)

      var newSValue =
        newSStep <= 10
          ? newSStep * 0.1
          : newSStep < 15
          ? 1 + (newSStep - 10) * 0.1
          : 1.5 + (newSStep - 15) * 0.3

      if (newSStep >= 1 && newSStep <= 20) {
        setValueObject(
          {
            sensitivityValue: newSValue,
            sensitivityStep: newSStep,
          },
          () => {
            const s = storageSetting.sensitivityStep
            document.getElementById("sensitivity-value").innerText = s
          }
        )
      }
    })
  })

  // custom input button event
  document.getElementById("activation").addEventListener("click", (e) => {
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
  var activation = storageSetting.activation

  if (
    activation.modifiers.length == 0 &&
    activation.input.type == "mouse" &&
    activation.input.key == 2
  ) {
    document.getElementById("warning-mouse3").classList.remove("hidden")
  } else {
    document.getElementById("warning-mouse3").classList.add("hidden")
  }
}

makeTestArticles()

loadSetting()
attachEvents()
