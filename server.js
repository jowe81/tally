//server.js: Entry point for Tally App

const webServer = require('./webServer');
const socketServer = require('./socketServer');
const tally = require('./tally');
const { lg } = require('@jowe81/lg');
const logPrefix = "server";

//Broadcast the camera object on which the tally change occurred
const broadcastTallyChange = (camObj) => socketServer.getIO().emit(camObj);


lg(`Starting Tally App...`, logPrefix);

//Start services in order
webServer.run()
  .then(() => socketServer.run(webServer.getApp()))
  .then(() => tally.run(broadcastTallyChange) )
  .then(() => lg(`All services are up and running`, logPrefix));

