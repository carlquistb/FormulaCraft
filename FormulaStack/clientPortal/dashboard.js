(function() {

const API_URL = "https://lt175p2wc6.execute-api.us-west-2.amazonaws.com/v0-1";

//set onclick functions.
$("#refresh-worlds").click(refreshWorlds);
$("#refresh-flavors").click(refreshFlavors);
$("#refresh-stacks").click(refreshStacks);

//set onload function.
$(document).ready(function() {
  injectWorlds();
  injectFlavors();
  injectStacks();
});

//onclick listener.
//updates local cache for all data necessary for updating world display.
//injects objects for worlds not currently displayed.
function refreshWorlds() {
  iconClickLoading(this, function(){
    return fetchWorlds().then(fetchWorlds).then(injectWorlds);
  });
}

function refreshFlavors() {
  iconClickLoading(this, function() {
    return fetchFlavors().then(injectFlavors);
  });
}

function refreshStacks() {
  iconClickLoading(this, function() {
    return fetchStacks().then(injectStacks);
  });
}

// Encapsulate your click function in this to implement a
// "loading/rowing" icon while your function is active.
//
// ONLY for use with click listeners on material icons.
//toDo function needs to return a Promise.
function iconClickLoading(onclickThis, toDo) {
  let element = onclickThis;
  let original = element.innerHTML;
  element.innerHTML = "rowing";
  toDo().then(function() {
    element.innerHTML = original;
  });
}

//post a request to create a new stack.
//@param stackName: A distinct name for the stack you want to create.
//@param flavorS3Filepath: file path of the flavor you request to be ran.
//@param worldS3Filepath: file path of the world you request to be ran.
//@param instanceType: (String) instance type you request to be ran.

function deleteStack(stackName) {
  let url = API_URL + "/stacks";
  let urlParams = "stackName=" + stackName;

  return fetch(
    url + "?" + urlParams,
    {
      //fetch object
      method: "DELETE",
      mode: "cors",
      headers: {
        "Access-Control-Allow-Origin":"*"
      }
    }
  )
  .then(checkRequestStatus)
  .then(JSON.parse)
  .then(function(data) {
    //store data or update display?
    alert(JSON.stringify(data));
  })
  .catch(alert);
}

function createStackWithWorld(stackName, worldS3Filepath, flavorS3Filepath, instanceType) {
  let url = API_URL + "/stacks";
  let urlParams = "stackName=" + stackName + "&"
                + "flavorS3Filepath=" + flavorS3Filepath + "&"
                + "worldS3Filepath=" + worldS3Filepath + "&"
                + "instanceType=" + instanceType;
  return fetch(
    url + "?" + urlParams,
    {
      //fetch object
      method: "POST",
      mode: "cors",
      headers: {
        "Access-Control-Allow-Origin":"*"
      }
    }
  )
  .then(checkRequestStatus)
  .then(JSON.parse)
  .then(function(data){
    //store data or update display?
    alert(JSON.stringify(data))
  })
  .catch(alert);
}

//obtain new stacks data.
function fetchStacks() {
  let url = API_URL + "/stacks";
  let urlParams = "limit=5";
  return fetch(
    url+"?"+urlParams,
    {
      mode: "cors",
      headers: {
        "Access-Control-Allow-Origin":"*"
      }
    }
  )
  .then(checkRequestStatus)
  .then(JSON.parse)
  .then(function(data) {
    localStorage.setItem("stacks",JSON.stringify(data.stacks));
    return data;
  })
  .catch(alert);
}

//obtain new flavors data.
function fetchFlavors() {
  let url = API_URL + "/flavors";
  let urlParams = "limit=5";
  return fetch(
    url+"?"+urlParams,
    {
      mode: "cors",
      headers: {
        "Access-Control-Allow-Origin":"*"
      }
    }
  )
  .then(checkRequestStatus)
  .then(JSON.parse)
  .then(function(data) {
    localStorage.setItem("flavors",JSON.stringify(data.items));
    return data;
  })
  .catch(alert);
}

//obtain new worlds data.
function fetchWorlds() {

  let url = API_URL + "/worlds";
  let urlParams = "limit=5";
  return fetch(
    url+"?"+urlParams,
    {
      mode: "cors",
      headers: {
        "Access-Control-Allow-Origin":"*"
      }
    }
  )
  .then(checkRequestStatus)
  .then(JSON.parse)
  .then(function(data) {
    localStorage.setItem("worlds",JSON.stringify(data.items));
    return data;
  })
  .catch(alert);
}

/*
Verify health of API request response. Utilize promise rejection for failure.
*/
function checkRequestStatus(response) {
  if (response.status >= 200 && response.status < 300) {
       return response.text();
  }
  else {
     return Promise.reject(new Error(response.status +
                                      ": " + response.statusText));
  }
}


/*
forms and injects DOM elements containing information on each world.
removes and repopulates #worlds-cards-row.
TODO: which is better, appendChild all at the end, or when the element is made?
*/
function injectWorlds() {

  let worlds = JSON.parse(localStorage.worlds);
  let flavors = JSON.parse(localStorage.flavors);

  //delete current HTML
  let row = document.getElementById("worlds-cards-row");
  while(row.firstChild) {
    row.removeChild(row.firstChild);
  }

  //for each world object in localStorage array
  for(let i = 0; i < worlds.length; i++) {
    //find the flavor details
    let world = worlds[i];
    let flavor = flavors.find(i => i.flavorID === world.flavorID);

    //build new HTML
    let column = document.createElement("div");
    column.classList.add("col-lg-4","col-md-6","col-sm-6");
    row.appendChild(column);

    let card = document.createElement("div");
    card.classList.add("card","card-stats");
    column.appendChild(card);

      let cardHeader = document.createElement("div");
      cardHeader.classList.add("card-header");
      cardHeader.setAttribute("data-background-color","white")
      cardHeader.appendChild(document.createTextNode(world.worldName));
      card.appendChild(cardHeader);

      let cardContent = document.createElement("div");
      cardContent.classList.add("card-content");
      card.appendChild(cardContent);

        let cardContentCategory = document.createElement("p");
        cardContentCategory.classList.add("category");
        cardContentCategory.appendChild(document.createTextNode("Flavor"));
        cardContent.appendChild(cardContentCategory);

        let cardContentTitle = document.createElement("p");
        cardContentTitle.classList.add("card-title");
        cardContentTitle.appendChild(document.createTextNode(
          flavor.flavorDescription
        ));
        cardContent.appendChild(cardContentTitle);

      let cardFooter = document.createElement("div");
      cardFooter.classList.add("card-footer");
      card.appendChild(cardFooter);

        let cardFooterLink = document.createElement("a");
        cardFooterLink.setAttribute("data-worldName", world.worldName);
        cardFooterLink.setAttribute("data-worldS3Filepath", world.s3Filepath);
        cardFooterLink.setAttribute("data-flavorS3Filepath", flavor.s3Filepath);
        cardFooterLink.setAttribute("data-instanceType", "m5.large");
        cardFooterLink.appendChild(document.createTextNode(
          "create stack with this world...\t"
        ));
        cardFooter.appendChild(cardFooterLink);

        //small link
        let cardFooterLinkSmall = document.createElement("a");
        cardFooterLinkSmall.setAttribute("data-worldName", world.worldName);
        cardFooterLinkSmall.setAttribute("data-worldS3Filepath", world.s3Filepath);
        cardFooterLinkSmall.setAttribute("data-flavorS3Filepath", flavor.s3Filepath);
        cardFooterLinkSmall.setAttribute("data-instanceType", "m5.large");
        cardFooterLinkSmall.onclick = function() {
          alert(
            this.getAttribute("data-worldName"),
            this.getAttribute("data-worldS3Filepath"),
            this.getAttribute("data-flavorS3Filepath"),
            this.getAttribute("data-instanceType")
          );
          createStackWithWorld(
            this.getAttribute("data-worldName") + "-" + Date.now(),  //stackName
            this.getAttribute("data-worldS3Filepath"),
            this.getAttribute("data-flavorS3Filepath"),
            this.getAttribute("data-instanceType")
          ).then(alert("done!"));
        };
        cardFooterLinkSmall.appendChild(document.createTextNode(
          "small "
        ));
        cardFooter.appendChild(cardFooterLinkSmall);

        //medium link
        let cardFooterLinkMedium = document.createElement("a");
        cardFooterLinkMedium.setAttribute("data-worldName", world.worldName);
        cardFooterLinkMedium.setAttribute("data-worldS3Filepath", world.s3Filepath);
        cardFooterLinkMedium.setAttribute("data-flavorS3Filepath", flavor.s3Filepath);
        cardFooterLinkMedium.setAttribute("data-instanceType", "r5.large");
        cardFooterLinkMedium.onclick = function() {
          alert(
            this.getAttribute("data-worldName"),
            this.getAttribute("data-worldS3Filepath"),
            this.getAttribute("data-flavorS3Filepath"),
            this.getAttribute("data-instanceType")
          );
          createStackWithWorld(
            this.getAttribute("data-worldName") + "-" + Date.now(),  //stackName
            this.getAttribute("data-worldS3Filepath"),
            this.getAttribute("data-flavorS3Filepath"),
            this.getAttribute("data-instanceType")
          ).then(alert("done!"));
        };
        cardFooterLinkMedium.appendChild(document.createTextNode(
          "medium "
        ));
        cardFooter.appendChild(cardFooterLinkMedium);

        //large link
        let cardFooterLinklarge = document.createElement("a");
        cardFooterLinklarge.setAttribute("data-worldName", world.worldName);
        cardFooterLinklarge.setAttribute("data-worldS3Filepath", world.s3Filepath);
        cardFooterLinklarge.setAttribute("data-flavorS3Filepath", flavor.s3Filepath);
        cardFooterLinklarge.setAttribute("data-instanceType", "m5.xlarge");
        cardFooterLinklarge.onclick = function() {
          alert(
            this.getAttribute("data-worldName"),
            this.getAttribute("data-worldS3Filepath"),
            this.getAttribute("data-flavorS3Filepath"),
            this.getAttribute("data-instanceType")
          );
          createStackWithWorld(
            this.getAttribute("data-worldName") + "-" + Date.now(),  //stackName
            this.getAttribute("data-worldS3Filepath"),
            this.getAttribute("data-flavorS3Filepath"),
            this.getAttribute("data-instanceType")
          ).then(alert("done!"));
        };
        cardFooterLinklarge.appendChild(document.createTextNode(
          "large "
        ));
        cardFooter.appendChild(cardFooterLinklarge);

  }
}

/*
forms and injects DOM elements containing information on each flavor.
removes and repopulates #flavors-cards-row.
TODO: which is better, appendChild all at the end, or when the element is made?
*/
function injectFlavors() {

  let flavors = JSON.parse(localStorage.flavors);

  //delete current HTML
  let row = document.getElementById("flavors-cards-row");
  while(row.firstChild) {
    row.removeChild(row.firstChild);
  }

  //for each flavor object in localStorage array
  for(let i = 0; i < flavors.length; i++) {

    let flavor = flavors[i];

    //build new HTML
    let column = document.createElement("div");
    column.classList.add("col-lg-4","col-md-6","col-sm-6");
    row.appendChild(column);

    let card = document.createElement("div");
    card.classList.add("card","card-stats");
    column.appendChild(card);

      let cardHeader = document.createElement("div");
      cardHeader.classList.add("card-header");
      cardHeader.setAttribute("data-background-color","white")
      cardHeader.appendChild(document.createTextNode(flavor.flavorDescription));
      card.appendChild(cardHeader);

      let cardContent = document.createElement("div");
      cardContent.classList.add("card-content");
      card.appendChild(cardContent);

        let cardContentCategory = document.createElement("p");
        cardContentCategory.classList.add("category");
        cardContentCategory.appendChild(document.createTextNode("MC version"));
        cardContent.appendChild(cardContentCategory);

        let cardContentTitle = document.createElement("p");
        cardContentTitle.classList.add("card-title");
        cardContentTitle.appendChild(document.createTextNode(
          flavor.minecraftVersion
        ));
        cardContent.appendChild(cardContentTitle);

      let cardFooter = document.createElement("div");
      cardFooter.classList.add("card-footer");
      card.appendChild(cardFooter);

        let cardFooterLink = document.createElement("a");
        cardFooterLink.onclick = function() {
          /*
          createWorldWithFlavor(
            //worldname
          )
          */
        };
        cardFooterLink.appendChild(document.createTextNode(
          "create world with this flavor..."
        ));
        cardFooter.appendChild(cardFooterLink);
  }
}

function injectStacks() {
  let stacks = JSON.parse(localStorage.stacks);

  //delete current HTML
  let row = document.getElementById("stacks-cards-row");
  while(row.firstChild) {
    row.removeChild(row.firstChild);
  }

  //for each flavor object in localStorage array
  for(var i = 0; i < stacks.length; i++) {

    let stack = stacks[i];

    //build new HTML
    let column = document.createElement("div");
    column.classList.add("col-lg-4","col-md-6","col-sm-6");
    row.appendChild(column);

    let card = document.createElement("div");
    card.classList.add("card","card-stats");
    column.appendChild(card);

      let cardHeader = document.createElement("div");
      cardHeader.classList.add("card-header");
      cardHeader.setAttribute("data-background-color","white");
      if(stack.stackIps) {
        cardHeader.appendChild(document.createTextNode(stack.stackIps[0]));
      } else {
        cardHeader.appendChild(document.createTextNode(stack.stackStatus));
      }

      card.appendChild(cardHeader);

      let cardContent = document.createElement("div");
      cardContent.classList.add("card-content");
      card.appendChild(cardContent);

        let cardContentCategory = document.createElement("p");
        cardContentCategory.classList.add("category");
        cardContentCategory.appendChild(document.createTextNode("Stack"));
        cardContent.appendChild(cardContentCategory);

        let cardContentTitle = document.createElement("p");
        cardContentTitle.classList.add("card-title");
        cardContentTitle.appendChild(document.createTextNode(
          stack.stackName
        ));
        cardContent.appendChild(cardContentTitle);

      let cardFooter = document.createElement("div");
      cardFooter.classList.add("card-footer");
      card.appendChild(cardFooter);

        let cardFooterLink = document.createElement("a");
        cardFooterLink.setAttribute("data-stackName", stack.stackName);
        cardFooterLink.onclick = function() {
          deleteStack(this.getAttribute("data-stackName"));
        };
        cardFooterLink.appendChild(document.createTextNode(
          "Created: " + stack.stackCreationTime + "\n click here to delete"
        ));
        cardFooter.appendChild(cardFooterLink);
  }
}

})();
