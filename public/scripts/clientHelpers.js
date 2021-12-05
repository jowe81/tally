//Create object from current querystring
const getURLParams = () => {
  const params = {};
  const queryString = window.location.search.substring(1);
  const paramStrings = queryString.split('&');
  for (paramString of paramStrings) {
    name = paramString.split('=')[0];
    value = paramString.split('=')[1];
    params[name]=value;
  }
  return params;
}

//Extract selected tallies from querystring; return as array
const getMyTallies = () => {
  const URLParams = getURLParams();
  if (URLParams["t"]) {
    //Expecting camera IDs as follows: "1,2,3,4"
    const tallies = getURLParams()["t"].split(',')
    //Attempt to convert each element to an integer
    tallies.forEach((e, i, arr) => arr[i] = parseInt(e));    
    //Return those elements that are integers > 0
    return tallies.filter((e) => typeof e === 'number' && e > 0);
  }
  return [];
}
