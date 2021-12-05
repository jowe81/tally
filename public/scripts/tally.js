const socket = io();  

//Get array of camera IDs from querystring
const myTallies = getMyTallies();

//For CSS classname: return preview, program or ''
const getTallyType = (cam) => {
  let pgm = false, pvw = false;
  for (tally of cam.tallies) {
    if (tally.on && tally.type === "PVW") pvw = tally.type;
    if (tally.on && tally.type === "PGM") pgm = tally.type;
  }
  if (pgm) return "program";
  if (pvw) return "preview";
  return "";
}

//Draw the UI
const initUI = (camData) => {
  let tallyClass;
  for (cam of camData) {
    tallyClass = getTallyType(cam);
    //Show all sources in the dashboard
    $("#dashboard").append(`<div id="db_${cam.id}" class="db-item ${tallyClass}">${cam.name}</div>`);
    //Show only myTallies in main tally area
    if (myTallies.includes(cam.id)){
      $("#tallies").append(`<div id="tally_${cam.id}" class="tally-item ${tallyClass}">${cam.name}</div>`);
    }
  }
}

//Update the UI when a tally changes
const paintTallyChange = (cam) => {
  $(`#db_${cam.id}`).removeClass(['program','preview']).addClass(getTallyType(cam));
  $(`#tally_${cam.id}`).removeClass(['program','preview']).addClass(getTallyType(cam));
}

//After connecting, server sends a snapshot of all camera data
socket.on("snapshot", (camData) => {
  initUI(camData);
});

//Listen for tally events - data will be a cam object
socket.on("tally", (cam) => {
  paintTallyChange(cam);
});
