const constants = {
  
  //Port for Express
  "PORT": 32801,

  //Broker address with protocol (mqtt://...)
  "MQTT_BROKER": "mqtt://192.168.1.194",
 
  "MQTT_NAMESPACE": "mpct/", //Namespace of the MPCT system

  //Subscribe to... (below the namespace)
  "MQTT_TOPICS": {
    DEVICE_UPDATES: "update/#",            //Device updates
    REFERENCE_TIME: "command/controllers", //Reference time from MPCT server
  },
 
  //Name of MPCT controller that generates the Tally messages
  "TALLY_CONTROLLER_NAME": "Tally", 

  //Information for cameras to be listened for/reported
  "CAMERAS": [
    {      
      name: 1,               
      description: "tight follow",
      tallies: [
        { deviceNo: 0,
          type: "PGM" },
        { deviceNo: 1,
          type: "PVW"},
      ]
    },
    {      
      name: 2,               
      description: "wide follow",
      tallies: [
        { deviceNo: 2 },
        { deviceNo: 3,
          type: "PVW"},
      ]
    },
    {      
      name: 3,               
      description: "PTZ house",
      tallies: [
        { deviceNo: 4 },
        { deviceNo: 5,
          type: "PVW"},
      ]
    },
    {      
      name: 4,               
      description: "PTZ stage",
      tallies: [
        { deviceNo: 6 },
        { deviceNo: 7,
          type: "PVW"},
      ]
    },
    {      
      name: 5,               
      description: "Handheld",
      tallies: [
        { deviceNo: 8 },
        { deviceNo: 9,
          type: "PVW"},
      ]
    },
    {      
      name: 6,               
      description: "POV",
      tallies: [
        { deviceNo: 10 },
        { deviceNo: 11,
          type: "PVW"},
      ]
    },
    {      
      name: "PrP Broadcast",             
      description: "",
      tallies: [
        { deviceNo: 12 },
        { deviceNo: 13,
          type: "PVW"},
      ]
    },
    {      
      name: "PrP Main",               
      description: "",
      tallies: [ { deviceNo: 14 } ],
    },
    {      
      name: "PrP Keyed",               
      description: "",
      tallies: [ { deviceNo: 15 } ],
    },
    {      
      name: 7,               
      description: "extra",
      tallies: [
        { deviceNo: 16,
          type: "PGM" },
        { deviceNo: 17,
          type: "PVW"},
      ]
    },
  ]
 
}

module.exports = constants;