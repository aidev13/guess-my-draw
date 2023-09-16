const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");
const chatSendButton = document.getElementById("chatSendButton")
const startButton = document.getElementById("startButton");
const canvasContainer = document.getElementById("canvasContainer");
const drawingTools = document.getElementsByClassName("drawingTools");
const clearButton = document.getElementById("clearButton");
const messageArea = document.getElementById("messageArea");
const drawerAlertField = document.getElementById('drawerAlertField');
const userIdEl = document.getElementById("user_id");
const user_id = userIdEl.dataset.user_id
let isDrawer;


const socket = io.connect(`${window.location.origin}?user_id=${user_id}`);

// event listener for chat form input and button
chatForm.addEventListener("submit", (event) => {
  event.preventDefault()
  // get message text
  let msg = chatInput.value
  // emit message to server
  socket.emit("chat message", msg)
  // clear input and re-focus on it after message is sent
  chatInput.value = ""
  chatInput.focus()
});

// listener to catch incomming socket messages from the server
socket.on("message", message => {
  // console.log(message)
  outputMessage(message)

  // scroll down chat window on new message
  messageArea.scrollTop = messageArea.scrollHeight
});

startButton.addEventListener("click", (event) => {
  socket.emit("requestStartGame")
});

clearButton.addEventListener("click", () => {
  socket.emit("requestClearCanvases")
});

socket.on("clearCanvases", clearArea);

socket.on("startGame", ({ drawerID, randomWord }) => {
  console.log("drawerID:", drawerID, "socket.id:", socket.id)
  startButton.classList.add("d-none")
  canvasContainer.classList.remove("d-none")
  isDrawer = drawerID === socket.id
  if (isDrawer) {
    drawerAlertField.innerText = `You are the drawer!  Draw: ${randomWord}`
  } else if(!isDrawer) {
    drawerAlertField.innerText = "You are guessing!"
    // loop through drawingTools
    for (const drawingTool of drawingTools) {
      // add hidden class to each
      drawingTool.classList.add("d-none")
    }
  }
});

// Output messages to DOM
function outputMessage(message) {
  const div = document.createElement("div")
  div.classList.add("chatMessage", "card", "bg-info", "bg-gradient", "bg-opacity-50", "my-2")
  div.innerHTML = `
  <div class="card-header text-dark bg-gradient">
  ${message.username}, ${message.time}
  </div>
  <div class="card-body meta text-dark">
  <p class="card-text chatText text-dark">${message.text}</p>
  </div>`
  messageArea.appendChild(div)
}

function clearArea() {
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
}






// begin drawing code


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
