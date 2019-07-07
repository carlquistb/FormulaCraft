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
  alert(data.items.length);

  for(var i = 0; i < data.items.length; i++){
    var column = document.createElement("div");
    column.classList.add("col-lg-4","col-md-6","col-sm-6");

    var card = document.createElement("div");
    card.classList.add("card","card-stats");
    column.appendChild(card);

    var cardHeader = document.createElement("div");
    cardHeader.classList.add("card-header");
    cardHeader.innerHTML = data.items[i].worldName;
    card.appendChild(cardHeader);
  }



}

})();
