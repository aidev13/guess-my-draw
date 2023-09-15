const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");
const chatSendButton = document.getElementById("chatSendButton")
const startButton = document.getElementById("startButton");
const canvasContainer = document.getElementById("canvasContainer");
const clearButton = document.getElementById("clearButton");


const socket = io();

let isDrawer;

// listener to catch incomming socket messages from the server
socket.on("message", message => {
  console.log(message)
  outputMessage(message)
});

socket.on("startGame", ({ drawerID, randomWord }) => {
  console.log(drawerID, socket.id)
  startButton.classList.add("d-none")
  canvasContainer.classList.remove("d-none")
  isDrawer = drawerID === socket.id
  // select all drawingTools
    // loop through drawingTools
      // for each
        // add d-none

})

// event listener for chat form input and button
chatForm.addEventListener("submit", (event) => {
  event.preventDefault()
  // get message text
  const msg = chatInput.value
  // emit message to server
  socket.emit("chat message", msg)
});


startButton.addEventListener("click", (event) => {
  socket.emit("requestStartGame")
})

clearButton.addEventListener("click", () => {
  socket.emit("requestClearCanvases")
})

socket.on("clearCanvases", clearArea)

// Output message to DOM
function outputMessage(message) {
  const div = document.createElement("div")
}

function clearArea() {
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
}











// When true, moving the mouse draws on the canvas
let isDrawing = false;
let x = 0;
let y = 0;

const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');

// event.offsetX, event.offsetY gives the (x,y) offset from the edge of the canvas.

// Add the event listeners for mousedown, mousemove, and mouseup
canvas.addEventListener('mousedown', (e) => {
  if (isDrawer) {
    x = e.offsetX;
    y = e.offsetY;
    isDrawing = true;
  }
});

canvas.addEventListener('mousemove', (e) => {
  if (isDrawer && isDrawing) {
    let color = document.getElementById('selColor').value;
    let lineWidth = document.getElementById('selWidth').value
    drawLine(context, x, y, e.offsetX, e.offsetY, color, lineWidth);
    x = e.offsetX;
    y = e.offsetY;
  }
});

canvas.addEventListener('mouseup', (e) => {
  if (isDrawer && isDrawing) {
    let color = document.getElementById('selColor').value;
    let lineWidth = document.getElementById('selWidth').value;
    drawLine(context, x, y, e.offsetX, e.offsetY, color, lineWidth);
    x = 0;
    y = 0;
    isDrawing = false;
  }
});

function drawLine(context, x1, y1, x2, y2, color, lineWidth) {
  context.beginPath();
  context.strokeStyle = color
  context.lineWidth = lineWidth
  context.lineJoin = "round";
  // starting position
  context.moveTo(x1, y1);
  // end position
  context.lineTo(x2, y2);
  // closes line gaps in brush strokes
  context.closePath();
  // finally draws line
  context.stroke();

  if (isDrawer) {
    socket.emit('drawing', {
      x1,
      y1,
      x2,
      y2,
      color,
      lineWidth
    });
  }
}

socket.on("drawing", (drawingData) => {
  drawLine(context,
    drawingData.x1, 
    drawingData.y1, 
    drawingData.x2,
    drawingData.y2,
    drawingData.color,
    drawingData.lineWidth)
})
