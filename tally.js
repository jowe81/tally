const { lg } = require("@jowe81/lg");
const logPrefix = "tally";

const constants = require("./constants");
const mqttClient = require("./mqttClient");

const TALLY_TYPES = [ "PGM", "PVW" ];

//Keep tally data of this form:
// "cameraNo": {
//               tallyServerDevNo: 1,
//               no: 2,
//               name: "wide follow",
//             }

const initTallyObject = (cameras) => {
  const tally = {};
  for (cam of cameras) {
    tally[cam.tallyServerDevNo] = cam;
    //If a camera number is not provided, fall back to the name
    if (tally[cam.tallyServerDevNo].no === undefined) {
      tally[cam.tallyServerDevNo].no = tally[cam.tallyServerDevNo].name;
    }
    //If no type specified, default to PGM
    if (!TALLY_TYPES.includes(tally[cam.tallyServerDevNo].type)) {
      tally[cam.tallyServerDevNo].type=TALLY_TYPES[0];
    }
    //Init as off-air
    tally[cam.tallyServerDevNo].on = false;
  }  
  lg(`Initialized tally object with ${cameras.length} cameras`, logPrefix);
  console.log(tally);
  return tally;
}

//Generate the tally object with camera data from constants.js
const tally = initTallyObject(constants.CAMERAS);



//Gets called from server.js
// tallChangeCb(cameraObject) will be called on changes
const run = (tallyChangeCb) => {

  //Extract MPCT device # from the topic
  const getTallyServerDevNo = (topic) => {
    const path = topic.split('/');
    const fullDeviceName = path[path.length - 1]; //Tally1.tally
    const deviceName = fullDeviceName.split('.')[0]; //Tally1
    const getTallyServerDevNo = deviceName.substr(constants.TALLY_CONTROLLER_NAME.length);
    return getTallyServerDevNo;
  }

  //Register a change in the tally object
  const processTallyChange = (tallyServerDevNo, value) => {
    if (tally[tallyServerDevNo]) {
      const boolVal = Boolean(value);
      //Only update if value actually changed
      if (tally[tallyServerDevNo].on !== boolVal) {
        tally[tallyServerDevNo].on = boolVal;
        lg(`Camera ${tally[tallyServerDevNo].no} is now ${boolVal ? "on" : "off"} air`, logPrefix);
        //Invoke the callback with the respective camera object
        tallyChangeCb(tally[tallyServerDevNo]);
      }  
    } else {
      //Got data for a camera/device that's not configured in constants.js
    }
  }

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
      processTallyChange(getTallyServerDevNo(topic), msg.data.status.value)
    }
  };

  //Connect to broker and start to listen to MQTT messages
  mqttClient.connect(constants.MQTT_SERVER, constants.TOPIC, messageHandler, true);

};

module.exports = {
  run
}