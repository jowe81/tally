const constants = {
  
  //Broker address with protocol (mqtt://...)
  "MQTT_SERVER": "mqtt://192.168.1.153",
 
  //Subscribe to...
  "TOPIC": "mpct/update/#",
 
  //Name of MPCT controller that generates the Tally messages
  "TALLY_CONTROLLER_NAME": "Tally", 

  //Information for cameras to be listened for/reported
  // {
  //   tallyServerDevNo, //MPCT # on the Tally Server/MPCT controller
  //   no,               //Cam # as the director would call it out
  //   name,             //Full descriptive name
  // },

  "CAMERAS": [
    {
      tallyServerDevNo: 0, 
      no: 1,               
      name: "tight follow"
    },
    {
      tallyServerDevNo: 1,
      no: 2,
      name: "wide follow",
    },
    {
      tallyServerDevNo: 2,
      no: 3,
      name: "PTZ rear",
    },
    {
      tallyServerDevNo: 3,
      no: 4,
      name: "PTZ stage",
    },
    {
      tallyServerDevNo: 4,
      no: 5,
      name: "Handheld",
    },
    {
      tallyServerDevNo: 5,
      no: 6,
      name: "GoPro/Extra",
    },
    {
      tallyServerDevNo: 6,
      name: "PrP Main",
    },
    {
      tallyServerDevNo: 7,
      name: "PrP Keyed",
    },


  ]
 
}

module.exports = constants;