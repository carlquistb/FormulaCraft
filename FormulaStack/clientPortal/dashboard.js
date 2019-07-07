(function() {

const API_URL = "https://lt175p2wc6.execute-api.us-west-2.amazonaws.com/v0-1";

//set onclick functions.
$("#refresh-worlds").click(refreshWorlds);


function refreshWorlds() {

  //obtain new worlds data.
  var url = API_URL + "/worlds";
  var urlParams = "limit=5"

  fetch(
    url+'?'+urlParams,
    {
      mode: "cors",
      headers: {
        'Access-Control-Allow-Origin':'*'
      }
    }
  )
  .then(function(data){
    if(!(data.status >= 200 && data.status < 300)){
      alert("server responded with " + data.status);
    }
    injectWorlds(data);
  });
}

function injectWorlds(data) {
  var row = $("#worlds-cards-row");
  alert(data);
}

})();
