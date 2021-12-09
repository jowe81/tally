//mqttMessageHandlers.js: Handle MPCT / MQTT messages

const { lg } = require("@jowe81/lg");
const constants = require("../constants");
const logPrefix = "tally";

let _live; //Reference to live object

//Accept reference to live object
const init = (live) => {
  _live = live;
}

//Device/Tally update: Validate message and process change
const handleTallyUpdate = (io, topic, msg) => {
  //Message should look like this:
  //  {"data":{"status":{"value":false,"raw":1,"readMode":"interrupt","readAt":1638574812001}},"error":false}
  if (msg && msg.data && msg.data.status) {
    //If an actual change was registered, we'll get the cam object back
    const cam = _live.processTallyChange(topic, msg.data.status.value);
    if (cam) {
      //Broadcast the cam object via the socket server
      io.emit("tally", cam);
    }
  }
}

//Time reference - forward to socket clients
const handleRefTimeUpdate = (io, topic, msg) => {
  if (msg && msg.data && msg.data.setTime && msg.data.setTime.ts) {
    lg(`Broadcasting reference time`, logPrefix);
    io.emit("reftime", msg);
  }
}

//Timer information - forward to socket clients
const handleTimerUpdate = (io, topic, msg) => {
  if (msg && msg.data && msg.data.remaining !== undefined) {
    io.emit("timer", msg);
  }
}


module.exports = {
  init,
  handleTallyUpdate,
  handleRefTimeUpdate,
  handleTimerUpdate,
}