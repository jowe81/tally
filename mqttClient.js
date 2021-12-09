//mqttClient.js: connect to broker and listen for messages

const mqtt = require("mqtt");

const { lg } = require("@jowe81/lg");
const logPrefix = "mqtt";

let client = undefined;

//Connect to broker server, subscribe to topic topic
const connect = (server, topic, messageHandler) => {

  return new Promise ((resolve, reject) => {
    lg(`Attempting to connect to ${server}...`, logPrefix);
    client = mqtt.connect(server);

    client.on('connect', () => {
      lg(`Connected to ${server}!`, logPrefix);  
  
      client.subscribe(topic, function (err) {
        if (!err) {
          lg(`Subscribed to ${topic}`, logPrefix);
          resolve();
        } else {
          reject();
        }
      })
  
    });
   
    //Invoke messageHandler() with incoming messages
    client.on('message', function (topic, message) {    
        messageHandler(topic, message);
    });    

    client.on('error',(e)=> {
      lg(`Error: ${e.message}`,logPrefix);
    });
  });

}

//Send message to broker
const publish = (topic, data) => {
  if (client !== undefined) {
    client.publish(topic, data);
  }
}

module.exports = { 
  connect, 
  publish
};
