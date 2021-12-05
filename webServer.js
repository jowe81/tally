//webServer.js: spins up a webserver with a socket server, exposes io object via getIO()

const constants = require("./constants");
const { lg } = require("@jowe81/lg");
const logPrefix = "web";

const express = require("express");
const app = express();
app.set("view engine", "ejs");

//Socket server init
const { Server } = require("socket.io");
const http = require("http");
const server = http.createServer(app);
const _io = new Server(server);

//Serve static files
app.use(express.static('public'));

//Load route definitions
const routes = require('./routes');
app.use(routes);

//Expose io object (tally module needs it to broadcast changes)
const getIO = () => _io;

//Return promise that resolves once server is listening
const run = () => {
  return new Promise((resolve, reject) => {
    server.listen(constants.PORT, () => {    
      lg(`Web server/socket.io now listening on port ${constants.PORT}`, logPrefix);
      resolve();
    });
  });  
}

module.exports = {
  getIO,
  run,
};