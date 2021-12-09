//tallyTest.js:
//Run this to generate fake tally lines, timers and a system clock, without a physical MPCT infrastructure.
//To run this test you only need an MQTT broker configured correctly in constants.js

const mqttClient = require("../mqttClient");
const constants = require("../constants");
const { lg } = require("@jowe81/lg");

//Something like mpct/update/ (cut the # from the constant)
const MQTTUpdatePath = constants.MQTT_NAMESPACE + constants.MQTT_TOPICS.DEVICE_UPDATES.substr(0, constants.MQTT_TOPICS.DEVICE_UPDATES.length - 1);
const MQTTCommandPath = constants.MQTT_NAMESPACE + constants.MQTT_TOPICS.COMMANDS;

//Make a looping timer
const getTimer = (changeCb) => {

  //Make array of timer updates
  const getArrayOfTimerUpdates = () => {
    const ar = [];
    let j;
    for (let i = 20; i >= -2; i--) {
      j = Math.max(Math.ceil(i/5), 0);
      ar.push(`{"data":{"remaining":${i}, "ind":${j}}}`);
    }
    ar.push(`{"data":{"remaining":false}}`);
    ar.push(`{"data":{"remaining":false}}`);
    return ar;  
  }

  const timerUpdates = getArrayOfTimerUpdates();
  let x = 0;

  //Start timer
  setInterval(() => {
    x++;
    x = x % timerUpdates.length; //Keep looping over the timerUpdates array
    changeCb(timerUpdates[x]);
  }, 1000);  

}

//Make randomly alternating tally line
const getTallyLine = (changeCb) => {
  let status = false;

  const changeStatus = () => { 
    status = !status;
    changeCb(status);
    setTimeout(changeStatus,2000 + Math.random() * 7000);
  }

  //Alter status randomly
  changeStatus();
};



//Connect to MQTT server
mqttClient.connect(constants.MQTT_BROKER,"#",(topic, data) => {
  //Print MQTT messages to console
  lg(`${topic}: ${data}`,"recve");
}).then(() => {

  //Start looping timer
  getTimer((timerUpdate) => {
    mqttClient.publish(`${MQTTUpdatePath}${constants.DEFAULT_TIMER}`, timerUpdate);
  });
  
  //Make Tallies that change randomly
  const tallies = [];
  for (let i = 0; i < 24; i++) {
    tallies.push(getTallyLine((status) => {
      mqttClient.publish(`${MQTTUpdatePath}${constants.TALLY_CONTROLLER_NAME}${i}.whatever`, `{"data":{"status":{"value":${status},"raw":1,"readMode":"interrupt","readAt":1639011158125}},"error":false}`);
    }));
  }

  //Send a fake system time after a couple seconds
  setTimeout(() => {
    mqttClient.publish(MQTTCommandPath, `{"data":{"setTime":{"hours":"1","minutes":"31","seconds":"49","year":"2021","month":"11","day":"9","ts":"1639013509559"}}}`);
  }, 5000);

})