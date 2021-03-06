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

//Show or hide timer (and show/hide connection status accordingly)
const showTimer = (remaining, colorClass) => {
  if (remaining !== false) {
    $("#status").hide();
    $("#timer .sb-text").html(getRemainingTimeStr(remaining));
    $("#timer").removeClass(["timer-green", "timer-orange", "timer-red"]).addClass(colorClass).show();
  } else {
    $("#status").show();
    $("#timer .sb-text").html('');
    $("#timer").hide();
  }
}

//Update tally data in the dashboard
const paintTallyChangeDashboard = (cam) => {
  //Get preview, program or empty string
  const tallyType = getTallyType(cam);

  //-- Remove all classes first
  $(`#db_${cam.id}`).removeClass(['db_program','db_preview','db_selected_program','db_selected_preview','db_','db_selected_']);
    
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
};

//Update tally data in the main section
const paintTallyChangeMain = (cam) => {
  //Get preview, program or empty string
  const tallyType = getTallyType(cam);
  $(`#tl_${cam.id}`).removeClass(['tl_program','tl_preview','tl_']).addClass(`tl_${tallyType}`);  
};

//Update Tally data in both, the dashboard and main tally area
const paintTallyChange = (cam) => {
  paintTallyChangeDashboard(cam);
  paintTallyChangeMain(cam);
}

//Draw the UI
const initUI = (camData) => {
  $("#dashboard").empty();
  $("#tallies").empty();
  showInstructions(myTallies.length ? false : true);  
  //Paint dashboard sources
  for (cam of camData) {
    //Show all sources in the dashboard
    $("#dashboard").append(`<div id="db_${cam.id}" class="db-item"><div class="">${cam.name}<div></div>`);
    //Apply data
    paintTallyChangeDashboard(cam);
  }
  //Paint main tally board sources in the order they have been added to the board
  for (tallySourceID of myTallies) {
    //Grab the camera object
    let cam = camData.filter((camObj) =>  camObj.id === tallySourceID )[0];
    let camLabel = cam.name;
    //Add the word "cam" if name is just a number
    if (parseInt(camLabel) > 0) camLabel = `CAM ${cam.name}`;
    //Show myTallies in main tally area
    if (myTallies.includes(cam.id)){      
      $("#tallies").append(`<div id="tl_${cam.id}" class="tl-item"><div class="tl_cam-name">${camLabel}<div></div>`);
      $(`#db_${cam.id}`).addClass('db-item-active');
    }
    //Apply data
    paintTallyChangeMain(cam);
  }
}

//Update status bar
socket.on("connect", () => {
  $("#connection").html("Online");
});

socket.on("disconnect", () => {
  $("#connection").html("Offline");
  showTimer(false); //Make sure status bar shows, in case timer was up before
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

//Listen for timer updates
socket.on("timer", (data) => {
  if (data && data.data && data.data.remaining !== undefined) {
    //Determine color: 1 indicator (ind:1) -> orange
    let colorClass = "timer-red";
    if (data.data.ind > 1) {
      colorClass = "timer-green";
    } else if (data.data.ind === 1) {
      colorClass = "timer-orange";
    }
    //Show or hide timer based on whether remaining time === false (or a number)
    showTimer(data.data.remaining, colorClass);
  } 
})

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