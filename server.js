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
let turnIndex = 0
let countDown = 60;
let intervalId;

io.on("connection", async socket => {
  const user_id = socket.handshake.query.user_id
  const user = await User.findByPk(user_id, {
    raw: true,
    // TODO: exclude password
  })
  const player = { ...user, socketId: socket.id }
  // push available socket IDs into empty players array
  players.push(player)
  // send players list to front end
  io.emit("activePlayers", players)
  // Welcome current individual user only
  socket.emit("message", formatMessage("SYSTEM", `Welcome to the game, ${user.name}`))

  // broadcast on new connection to everyone except user that's connecting
  socket.broadcast.emit("message", formatMessage("SYSTEM", `${user.name} has joined the game`))

  // runs when user disconnects
  socket.on("disconnect", () => {
    players = players.filter(player => player.socketId !== socket.id)
    // emits to everyone
    io.emit("message", formatMessage("SYSTEM", `${user.name} has left the game`))
    io.emit("userLeft", user)
    // if no connected players, stop interval
    if(players.length === 0) {
      clearInterval(intervalId)
    }
  })

  // function for checking messages against drawer's assigned word
  function checkGuess(msg) {
    return msg.toLowerCase().trim() === randomWord
  }

  // listen for chat message
  socket.on("chat message", async (msg) => {
    // emit back to everyone on front end
    io.emit("message", formatMessage(user.name, msg))
    // checking messages against drawer's assigned word
    const correctGuess = checkGuess(msg)
    if (correctGuess) {
      // increment wins of user who guessed correctly
      await User.increment({ wins: 1 }, { where: { id: user_id } })
      // system message confirming someone won
      io.emit("message", formatMessage("SYSTEM", `${user.name} guessed correctly!  The word was "${randomWord}"`, "bg-success"))
      // change turn and switch who is drawing
      turnIndex++
      startRound()
    }
  })

  const startRound = () => {
    randomWord = getRandomWords()
    //timer
    countDown = 60;
    clearInterval(intervalId)
    intervalId = setInterval(() => {
      countDown--;
      // when timer ends, round is lost
      if(countDown === 0) {
        // system message confirming round lost
        io.emit("message", formatMessage("SYSTEM", `Nobody guessed it! The word was "${randomWord}"`, "bg-danger"))
        // change turn and switch who is drawing
        turnIndex++
        startRound()
      } else {
        io.emit('timer', countDown)
      }
    }, 1000)

    //choosing drawer
    turnIndex = turnIndex % players.length
    drawerID = players[turnIndex].socketId

    // emit and broadcast startGame event
    io.emit("startGame", { drawerID, randomWord })
    randomWord = randomWord.toLowerCase().trim() // normalize random word
  }

  // socket listener waiting for start button press on front end
  socket.on("requestStartGame", startRound)

  // socket listener for drawing data
  socket.on('drawing', (data) => socket.broadcast.emit('drawing', data));

  // socket listener for clear canvas button
  socket.on("requestClearCanvases", () => {
    // sending clear canvas function to everyone's canvases
    io.emit("clearCanvases")
  })
});

sequelize.sync({ force: false }).then(() => {
  server.listen(PORT, () => console.log(`Now listening @ http://localhost:${PORT}`));
});
