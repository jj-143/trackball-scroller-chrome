const state = {
  scrolling: false
};

const eConsole = document.getElementById("console");

function loadDocument() {
  for (var i = 0; i < 80; i++) {
    var header = document.createElement("h1");
    header.innerText = "header #" + i;

    header.style = "text-align: center; margin-bottom: 4em;";
    document.body.appendChild(header);
  }
}

function displayConsole() {
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

function handleMouseMovement(e) {
  var y = window.scrollY + e.movementY;
  window.scroll(window.scrollX, y);
}

function activateScrollMode() {
  document.body.requestPointerLock();

  document.addEventListener("mousemove", handleMouseMovement, false);
}

function deActivateScrollMode() {
  document.removeEventListener("mousemove", handleMouseMovement, false);
  document.exitPointerLock();
}

document.addEventListener("mousedown", e => {
  // 0: left, 1: middle, 2: right

  if (state.scrolling) {
    state.scrolling = false;
    deActivateScrollMode();
  } else {
    if (e.button == 1) { // middle click
      state.scrolling = true;
      activateScrollMode();
    }
  }

  displayConsole();
});

loadDocument();
displayConsole();
