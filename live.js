//live.js: Handle live tally data

const { lg } = require("@jowe81/lg");
const logPrefix = "live";

//Support tally types Program and Preview
const PGM = "PGM", PVW = "PVW";
const TALLY_TYPES = [ PGM, PVW ];

const _data = { live: [], tallyControllerName: undefined };

//Keep tally data of this form in _data.live[]:
// {      
//   name: 1,                     //As the director calls it
//   description: "tight follow", //Camera description
//   tallies: [                   //Can have one or two tallies (PGM/PVW)
//     { deviceNo: 0,             //Device # on MPCT Controller for this tally
//       type: "PGM" },           //If type is missing, we default to PGM
//     { deviceNo: 1,             //Device # on MPCT Controller for this tally
//       type: "PVW"},
//   ]
//   id:                          //Assign a unique ID for client UI
// },

//Return live camera data (this function for encapsulation purposes)
const _getLiveData = () => _data.live;

//Extract camera object from live data by MPCT controller device #
const _getCameraFromDevNo = (devNo) => {
  for (cam of _getLiveData()) {
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
const _getTallyRecordFromDevNo = (devNo) => {
  //Find the camera first
  const cam = _getCameraFromDevNo(devNo);
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
const _getTallyServerDevNo = (topic) => {
  const path = topic.split('/');
  const fullDeviceName = path[path.length - 1]; //Tally1.tally
  const deviceName = fullDeviceName.split('.')[0]; //Tally1
  const _getTallyServerDevNo = deviceName.substr(_data.tallyControllerName.length);
  return parseInt(_getTallyServerDevNo);
}



//Generate the live object with camera data from constants.js
const init = (cameras, tallyControllerName) => {
  let linesCount = 0; //Count the number of tally lines being used
  _data.tallyControllerName = tallyControllerName;
  for (const cam of cameras) {
    const thisRecord = cam;
    for (const tally of thisRecord.tallies) {
      if (!TALLY_TYPES.includes(tally.type)) {
        tally.type = PGM; //default to program
      }
      linesCount++;
    }
    thisRecord.id = linesCount; //Anything unique...
    _getLiveData().push(thisRecord);
  }
  return { sources: _getLiveData().length, lines: linesCount };
}

//Register a tally change in the live object
const processTallyChange = (topic, value, tallyChangeCb) => {
  //Extract device number from topic
  const tallyServerDevNo = _getTallyServerDevNo(topic);
  //Get the camera object from live data
  const cam = _getCameraFromDevNo(tallyServerDevNo);
  //Get the tally object from camera's live data (yes, need both!)
  const tallyRecord = _getTallyRecordFromDevNo(tallyServerDevNo);
  if (tallyRecord) {      
    const boolVal = !Boolean(value); //Invert the physical value 
    //Only update if value actually changed
    if (tallyRecord.on !== boolVal) {
      tallyRecord.on = boolVal;
      lg(`Camera ${cam.name} is now ${tallyRecord.on ? "on" : "off"} ${tallyRecord.type}`, logPrefix);
      //Return the camera with the change
      return cam;
    }  
  } else {
    //Got data for a camera/device that's not configured in constants.js
  }
}

//Check if a given MPCT device number is a valid tally line on the tally controller
const deviceNoIsTallyLine = (deviceNo) => {  
  return _getTallyRecordFromDevNo(deviceNo) !== undefined;
}

//For debugging: log the live data object to the console
const logLiveData = () => {
  _getLiveData().forEach(x => console.log(x));
}

module.exports = {
  init,
  processTallyChange,
  getLiveData: _getLiveData,
  deviceNoIsTallyLine,
  logLiveData,
}