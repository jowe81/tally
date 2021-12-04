const { lg } = require("@jowe81/lg");
const logPrefix = "tally";

const constants = require("./constants");
const mqttClient = require("./mqttClient");
const live = require("./lib/live"); //Data handling module

//Gets called from server.js
// tallyChangeCb(cameraObject) will be called on changes
const run = (tallyChangeCb) => {

  return new Promise((resolve, reject) => {

    //Init the live data module (live.js)
    lg(`Initializing live data module...`, logPrefix);
    const registered = live.init(constants.CAMERAS, constants.TALLY_CONTROLLER_NAME);
    lg(`Registered ${registered.sources} cameras/sources on ${registered.lines} tally lines`, logPrefix);

    //Interpret incoming message and register tally change
    const messageHandler = (topic, message) => {
      //Attempt JSON parsing
      try {
        msg = JSON.parse(message.toString());
      } catch (e) {
        lg(`Error: couldn't JSON.parse incoming message: ${message}`, logPrefix);
      }
      //Validate message and process change
      //Message should look like this:
      //  {"data":{"status":{"value":false,"raw":1,"readMode":"interrupt","readAt":1638574812001}},"error":false}
      if (msg && msg.data && msg.data.status) {
        //If an actual change was registered, we'll get the cam object back
        const cam = live.processTallyChange(topic, msg.data.status.value);
        if (cam) {
          tallyChangeCb(cam);
        }
      }
    };

    //Connect to broker and start to listen to MQTT messages
    mqttClient.connect(constants.MQTT_SERVER, constants.TOPIC, messageHandler).then(resolve);
  });

};

module.exports = {
  run
}