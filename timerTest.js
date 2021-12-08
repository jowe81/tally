//timerTest.js: Run this to test without an actual timerClock present
const mqttClient = require("./mqttClient");
const { lg } = require("@jowe81/lg");

//Make array of test updates
const ar = [];
for (let i = 10; i >= -5; i--) {
  ar.push(`{"data":{"remaining":${i}}}`);
}
ar.push(`{"data":{"remaining":false}}`);
ar.push(`{"data":{"remaining":false}}`);

let x = 0;

mqttClient.connect("mqtt://192.168.1.194","#",(topic, data) => {
  lg(`${topic}: ${data}`,"recve");
}).then(() => {
  setInterval(() => {
    mqttClient.publish("mpct/update/ESPA0.clockTimer", ar[x])
    x++;
    x = x % ar.length;
  },1000);
  //mqttClient.publish("mpct/update/ESPA0.clockTimer", `{"data":{"remeaining":34}}`);
})