const path = require('path');
const http = require("http");
const express = require('express');
const session = require('express-session');
const exphbs = require('express-handlebars');
const socketio = require("socket.io")
const routes = require('./controllers');
const helpers = require('./utils/helpers');

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

let drawerID
let players = []
io.on("connection", socket => {
  players.push(socket.id)

  // Welcome current individual user only
  socket.emit("message", `Welcome to the game ${socket.id}`)

  // broadcast on new connection to everyone except user that's connecting
  socket.broadcast.emit("message", `${socket.id} has joined the game`)

  socket.on("requestStartGame", () => {
    // choose random player from players[] as drawer
    let randomIndex = Math.floor(Math.random() * players.length)
    // assign into drawerID variable
    drawerID = players[randomIndex]
    // emit and broadcast startGame event
    io.emit("startGame", {drawerID, randomWord: "test"})
  })

  socket.on('drawing', (data) => socket.broadcast.emit('drawing', data));

  socket.on("requestClearCanvases", () => {
    io.emit("clearCanvases")
  })

  // runs when user disconnects
  socket.on("disconnect", () => {
    players = players.filter(player => player.id !== socket.id)
    // emits to everyone
    io.emit("message", `${socket.id} has left the game`)
  })

  // listen for chat message
  socket.on("chat message", (msg) => {
    // emit back to everyone on front end
    io.emit("message", msg)
  })
});

sequelize.sync({ force: false }).then(() => {
  server.listen(PORT, () => console.log(`Now listening @ http://localhost:${PORT}`));
});
