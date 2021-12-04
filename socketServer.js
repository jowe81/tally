//socketServer.js: start socket server on passed-in express app instance and expose io object (getIO())

const { lg } = require("@jowe81/lg");
const logPrefix = "sockets";

const { Server } = require("socket.io");
const http = require("http");

let _io;

const run = (app) => {
  return new Promise((resolve, reject) => {
    const server = http.createServer(app);
    _io = new Server(server);
    lg(`Socket server is listening`, logPrefix);
    resolve();
  });
}

const getIO = () => _io;

module.exports = { 
  run,
  getIO, 
};