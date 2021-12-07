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

//With no tallies selected, show instructions
const showInstructions = (show) => {
  console.log(show);
  if (show) {
    $("#tallies").html($("#instructions").html());
  }
  
}

//Paint tally data
const paintTallyChange = (cam) => {

  //Get preview, program or empty string
  const tallyType = getTallyType(cam);

  //Tallies in the dashboard
  $(`#db_${cam.id}`).removeClass(['db_program','db_preview']).addClass(`db_${tallyType}`);

  //Tallies in the main section
  $(`#tl_${cam.id}`).removeClass(['tl_program','tl_preview']).addClass(`tl_${tallyType}`);  

}

//Draw the UI
const initUI = (camData) => {
  $("#dashboard").empty();
  $("#tallies").empty();
  showInstructions(myTallies.length ? false : true);  
  for (cam of camData) {
    //Show all sources in the dashboard
    $("#dashboard").append(`<div id="db_${cam.id}" class="db-item"><div class="">${cam.name}<div></div>`);
    //Show only myTallies in main tally area
    if (myTallies.includes(cam.id)){
      $("#tallies").append(`<div id="tl_${cam.id}" class="tl-item"><div class="tl_cam-name">${cam.name}<div></div>`);
    }
    //Init the data
    paintTallyChange(cam);
  }
}

//Update status bar
socket.on("connect", () => {
  $("#connection").html("Online");
});

socket.on("disconnect", () => {
  $("#connection").html("Offline");
});

//After connecting, server sends a snapshot of all camera data
socket.on("snapshot", (camData) => {
  initUI(camData);
});

//Listen for tally events - data will be a cam object
socket.on("tally", (cam) => {
  paintTallyChange(cam);
});

//Listen for clicks/taps on the dashboard, and add selected tally to the main tally board
$("#dashboard").on('click', (e) => {
  const sourceID = parseInt(e.target.id.substr(3)); //ID looks like: db_n 
  if (!myTallies.includes(sourceID)) {
    //Selected tally isn't in the array yet - add it on
    myTallies.push(sourceID);
    //After adding a tally, request a full snapshot and to reinit the UI
    socket.emit("snapshot");
  }
});

//Listen for clicks/taps on the main tally board, and remove selected tally
$("#tallies").on('click', (e) => {
  const sourceID = parseInt(e.target.id.substr(3)); //ID looks like: tl_n 
  myTallies.splice(myTallies.indexOf(sourceID), 1);
  //After removing a tally, request a full snapshot and to reinit the UI
  socket.emit("snapshot");
});