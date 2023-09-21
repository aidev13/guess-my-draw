const userIdEl = document.getElementById("user_id");
const user_id = userIdEl.dataset.user_id
const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");
const chatSendButton = document.getElementById("chatSendButton")
const startButton = document.getElementById("startButton");
const canvasContainer = document.getElementById("canvasContainer");
const drawingTools = document.getElementsByClassName("drawingTools");
const clearButton = document.getElementById("clearButton");
const messageArea = document.getElementById("messageArea");
const userListEl = document.getElementById("userList")
const drawerAlertField = document.getElementById('drawerAlertField');
const timer = document.getElementById('timer')
const socket = io.connect(`${window.location.origin}?user_id=${user_id}`);

let isDrawer;

// displays connected users in chat sidebar when logged in
socket.on("activePlayers", players => {
  userListEl.innerHTML = ""
  for (const player of players) {
    const li = document.createElement("li")
    li.setAttribute("id", player.id)
    li.classList.add("list-group-item", "badge", "text-bg-info", "my-1", "mx-1")
    li.textContent = `${player.name}`
    userListEl.appendChild(li)
  }
});

// removes users from chat sidebar when they disconnect
socket.on("userLeft", user => {
  document.getElementById(user.id)?.remove()
});

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

// event listener for start button
startButton.addEventListener("click", (event) => {
  socket.emit("requestStartGame")
});

// event listener for clear canvas button
clearButton.addEventListener("click", () => {
  socket.emit("requestClearCanvases")
});

// socket listener for clearing canvas event
socket.on("clearCanvases", clearArea);

// socket listener for startGame event
socket.on("startGame", ({ drawerID, randomWord }) => {
  // hides start button and shows canvas
  startButton.classList.add("d-none")
  canvasContainer.classList.remove("d-none")
  // resizes canvas for responsiveness
  setCanvasSize()
  
  isDrawer = drawerID === socket.id
  if (isDrawer) {
    drawerAlertField.innerText = `You are the drawer!  Draw: ${randomWord}`
    // loop through drawingTools
      for (const drawingTool of drawingTools) {
        // remove hidden class from each
          drawingTool.classList.remove("d-none")
  }
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
  div.classList.add("chatMessage", "card", message.colorClass, "bg-gradient", "bg-opacity-50", "my-2")
  div.innerHTML = `
  <div class="card-header text-dark bg-gradient">
  ${message.username}, ${message.time}
  </div>
  <div class="card-body meta text-dark">
  <p class="card-text chatText text-dark">${message.text}</p>
  </div>`
  messageArea.appendChild(div)
};




// begin drawing code

// When true, moving the mouse draws on the canvas
let isDrawing = false;
let x = 0;
let y = 0;

const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');

// Listens for resize event and calls setCanvasSize function
window.addEventListener('resize', setCanvasSize, false);

// helper function to remove "px" from size values below
function pxToNum(pxValue) {
  return parseFloat(pxValue.replace("px", ""))
};

// Function to set canvas dimensions dynamically
function setCanvasSize() {
  const parentStyles = window.getComputedStyle(canvas.parentElement)
  // Get the pixel width and height of the canvas's container
  const containerWidth = pxToNum(parentStyles.getPropertyValue("width"))
  const containerHeight = pxToNum(parentStyles.getPropertyValue("height"))

  // Set canvas dimensions to match the container size
  canvas.width = containerWidth;
  canvas.height = containerHeight;
};

// event listeners to track the mouseButton state if they're outside the bounds of the canvas
let isMouseButtonDown = false;
document.addEventListener('mousedown', () => {
  isMouseButtonDown = true
});

document.addEventListener('mouseup', () => {
  isMouseButtonDown = false
});

// event listener for drawing dots without moving cursor
// event.offsetX, event.offsetY gives the (x,y) offset from the edge of the canvas
canvas.addEventListener('click', (e) => {
  if (isDrawer) {
    let color = document.getElementById('selColor').value
    let lineWidth = document.getElementById('selWidth').value
    drawDot(context, e.offsetX, e.offsetY, color, lineWidth)
  }
});

// Add the event listeners for mousedown, mousemove, and mouseup
canvas.addEventListener('mousedown', (e) => {
  if (isDrawer) {
    x = e.offsetX;
    y = e.offsetY;
    isDrawing = true;
  }
});

canvas.addEventListener('mousemove', (e) => {
  if (isDrawer && isDrawing && isMouseButtonDown) {
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

// function for drawing lines while moving cursor
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
  
  // if you're the drawer, send drawing data over sockets
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
};

// function for drawing dots without moving cursor
function drawDot(context, x, y, color, lineWidth) {
  context.beginPath()
  context.fillStyle = color
  // Adjust the radius based on half of the lineWidth
  context.arc(x, y, lineWidth / 2, 0, Math.PI * 2)
  context.fill()

  // if you're the drawer, send drawing data over sockets
  if (isDrawer) {
    socket.emit('drawing', {
      x1: x,
      y1: y,
      x2: x,
      y2: y,
      color,
      lineWidth
    });
  }
};

// function to clear canvas
function clearArea() {
  context.setTransform(1, 0, 0, 1, 0, 0);
  context.clearRect(0, 0, context.canvas.width, context.canvas.height);
};

// socket listener to recieve drawing data
socket.on("drawing", (drawingData) => {
  drawLine(context,
  drawingData.x1, 
  drawingData.y1, 
  drawingData.x2,
  drawingData.y2,
  drawingData.color,
  drawingData.lineWidth)
});

socket.on( 'timer', (countDown) => {
  countDown
  timer.textContent = 'Time Left:' + countDown;
})