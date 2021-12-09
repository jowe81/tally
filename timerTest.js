//timerTest.js: Run this to test without an actual timerClock present
const mqttClient = require("./mqttClient");
const { lg } = require("@jowe81/lg");

//Make array of test updates
const ar = [];
let j;
for (let i = 12; i >= -2; i--) {
  j = Math.max(Math.ceil(i/3), 0);
  ar.push(`{"data":{"remaining":${i}, "ind":${j}}}`);
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