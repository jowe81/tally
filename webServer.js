//webServer.js

const constants = require("./constants");
const { lg } = require("@jowe81/lg");
const logPrefix = "web";


const express = require("express");
const app = express();
app.set("view engine", "ejs");

//Load route definitions
const routes = require('./routes');
app.use(routes);

//Return promise that resolves once server is listening
const run = () => {
  return new Promise((resolve, reject) => {
    app.listen(constants.PORT, () => {    
      lg(`Web server is listening on port ${constants.PORT}`, logPrefix);
      resolve();
    });
  });  
}

//Expose app object
const getApp = () => app;


module.exports = {
  run,
  getApp,
};