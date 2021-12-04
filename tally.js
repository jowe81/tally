const { lg } = require("@jowe81/lg");
const logPrefix = "tally";

const constants = require("./constants");
const mqttClient = require("./mqttClient");

const PGM = "PGM", PVW = "PVW";
const TALLY_TYPES = [ PGM, PVW ];


//*************** INIT ***********************************

//Keep tally data of this form in global object "live":
// {      
//   name: 1,                     //As the director calls it
//   description: "tight follow", //Camera description
//   tallies: [                   //Can have one or two tallies (PGM/PVW)
//     { deviceNo: 0,             //Device # on MPCT Controller for this tally
//       type: "PGM" },           //If type is missing, we default to PGM
//     { deviceNo: 1,             //Device # on MPCT Controller for this tally
//       type: "PVW"},
//   ]
// },
const initLiveObject = (cameras) => {
  const liveObj = [];
  for (const cam of cameras) {
    const thisRecord = cam;
    for (const tally of thisRecord.tallies) {
      if (!TALLY_TYPES.includes(tally.type)) {
        tally.type = PGM; //default to program
      }
    }
    liveObj.push(thisRecord);
  }
  liveObj.forEach(x => console.log(x));
  return liveObj;
}

//Generate the live object with camera data from constants.js
const live = initLiveObject(constants.CAMERAS);



//*************** RUN ************************************

//Gets called from server.js
// tallChangeCb(cameraObject) will be called on changes
const run = (tallyChangeCb) => {

  //Extract camera object from live data by MPCT controller device #
  const getCameraFromDevNo = (devNo) => {
    for (cam of live) {
      for (const tallyRecord of cam.tallies) {
        if (tallyRecord.deviceNo == devNo) {
          return cam;
        }
      }
    }
    //No camera with a tally with devNo exists
    return undefined;
  }

  //Extract tally record from live camera object by MPCT controller device #
  const getTallyRecordFromDevNo = (devNo) => {
    //Find the camera first
    const cam = getCameraFromDevNo(devNo);
    if (cam) {
      //Found the camera, no see if it has a tally object with devNo
      for (record of cam.tallies) {
        if (record.deviceNo === devNo) {
          return record;
        }
      }
    }
    return undefined;
  }

  //Extract MPCT device # from the topic
  const getTallyServerDevNo = (topic) => {
    const path = topic.split('/');
    const fullDeviceName = path[path.length - 1]; //Tally1.tally
    const deviceName = fullDeviceName.split('.')[0]; //Tally1
    const getTallyServerDevNo = deviceName.substr(constants.TALLY_CONTROLLER_NAME.length);
    return parseInt(getTallyServerDevNo);
  }

  //Register a tally change in the live object
  const processTallyChange = (tallyServerDevNo, value) => {
    //Get the camera object from live data
    const cam = getCameraFromDevNo(tallyServerDevNo);
    //Get the tally object from camera's live data (yes, need both!)
    const tallyRecord = getTallyRecordFromDevNo(tallyServerDevNo);
    if (tallyRecord) {      
      const boolVal = Boolean(value);
      //Only update if value actually changed
      if (tallyRecord.on !== boolVal) {
        tallyRecord.on = boolVal;
        lg(`Camera ${cam.name} is now ${tallyRecord.on ? "on" : "off"} ${tallyRecord.type}`, logPrefix);
        //Invoke the callback with the respective camera object
        tallyChangeCb(cam);
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