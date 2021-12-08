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
  if (show) {
    $("#tallies").html($("#instructions").html());
  }  
}

//Paint tally data
const paintTallyChange = (cam) => {

  //Get preview, program or empty string
  const tallyType = getTallyType(cam);

  //Tallies in the dashboard

  //-- Remove all classes first
  $(`#db_${cam.id}`).removeClass(['db_program','db_preview','db_selected_program','db_selected_preview']);
    
  //-- Apply tallyType class depending on whether or not this source is selected
  if (tallyType) {
    //Preview or program
    if (myTallies.includes(cam.id)) {
      $(`#db_${cam.id}`).addClass(`db_selected_${tallyType}`);
    } else {
      $(`#db_${cam.id}`).addClass(`db_${tallyType}`);
    }      
  } else {
    //Off air
    if (myTallies.includes(cam.id)) {
      $(`#db_${cam.id}`).addClass(`db_selected_`);
    }
  }

  //Tallies in the main section
  $(`#tl_${cam.id}`).removeClass(['tl_program','tl_preview']).addClass(`tl_${tallyType}`);  

}

//Draw the UI
const initUI = (camData) => {
  $("#dashboard").empty();
  $("#tallies").empty();
  showInstructions(myTallies.length ? false : true);  
  for (cam of camData) {
    let camLabel = cam.name;
    //Add the word "cam" if name is just a number
    if (parseInt(camLabel) > 0) camLabel = `CAM ${cam.name}`;
    //Show all sources in the dashboard
    $("#dashboard").append(`<div id="db_${cam.id}" class="db-item"><div class="">${cam.name}<div></div>`);
    //Show only myTallies in main tally area
    if (myTallies.includes(cam.id)){      
      $("#tallies").append(`<div id="tl_${cam.id}" class="tl-item"><div class="tl_cam-name">${camLabel}<div></div>`);
      $(`#db_${cam.id}`).addClass('db-item-active');
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

//Listen for reference time updates
socket.on("reftime", (data) => {
  if (data.data.setTime && data.data.setTime) {
    clock.updateOffset(data.data.setTime.ts);
  }
});

//Add/remove tally from tally board
const toggleTally = (sourceID) => {
  if (!isNaN(sourceID)) {
    myTallies.includes(sourceID) ? myTallies.splice(myTallies.indexOf(sourceID), 1) : myTallies.push(sourceID);
    //After changing the tallies, request a full snapshot and to reinit the UI
    socket.emit("snapshot");  
  }
}

//Listen for clicks/taps on the dashboard and tally section,
// and add/remove selected source from the tally board
$("#dashboard, #tallies").on('click', (e) => {
  //Depending on whether user clicked the div or the label, grab ID from target element or its parent
  const sourceID = parseInt((e.target.id || $(e.target).parent().attr('id')).substr(3)); //ID looks like: tl_n 
  toggleTally(sourceID);
});

//Initialize clock
const clock = referenceClock("#reftime");