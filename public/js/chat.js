// const chatForm = getElementById("chatForm");
// const chatInput = getElementById("chatInput");
// const chatSendButton = getElementById("chatSendButton")

console.log(chatForm, chatInput, chatSendButton)

const socket = io();

// listener to catch incomming socket messages from the server
socket.on("message", message => {
  console.log(message)
});

// event listener for chat form input and button
chatForm.addEventListener("submit", (event) => {
  event.preventDefault()

  const msg = chatInput.value
  console.log(msg)
});