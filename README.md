# tally
## A Software Tally System for Broadcast Switchers

* Use your phone or other browser-enabled device to add a tally light to your camera or CG source
* Supports tallying preview and program for each source
* Supports tallying multiple devices side by side
* Fully responsive, super simple to use touch interface
* Developed for use with [Ross Carbonite Ultra](https://www.rossvideo.com/products-services/acquisition-production/production-switchers/carbonite-ultra/) (via GPIO), but can be used with any switcher that has a tally interface, when paired with circuitry that can communicate the tally data to [Raspberry PI GPIO](https://projects.raspberrypi.org/en/projects/physical-computing/)
* Integrates with [MPCT  production time / automation system](https://www.youtube.com/watch?v=Wu7vsRnQCIk)

## Watch Demo Video:
[![Video Demo Thumbnail](./github/yt-thumb-for-github.jpg)](https://www.youtube.com/watch?v=30k-sjt_wY0)

## Dependencies
* [ejs](https://www.npmjs.com/package/ejs): ^3.1.6
* [express](https://www.npmjs.com/package/express): ^4.17.1
* [socket.io](https://www.npmjs.com/package/socket.io): ^4.4.0
* [@jowe81](https://www.npmjs.com/package/@jowe81/lg)/lg: ^1.0.0
* [mqtt](https://www.npmjs.com/package/mqtt): ^4.2.8
* Relies on an MPCT compatible MQTT feed (this dependency along with MQTT may be removed in a future version, to support standalone use)

## Changelog
* Version 1.0.1 (December 12, 2021)
  * Selected tallies will now show up in the order they were added to the tallyboard (sources will be added to the right of the board instead of inserted by camera id)
* Version 1.0.0 (December 9, 2021)
  * Initial release