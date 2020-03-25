
var initSetting = {
  init: true,

  // default Settings
  isNaturalScrolling: true,
  buttonActivation: 1,
  keyActivation: '',
  keyNonActivation: '',
};

var setting
var state = {
  scrolling: false
}

function loadSetting() {
  chrome.storage.sync.get('setting', ({ setting: storageSetting }) => {
    // if not set, sync set initial setting
    if (!storageSetting) {
      chrome.storage.sync.set(
        { setting: initSetting }, () => {
          setting = initSetting
        }
      )
    } else {
      setting = storageSetting

      // set new setting values
      var migration = false
      for (var key in initSetting) {
        if (!setting[key]) {
          setting[key] = initSetting[key]
          migration = true
        }
      }

      if (migration) {
        chrome.storage.sync.set(
          { setting }
        )
      }
    }

    chrome.storage.onChanged.addListener((changes, namespace) => {
      if (changes.setting) {
        setting = changes.setting.newValue
      }
    })
  })

}


const eConsole = document.getElementById("console");

function loadDocument() {
  for (var i = 0; i < 80; i++) {
    var post = document.createElement("div");
    var header = document.createElement("h1");

    var link = document.createElement("a");
    link.href = "/"+ i;
    link.innerText = "link";

    var linkDiv = document.createElement('div')
    linkDiv.style="border: 1px solid red;"
    linkDiv.innerText = "interesting post detail"
    link.appendChild(linkDiv)



    post.appendChild(header);
    post.appendChild(link);

    header.innerText = "header #" + i;

    post.style = "text-align: center; margin-bottom: 4em;";
    document.body.appendChild(post);
  }
}

function displayConsole() {
  if (!eConsole) return;

  eConsole.querySelectorAll("p").forEach(p => p.remove());

  for (k in state) {
    var p = document.createElement("p");
    var span = document.createElement("span");
    span.innerText = k + ": ";
    p.appendChild(span);

    span = document.createElement("span");
    span.innerText = state[k];
    p.appendChild(span);

    eConsole.appendChild(p);
  }
}

var scrollTarget = null

function handleMouseMovement(e) {
  // handle Escape cancelled pointer lock
  if (!document.pointerLockElement) {
    deActivateScrollMode()
    return
  }

  var y = e.movementY * (setting.isNaturalScrolling ? -1 : 1);
  scrollTarget.scrollBy(0, y)
}

function captureClick(e) {
  e.preventDefault()
  e.stopPropagation()
  window.removeEventListener('click', captureClick, true)
  deActivateScrollMode()
}

function activateScrollMode() {
  document.body.requestPointerLock();
  window.addEventListener("mousemove", handleMouseMovement, false);
}

function deActivateScrollMode() {
  window.removeEventListener("mousemove", handleMouseMovement, false);
  document.exitPointerLock();
}

function handleClick(e) {
    // 0: left, 1: middle, 2: right

    if (state.scrolling) {
      state.scrolling = false;
      if (e.button == 0) {
        window.addEventListener('click', captureClick, true)
        e.preventDefault()
        e.stopPropagation()
        return
      }
      deActivateScrollMode();
      return
    } else {
      console.log('button: ', e.button)
      if (e.button == setting.buttonActivation
        && (!setting.keyActivation || e[setting.keyActivation])
        && !(setting.keyNonActivation && e[setting.keyNonActivation])
        ) {
        const path = e.composedPath()
        anchor = path.find(elm => elm.tagName == 'A')

        if (anchor && anchor.href) {
            return
        }

        scrollTarget = document.documentElement

        for(var i=0; i<path.length - 2;i++) {
          var p = path[i]
          if (getComputedStyle(p).overflowY == 'auto'
            || getComputedStyle(p).overflowY == 'scroll') {

            if (p.tagName == 'BODY') {
              scrollTarget = document.documentElement
            } else {
              scrollTarget = p
            }
            break
          }
        }

        state.scrolling = true;
        activateScrollMode();
      }
    }
    displayConsole();
    return false
}

function attachFeature() {
  addEventListener("mousedown", handleClick, true);

  // TODO: only if set right button as activationButton
  addEventListener('contextmenu', e => {
    console.log('contextmenu event')

    if (state.scrolling) {
      e.preventDefault()
      return false
    }
  }, true)
}

attachFeature();

scrollTarget = document.documentElement

var debug = true
debug = false

if (debug) {
  console.log('[debug mode]')
  var button = document.createElement("button")
  button.innerText = "btn"

  button.addEventListener('click', e => {
    alert("hello")
  })

  document.body.appendChild(button)

  loadDocument();
  displayConsole();
}
console.log('main')

loadSetting()