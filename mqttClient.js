const mqtt = require("mqtt");

const { lg } = require("@jowe81/lg");
const logPrefix = "mqtt";

//Connect to broker server, subscribe to topic topic
const connect = (server, topic, messageHandler) => {
  lg(`Attempting to connect to ${server}...`, logPrefix);
  const client = mqtt.connect(server);

  client.on('connect', () => {
    lg(`Connected to ${server}!`, logPrefix);  

    client.subscribe(topic, function (err) {
      if (!err) {
        lg(`Subscribed to ${topic}`, logPrefix);
      }
    })

  });
 
  //Invoke messageHandler() with incoming messages
  client.on('message', function (topic, message) {    
      messageHandler(topic, message);
  });

  return client;
}

module.exports = { connect };
