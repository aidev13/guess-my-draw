module.exports = {
  get_emoji: () => {
    const randomNum = Math.random();
    let book = "📗";

    if (randomNum > 0.7) {
      book = "📘";
    } else if (randomNum > 0.4) {
      book = "📙";
    }

    return `<span for="img" aria-label="book">${book}</span>`;
  },

  outputMessage: () => {
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
  },

  outputActiveUsers: () => {
    const li = document.createElement("li")
    li.setAttribute("id", user.id)
    li.classList.add("list-group-item", "badge", "text-bg-info", "my-1")
    li.textContent = `${user.name}`
    userListEl.appendChild(li)
  },
};
