const path = require('path');
const http = require("http");
const express = require('express');
const session = require('express-session');
const exphbs = require('express-handlebars');
const socketio = require("socket.io")
const routes = require('./controllers');
const helpers = require('./utils/helpers');
const formatMessage = require("./utils/messageFormat");
const getRandomWords = require('word-pictionary-list');

const sequelize = require('./config/connection');
const SequelizeStore = require('connect-session-sequelize')(session.Store);

const { User } = require("./models");

const app = express();
const PORT = process.env.PORT || 3001;
const server = http.createServer(app);
const io = socketio(server)

const hbs = exphbs.create({ helpers });

const sess = {
  secret: 'Super secret secret',
  cookie: {},
  resave: false,
  saveUninitialized: true,
  store: new SequelizeStore({
    db: sequelize
  })
};

app.use(session(sess));

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(routes);

// begin socket code

let drawerID
let players = []
let randomWord

io.on("connection", async socket => {
  const user_id = socket.handshake.query.user_id
  const user = await User.findByPk(user_id, {
    raw: true,
  })

  // push available socket IDs into empty players array
  players.push(socket.id)
  // Welcome current individual user only
  socket.emit("message", formatMessage("SYSTEM", `Welcome to the game, ${user.name}`))
  
  // broadcast on new connection to everyone except user that's connecting
  socket.broadcast.emit("message", formatMessage("SYSTEM", `${user.name} has joined the game`))
  
  // runs when user disconnects
  socket.on("disconnect", async () => {
    try {
      players = players.filter(player => player !== socket.id)
      // emits to everyone
      io.emit("message", formatMessage("SYSTEM", `${user.name} has left the game`))
    } catch(err) {
      console.error(err)
    }
  })

  function checkGuess(msg) {
    return msg.toLowerCase().trim() === randomWord
  }

  // listen for chat message
  socket.on("chat message", async (msg) => {
    // emit back to everyone on front end
    io.emit("message", formatMessage(user.name, msg))
    const correctGuess =  checkGuess(msg)
    if (correctGuess) {
      await User.increment({ wins:1 }, { where: {id: user_id } })
      io.emit("message", formatMessage("SYSTEM", `${user.name} guessed correctly!  The word was "${randomWord}"`))
    }
  })

  socket.on("requestStartGame", () => {
    randomWord = getRandomWords()
    // get a random index
    let randomIndex = Math.floor(Math.random() * players.length)
    // If there is currently only 1 player then they are assigned as drawer
    if (players.length === 1) {
      drawerID = players[0]
      // if there is more than 1 player then drawer is assigned randomly
    } else {
      drawerID = players[randomIndex]
    }
    // emit and broadcast startGame event
    io.emit("startGame", {drawerID, randomWord})
    randomWord = randomWord.toLowerCase().trim() // normalize random word
  })

  socket.on('drawing', (data) => socket.broadcast.emit('drawing', data));

  socket.on("requestClearCanvases", () => {
    io.emit("clearCanvases")
  })
});

sequelize.sync({ force: false }).then(() => {
  server.listen(PORT, () => console.log(`Now listening @ http://localhost:${PORT}`));
});
