//referenceClock.js

const referenceClock = (elementSelector, updateInterval = 100) => {

  //Reference time offset from local clock in ms
  let _offset = undefined;

  //Selector for clock on page
  let _elementSelector = elementSelector;

  //Clock element contents from previous interval check
  let _lastText; 

  //Call this when new reference time comes in via the socket connection
  const updateOffset = (refTs) => {
    _offset = refTs ? refTs - (new Date()).getTime() : 0;
  }

  //Return HH:MM:SS
  const getTimeString = () => {
    if (_offset !== undefined) {
      //Generate new Date object from offset
      const now = new Date(Date.now()+_offset);
      //Format HH:MM:SS
      const twoDigits = (n) => n < 10 ? `0${n}` : n;
      const h = twoDigits(now.getHours());
      const m = twoDigits(now.getMinutes());
      const s = twoDigits(now.getSeconds());
      return `${h}:${m}:${s}`;
    }
    return `Waiting...`;
  }

  //Update text only in case time changed
  const updateElementText = () => {
    const newText = getTimeString();
    if (_lastText !== newText) {
      $(_elementSelector).html(newText);
    }
  }

  //Set offset initially;
  //updateOffset();

  setInterval(updateElementText, updateInterval)

  return {
    getTimeString,
    updateOffset,
  };
  
}
