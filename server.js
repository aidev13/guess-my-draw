const path = require('path');
const http = require("http");
const express = require('express');
const session = require('express-session');
const exphbs = require('express-handlebars');
const socketio = require("socket.io")
const routes = require('./controllers');
const helpers = require('./utils/helpers');
const formatMessage = require("./utils/messageFormat");

const sequelize = require('./config/connection');
const SequelizeStore = require('connect-session-sequelize')(session.Store);

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


let username = "username"
let drawerID
let players = []

io.on("connection", socket => {
  // push available socket IDs into empty players array
  players.push(socket.id)
  console.log("players array:", players)
  // Welcome current individual user only
  socket.emit("message", formatMessage("SYSTEM", `Welcome to the game, ${socket.id}`))
  
  // broadcast on new connection to everyone except user that's connecting
  socket.broadcast.emit("message", formatMessage(username, `${socket.id} has joined the game`))
  
  // runs when user disconnects
  socket.on("disconnect", () => {
    players = players.filter(player => player.id !== socket.id)
    // emits to everyone
    io.emit("message", formatMessage("SYSTEM", `${socket.id} has left the game`))
  })

  // listen for chat message
  socket.on("chat message", (msg) => {
    // emit back to everyone on front end
    io.emit("message", formatMessage("USER", msg))
  })

  socket.on("requestStartGame", () => {
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
    io.emit("startGame", {drawerID, randomWord: "test"})
  })

  socket.on('drawing', (data) => socket.broadcast.emit('drawing', data));

  socket.on("requestClearCanvases", () => {
    io.emit("clearCanvases")
  })


});

sequelize.sync({ force: false }).then(() => {
  server.listen(PORT, () => console.log(`Now listening @ http://localhost:${PORT}`));
});
