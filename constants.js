const constants = {
 "MQTT_SERVER": "mqtt://192.168.1.153",
 "TOPIC": "mpct/update/#",
 "TALLY_CONTROLLER_NAME": "Tally", //name of MPCT controller that generates the Tally messages

  "CAMERAS": [
    {
      tallyServerDevNo: 0, //MPCT # on the Tally Server/MPCT controller
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