const constants = {
  
  //Broker address with protocol (mqtt://...)
  "MQTT_SERVER": "mqtt://192.168.1.153",
 
  //Subscribe to...
  "TOPIC": "mpct/update/#",
 
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
        { deviceNo: 9 },
        { deviceNo: 10,
          type: "PVW"},
      ]
    },
    {      
      name: 6,               
      description: "POV",
      tallies: [
        { deviceNo: 11 },
        { deviceNo: 12,
          type: "PVW"},
      ]
    },
    {      
      name: "PrP Broadcast",             
      description: "",
      tallies: [
        { deviceNo: 13 },
        { deviceNo: 14,
          type: "PVW"},
      ]
    },
    {      
      name: "PrP Main",               
      description: "",
      tallies: [ { deviceNo: 15 } ],
    },
    {      
      name: "PrP Keyed",               
      description: "",
      tallies: [ { deviceNo: 16 } ],
    },

  ]
 
}

module.exports = constants;