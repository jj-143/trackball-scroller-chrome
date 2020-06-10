// html script

var storageSetting

const modifiers = ["Control", "Alt", "Shift", "Meta"]

function preventDefault(e) {
  e.preventDefault()
}

function stopContextMenu() {
  addEventListener("contextmenu", preventDefault, true)
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

function stopCustomInput(isCancel = false) {
  if (isCancel) {
    btnActivation.innerText = activationToText(storageSetting.activation)
  }

  // reset from combo input mode
  document.removeEventListener("pointerlockchange", handleCancelPointerLock)
  document.exitPointerLock()

  setTimeout(() => {
    removeEventListener("contextmenu", preventDefault, true)
  }, 500)

  removeEventListener("keydown", listenComboInput, true)
  removeEventListener("mousedown", listenComboInput, true)

  btnActivation.disabled = false
  btnActivation.classList.remove("editing")
}

// return setting object to display text e.g "Ctrl + Alt + Mouse 1"
function activationToText(activation) {
  return activation.modifiers.concat(activation.input.text).join(" + ")
}

function listenComboInput(e) {
  e.preventDefault()
  e.stopPropagation()
  e.stopImmediatePropagation()

  // ignore only modifier
  if (e.type === "keydown" && modifiers.indexOf(e.key) != -1) return
  // ignore esc - handled by PointerLock (this function might already be canceled)
  if (e.key === "Escape") return

  var input

  if (e.type == "keydown") {
    input = {
      key: e.key,
      text: e.key.toUpperCase(),
      type: "keydown",
    }
  } else {
    input = {
      key: e.button,
      text: "Mouse " + (parseInt(e.button) + 1),
      type: "mouse",
    }
  }

  var modifiersPressed = modifiers.filter((m) => e.getModifierState(m))

  // set global activation
  var activation = {
    input,
    modifiers: modifiersPressed,
  }
  setValue("activation", activation)
  stopCustomInput()

  // update UI
  btnActivation.innerText = activationToText(activation)
  checkMouse3Warning()
}

// END - html script

function loadSetting() {
  chrome.storage.sync.get("setting", ({ setting }) => {
    storageSetting = setting

    // activation
    btnActivation.innerText = activationToText(setting.activation)

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

  document.querySelectorAll("#option-sensitivity button").forEach((elm) => {
    elm.addEventListener("click", (e) => {
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
  btnActivation.addEventListener("click", (e) => {
    btnActivation.disabled = true

    document.body.requestPointerLock()

    btnActivation.innerText = "hit combo"
    btnActivation.classList.add("editing")

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
    document.querySelector(".option#activation").classList.add("warning-mouse3")
  } else {
    document
      .querySelector(".option#activation")
      .classList.remove("warning-mouse3")
  }
}

const btnActivation = document.querySelector("button.activation")

makeTestArticles()

loadSetting()
attachEvents()
