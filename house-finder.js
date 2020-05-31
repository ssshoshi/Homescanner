let listingsArr = [];
let streetViewArr = [];
let promises = [];
let lat1, long1, urlParams, svStatus;

chrome.storage.local.get("data", async (items) => {
  if (!chrome.runtime.error) {
    let latLong = items.data;
    let coords = latLong.replace(/\s/g, "").split(",");
    document.querySelector("#coords").innerText = latLong;
    lat1 = parseFloat(coords[0]);
    long1 = parseFloat(coords[1]);
    urlParams = `{"pagination":{},"mapBounds":${getMapBoundaries(
      lat1,
      long1
    )},"isMapVisible":true,"mapZoom":19}`;
  }
  await getJSON();
});

// Filter listings by address
const searchList = () => {
  let input,
    filter,
    addr,
    results = 0;
  input = document.getElementById("search");
  filter = input.value.toUpperCase();
  list = document.querySelectorAll(".addr");

  for (i = 0; i < list.length; i++) {
    addr = list[i].innerText || list[i].textContent;
    if (addr.toUpperCase().indexOf(filter) > -1) {
      console.log(filter);
      list[i].closest(".listing").style.display = "";
      results += 1;
    } else {
      list[i].closest(".listing").style.display = "none";
    }
  }
  document.getElementById("resultsNum").innerText = results + " results";
};


// delay on search input
let input = document.getElementById("search");
let timeout = null;
input.addEventListener("keyup", function (e) {
  clearTimeout(timeout);
  timeout = setTimeout(function () {
    searchList();
  }, 500);
});

// refresh button
// document.querySelector("#refresh").addEventListener("click", function () {
//   listingsArr = [];
//   listingsArrResolved = [];
//   document.querySelector(".list").innerHTML = "";
//   getJSON();
//   render();
// });

function toCamel(string){
  return string.toLowerCase().replace(/(?:_| |\b)(\w)/g, function($1){return $1.toUpperCase().replace('_',' ');});
}

const listing = async (e) => {

  document.querySelector(".list").insertAdjacentHTML(
    "beforeend",
    `
  <div class="col-md-6 mb-2 listing">
    <div class="card mb-2 h-100 hovernow">
      <div class="embed-responsive embed-responsive-16by9">
        <div class="maplinks">
          <a class="btn btn-sm btn-light" href="http://maps.google.com/maps?t=k&q=loc:${e.lat}+${e.long}" target="_blank">Google Map</a>
          <a class="btn btn-sm btn-light" href="https://www.bing.com/maps?where1=${e.lat},${e.long}&style=h&lvl=18" target="_blank">Bing Map</a>
        </div>
        <div class="otherLinks">
          <a class="btn btn-sm btn-light" href="https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${e.lat},${e.long}&heading=-45&fov=80" target="_blank" data-toggle="tooltip" data-placement="top" title="Streetview"><i class="fa fa-street-view"></i></span></a>
          <a class="btn btn-sm btn-light" href="http://googl.com/#q=${e.addr} ${e.city} ${e.state}" target="_blank" data-toggle="tooltip" data-placement="top" title="Search Address"><i class="fa fa-search"></i></span></a>
          <a class="btn btn-sm btn-light" href="https://www.whitepages.com/address/${e.addr}/${e.city}-${e.state}" target="_blank" data-toggle="tooltip" data-placement="top" title="Whitepages"><i class="fa fa-book"></i></span></a>
        </div>
        <div class="toggle">
          <img src="https://maps.googleapis.com/maps/api/staticmap?center=${e.lat},${e.long}&zoom=18&size=575x242&maptype=satellite&key=AIzaSyBot9JtFX4Hqs-Ri6N3A8K1Rl5XZD3ssyI&markers=color:red%7Csize:small%7C${e.lat},${e.long}" loading="lazy" class="card-img-top embed-responsive-item map style="display: none"/>
          <img src="${e.imgSrc}" loading="lazy" class="card-img-top embed-responsive-item"/>
        </div>
      </div>
      <div class="card-body row pb-0 pt-0">
        <div class="col-6 align-self-start mt-2">
          <a id="addrUrl" href="https://zillow.com${e.detailUrl}" target="_blank">
            <h5 class="mb-0 addr">${e.addr + ", " + e.city + ", " + e.state}</h5>
          </a>
          <a target="_blank" style="float: right" href="http://googl.com/#q=${e.addr + " " + e.city + " " + e.state}"></a>  
          <p class="mb-0 type">${toCamel(e.homeType)}</p>
        </div>
        <div class="col-6 text-right align-self-start mt-2">
          <div><span class="font-weight-bold">${e.imgCount} </span>imgs</div>
          <div><span class="font-weight-bold">${e.sqft}</span> sqft</div>
          <div><span class="font-weight-bold">${e.beds}</span> bd <span class="font-weight-bold">${e.baths}</span> ba</div>
          <div><span class="font-weight-bold">${e.distance}</span>m away</div>
        </div>
      </div>
    </div>
</div>
`)
}



const getStreetViewMeta = async (url) => {
  const fetchResult = fetch(url)
  const response = await fetchResult
  const jsonData = await response.json()
  return jsonData.status
}


// calculate distance
const getDistance = (lat1, lon1, lat2, lon2, unit) => {
  if (lat1 == lat2 && lon1 == lon2) {
    return 0;
  } else {
    var radlat1 = (Math.PI * lat1) / 180;
    var radlat2 = (Math.PI * lat2) / 180;
    var theta = lon1 - lon2;
    var radtheta = (Math.PI * theta) / 180;
    var dist =
      Math.sin(radlat1) * Math.sin(radlat2) +
      Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    if (dist > 1) {
      dist = 1;
    }
    dist = Math.acos(dist);
    dist = (dist * 180) / Math.PI;
    dist = dist * 60 * 1.1515;
    if (unit == "K") {
      dist = dist * 1.609344;
    }
    if (unit == "N") {
      dist = dist * 0.8684;
    }
    return dist;
  }
};

const render = async () => {
  for (let i = 0; i < listingsArr.length; i++) {
    listing(listingsArr[i])
   }

};

const getMapBoundaries = (lat, long) => {
  const coords = {};
  const x = 0.002743;
  const y = 0.002743;

  coords.west = long - y;
  coords.east = long + y;
  coords.south = lat - x;
  coords.north = lat + x;
  return JSON.stringify(coords);
};



const getJSON = async () => {
  chrome.runtime.sendMessage({ urlParams: urlParams }, async (response) => {
    document.querySelector(".spinner-border").style.display = "";
    console.log(response);
    let homes = response;
    for (let home of homes) {
      if (home.zpid || home.buildingId) {
        let house = {
          status: home.streetViewURL ? getStreetViewMeta(home.streetViewMetadataURL) : "NOT OK",
          addr: home.buildingId ? home.detailUrl.split("/")[2].replace(/-/g, " ") : home.hdpData.homeInfo.streetAddress,
          city: home.hasOwnProperty("hdpData") ? home.hdpData.homeInfo.city : "--",
          state: home.hasOwnProperty("hdpData") ? home.hdpData.homeInfo.state : "--",
          zipcode: home.hasOwnProperty("hdpData") ? home.hdpData.homeInfo.zipcode : "--",
          streetViewURL: null,
          streetViewMetadataURL: home.streetViewMetadataURL,
          detailUrl: home.detailUrl,
          homeType: home.buildingId ? "APARTMENT" : home.hdpData.homeInfo.homeType,
          lat: home.latLong.latitude,
          long: home.latLong.longitude,
          imgCount: home.imgCount,
          sqft: home.area ? home.area : "--",
          beds: home.beds ? home.beds : "--",
          baths: home.baths ? home.baths : "--",
          imgSrc: home.imgCount > 0 ? home.imgSrc : `https://maps.googleapis.com/maps/api/staticmap?center=${home.latLong.latitude},${home.latLong.longitude}&zoom=19&size=575x242&maptype=satellite&key=AIzaSyBot9JtFX4Hqs-Ri6N3A8K1Rl5XZD3ssyI&markers=color:red%7Csize:small%7C${home.latLong.latitude},${home.latLong.longitude}`,
          distance: Math.round(getDistance(lat1, long1, home.latLong.latitude, home.latLong.longitude, "K") * 1000),
        }
        house.streetViewURL = `https://maps.googleapis.com/maps/api/streetview?location=${encodeURIComponent(house.addr)}+${encodeURIComponent(house.city)}+${encodeURIComponent(house.state)}&size=800x900&key=AIzaSyBot9JtFX4Hqs-Ri6N3A8K1Rl5XZD3ssyI`
        console.log(house)
        promises.push(house.status)
        streetViewArr.push(house.streetViewURL)
        listingsArr.push(house)
      }
    }

    Promise.all(promises).then(val => {
      for (let i = 0; i < val.length; i++) {
      if(val[i] === "OK" && listingsArr[i].imgCount === 0){
        listingsArr[i].imgSrc = streetViewArr[i];
      }
      }
    })

    setTimeout(() => {

      document.querySelector(".spinner-border").style.display = "none";
      document.querySelector("#resultsNum").innerText = listingsArr.length + " Results";
      listingsArr.sort((a, b) => a.distance - b.distance);
      console.log(listingsArr)
      render()
      $(function () {
        $('[data-toggle="tooltip"]').tooltip()
      })
      $( ".toggle" ).click(function() {
        $(this.childNodes[3]).toggle();
      });
    }, 1000)
  });
};

