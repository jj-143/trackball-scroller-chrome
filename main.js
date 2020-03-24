
const state = {
  scrolling: false
};

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
  var y = - e.movementY;
  scrollTarget.scrollBy(0, y)
  // elmt.scroll(elmt.scrollX, y);
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
  console.log('handleClick')
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
      if (e.button == 1) {
        const path = e.composedPath()
        anchor = path.find(elm => elm.tagName == 'A')

        if (anchor && anchor.href) {
            return
        }

        console.log(path)

        scrollTarget = document.documentElement

        for(var i=0; i<path.length - 2;i++) {
          var p = path[i]
          if (getComputedStyle(p).overflowY == 'auto'
            || getComputedStyle(p).overflowY == 'scroll') {
            scrollTarget = p
            break
          }
        }

        state.scrolling = true;
        activateScrollMode();
      }
    }
    displayConsole();
}

function attachFeature() {
  window.addEventListener("mousedown", handleClick, true);
}

attachFeature();

scrollTarget = document.documentElement

var debug = true
debug = false

if (debug) {
  var button = document.createElement("button")
  button.innerText = "btn"

  button.addEventListener('click', e => {
    alert("hello")
  })

  document.body.appendChild(button)

  loadDocument();
  displayConsole();

}
