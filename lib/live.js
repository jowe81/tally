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
// },

const _getData = () => _data.live;

const logLiveData = () => {
  _getData().forEach(x => console.log(x));
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
    _getData().push(thisRecord);
  }
  return { sources: _getData().length, lines: linesCount };
}

  //Extract camera object from live data by MPCT controller device #
  const getCameraFromDevNo = (devNo) => {
    for (cam of _getData()) {
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
    const getTallyServerDevNo = deviceName.substr(_data.tallyControllerName.length);
    return parseInt(getTallyServerDevNo);
  }

  //Register a tally change in the live object
  const processTallyChange = (topic, value, tallyChangeCb) => {
    //Extract device number from topic
    const tallyServerDevNo = getTallyServerDevNo(topic);
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
        //Return the camera with the change
        return cam;
      }  
    } else {
      //Got data for a camera/device that's not configured in constants.js
    }
  }


module.exports = {
  init,
  logLiveData,
  processTallyChange,
}