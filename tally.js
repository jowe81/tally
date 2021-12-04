const { lg } = require("@jowe81/lg");
const logPrefix = "tally";

const constants = require("./constants");
const mqttClient = require("./mqttClient");



//*************** INIT ***********************************

const live = require("./lib/live");
lg(`Initializing live data...`, logPrefix);
const registered = live.init(constants.CAMERAS, constants.TALLY_CONTROLLER_NAME);
lg(`Registered ${registered.sources} cameras/sources on ${registered.lines} tally lines`, logPrefix);
//live.logLiveData();

//*************** RUN ************************************

//Gets called from server.js
// tallChangeCb(cameraObject) will be called on changes
const run = (tallyChangeCb) => {



  //Interpret incoming message and register tally change
  const messageHandler = (topic, message) => {
    const msgStr = message.toString();
    try {
      msg = JSON.parse(message.toString());
    } catch (e) {
      lg(`Error: couldn't JSON.parse incoming message: ${message}`, logPrefix);
    }
    //Message should look like this:
    //  {"data":{"status":{"value":false,"raw":1,"readMode":"interrupt","readAt":1638574812001}},"error":false}
    if (msg && msg.data && msg.data.status) {
      const cam = live.processTallyChange(topic, msg.data.status.value);
      if (cam) {
        tallyChangeCb(cam);
      }
    }
  };

  //Connect to broker and start to listen to MQTT messages
  mqttClient.connect(constants.MQTT_SERVER, constants.TOPIC, messageHandler, true);

};

module.exports = {
  run
}