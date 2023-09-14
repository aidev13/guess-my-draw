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

io.on("connection", socket => {
  // Welcome current individual user only
  socket.emit("message", "Welcome to the game")

  // broadcast on new connection to everyone except user that's connecting
  socket.broadcast.emit("message", "A user has joined the chat")

  // runs when user disconnects
  socket.on("disconnect", () => {
    // emits to everyone
    io.emit("message", "A user has left the chat")
  })
});

sequelize.sync({ force: false }).then(() => {
  server.listen(PORT, () => console.log(`Now listening @ http://localhost:${PORT}`));
});
