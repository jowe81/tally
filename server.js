//server.js: Entry point for Tally App

const webServer = require('./webServer');
const tally = require('./tally');
const { lg } = require('@jowe81/lg');
const logPrefix = "server";

//Start services
lg(`Starting Tally App...`, logPrefix);
Promise.all([webServer.run(), tally.run(webServer.getIO())]).then(() => {
  lg(`All services are up and running`, logPrefix)
}).catch(() => {
  lg(`Error: Server failed to start.`, logPrefix);
});