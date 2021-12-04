const mqtt = require("mqtt");

const { lg, prefix } = require("@jowe81/lg");
prefix.set("mqtt");

const connect = (server, topic, messageHandler) => {
  lg(`Attempting to connect to ${server}...`);
  const client = mqtt.connect(server);

  client.on('connect', () => {
    lg(`Connected to ${server}!`);  

    client.subscribe(topic, function (err) {
      if (!err) {
        lg(`Subscribed to ${topic}`);
      }
    })

  });
  
  client.on('message', function (topic, message) {    
      messageHandler(topic, message);
  });

  return client;
}

module.exports = { connect };
