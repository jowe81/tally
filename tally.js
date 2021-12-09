//tally.js: Manages MQTT/MPCT interactions and socket clients.
//- Most of the magich happens here!

const { lg } = require("@jowe81/lg");
const logPrefix = "tally";

const constants = require("./constants");

//Encapsulation of the MQTT connection
const mqttClient = require("./mqttClient");

//Mdule to handle live data
const live = require("./live");

//Module to handle MQTT messages
const mqttMessageHandlers = require("./mqttMessageHandlers"); 
mqttMessageHandlers.init(live); //Needs the live reference

//Gets called from server.js
//- Returns a promise that resolves on successful MQTT connection
//- Attaches message handlers for MQTT messages
//- Handles socket clients
//- Forwards data to socket clients as needed
const run = (io) => {

  //Send a snapshot of live data to the client 
  const sendSnapshot = (socket) => {
    lg(`Sending snapshot to ${socket.handshake.address}`, logPrefix);
    socket.emit("snapshot", live.getLiveData());
  };

  //Check if the topic in a received message has resulted from the subscripion to topicFromConstants
  const compareTopics = (topicFromConstants, topicFromBroker) => {
    const compareStr = topicFromConstants.substr(0,topicFromConstants.length - 1);
    return topicFromBroker.substr(0,compareStr.length) === compareStr;
  };

  //Extract the device name from the topic by returning the last part: mpct/update/DEVICE_NAME
  const getDeviceNameFromTopic = (topic) => {
    const mqttPath = topic.split('/');
    return mqttPath[mqttPath.length - 1];
  };

  //Check if this is a tally by comparing controller name and device ID on the controller
  const deviceNameIsTally = (deviceName) => {
    const deviceShortName = deviceName.split('.')[0]; //Tally0.switch -> Tally0
    const deviceNo = parseInt(deviceShortName.substr(constants.TALLY_CONTROLLER_NAME.length));    
    return live.deviceNoIsTallyLine(deviceNo);
  }
  

  return new Promise((resolve, reject) => {

    //Init the live data module (live.js)
    lg(`Initializing live data module...`, logPrefix);
    const registered = live.init(constants.CAMERAS, constants.TALLY_CONTROLLER_NAME);
    lg(`Registered ${registered.sources} cameras/sources on ${registered.lines} tally lines`, logPrefix);

    io.on("connect", (socket) => { 
      //Prompt MPCT server to re-broadcast time when new client connects
      lg(`Requesting reference time from MPCT`, logPrefix);
      mqttClient.publish(constants.MQTT_NAMESPACE + "command/server",JSON.stringify({data: "getTime"}));

      //Send snapshot of live data to each new client
      sendSnapshot(socket);

      //Client requesting a snapshot of live data 
      socket.on("snapshot", () => sendSnapshot(socket));    
    });    

    //Interpret incoming MQTT message and register tally change
    const messageHandler = (topic, message) => {      
      //Attempt JSON parsing
      try {
        msg = JSON.parse(message.toString());
      } catch (e) {
        lg(`Error: couldn't JSON.parse incoming message: ${message}`, logPrefix);
      }
      if (compareTopics(constants.MQTT_NAMESPACE + constants.MQTT_TOPICS.DEVICE_UPDATES, topic)) {
        //topic is mpct/update
        const updatedDeviceName = getDeviceNameFromTopic(topic);
        if (updatedDeviceName === constants.DEFAULT_TIMER) {
          //Received an update from a timer set on the master timer
          mqttMessageHandlers.handleTimerUpdate(io, topic, msg);
        } else if (deviceNameIsTally(updatedDeviceName)) {
          //Received an update from a tally line
          mqttMessageHandlers.handleTallyUpdate(io, topic, msg);
        }
      } else if (compareTopics(constants.MQTT_NAMESPACE + constants.MQTT_TOPICS.COMMANDS, topic)) {
        //topic is mpct/command/controllers
        mqttMessageHandlers.handleRefTimeUpdate(io, topic, msg);
      }
    };

    //Connect to broker and start to listen to MQTT messages (promise always resolves)
    mqttClient.connect(
      constants.MQTT_BROKER, [
        constants.MQTT_NAMESPACE + constants.MQTT_TOPICS.DEVICE_UPDATES,
        constants.MQTT_NAMESPACE + constants.MQTT_TOPICS.COMMANDS, 
      ],
      messageHandler).then(() => {
        resolve();
        //On successful connection, ask controllers to send full updates (to poll tally data from tally mpct controller)
        lg(`Requesting full update from controllers`,logPrefix);
        mqttClient.publish(constants.MQTT_NAMESPACE + constants.MQTT_TOPICS.COMMANDS, `{"data":{"publishFullStatus":{"forceHardwareRead":false}}}`);
      });    
  });

};

module.exports = {
  run
}