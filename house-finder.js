let listingsArr = [];
let lat1, long1, urlParams, svStatus;

chrome.storage.local.get("data", function (items) {
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
  getJSON();
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
document.querySelector("#refresh").addEventListener("click", function () {
  listingsArr = [];
  document.querySelector(".list").innerHTML = "";
  getJSON();
  render();
});

const listing = (e) => {
  document.querySelector(".list").insertAdjacentHTML(
    "beforeend",
    `
  <div class="col-md-6 listing">
    <div class="card mb-2 h-100 hovernow">
      <div class="embed-responsive embed-responsive-16by9">
        <div class="maplinks">
          <a class="btn btn-sm btn-light" href="https://www.google.com/maps/search/?api=1&query=${e.lat},${e.long}" target="_blank">Google Map</a>
          <a class="btn btn-sm btn-light" href="https://www.bing.com/maps?where1=${e.lat},${e.long}&style=h&lvl=18" target="_blank">Bing Map</a>
        </div>
        <div class="otherLinks">
          <a class="btn btn-sm btn-light" href="http://googl.com/#q=${e.addr} ${e.city} ${e.state}" target="_blank"><i class="fa fa-search"></i></span></a>
          <a class="btn btn-sm btn-light" href="https://www.whitepages.com/address/${e.addr}/${e.city}-${e.state}" target="_blank"><i class="fa fa-book"></i></span></a>
        </div>
        <img src="${e.imgSrc}" loading="lazy" class="card-img-top embed-responsive-item"/>
      </div>
      <div class="card-body row pb-0 pt-0">
        <div class="col-6 align-self-start mt-2">
          <a id="addrUrl" href="${addrUrl(e)}" target="_blank">
            <h5 class="mb-0 addr">${e.addr + ", " + e.city + ", " + e.state + " " + e.zipcode}</h5>
          </a>
          <a target="_blank" style="float: right" href="http://googl.com/#q=${e.addr + " " + e.city + " " + e.state}"></a>  
          <p class="mb-0 type">${e.homeType}</p>
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
`
  );
};

const getStreetViewMeta = (url) => {
  let status;
    jQuery.ajax({
      url: url,
      success: function (result) {
          status = result.status;
      },
      async: false
  });
return status
}

  


const addrUrl = (e) => {
  if (e.imgCount === 0) {
    return `http://googl.com/#q=${e.addr} ${e.city} ${e.state}`;
  } else {
    return `https://zillow.com${e.detailUrl}`;
  }
};

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

const render = () => {
  const dropdown = document.querySelector("#homeType");
  for (i of listingsArr) { 
    if (dropdown.value === "ALL") {
      listing(i);
    } else if (e.homeType === dropdown.value) {
      listing(i);
    }
  };
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

const getJSON = () => {
  chrome.runtime.sendMessage({ urlParams: urlParams }, (response) => {
    document.querySelector(".spinner-border").style.display = "";
    let addr,
      city,
      state,
      zipcode,
      imgSrc,
      detailUrl,
      streetViewMetadataURL,
      homeType,
      lat,
      long,
      imgCount,
      sqft,
      beds,
      baths,
      streetViewURL,
      status,
      distance;
    console.log(response);
    let homes = response;
    for (let i in homes) {
      if (homes[i].zpid || homes[i].buildingId) {
        addr = homes[i].buildingId
          ? homes[i].detailUrl.split("/")[2].replace(/-/g, " ")
          : homes[i].hdpData.homeInfo.streetAddress;
        city = homes[i].hasOwnProperty("hdpData")
          ? homes[i].hdpData.homeInfo.city
          : "--";
        state = homes[i].hasOwnProperty("hdpData")
          ? homes[i].hdpData.homeInfo.state
          : "--";
        zipcode = homes[i].hasOwnProperty("hdpData")
          ? homes[i].hdpData.homeInfo.zipcode
          : "--";
        streetViewURL = homes[i].streetViewURL;
        streetViewMetadataURL = homes[i].streetViewMetadataURL;
        detailUrl = homes[i].detailUrl;
        homeType = homes[i].buildingId
          ? "APARTMENT"
          : homes[i].hdpData.homeInfo.homeType;
        lat = homes[i].latLong.latitude;
        long = homes[i].latLong.longitude;
        imgCount = homes[i].imgCount;
        sqft = homes[i].area ? homes[i].area : "--";
        beds = homes[i].beds ? homes[i].beds : "--";
        baths = homes[i].baths ? homes[i].baths : "--";
        status = getStreetViewMeta(homes[i].streetViewMetadataURL);
        imgSrc = (getStreetViewMeta(homes[i].streetViewMetadataURL) === "OK") ? homes[i].streetViewURL : homes[i].imgSrc;
        console.log(imgSrc);
        distance = Math.round(
          getDistance(
            lat1,
            long1,
            homes[i].latLong.latitude,
            homes[i].latLong.longitude,
            "K"
          ) * 1000
        );
        listingsArr.push({
          addr,
          city,
          state,
          zipcode,
          detailUrl,
          homeType,
          lat,
          long,
          imgCount,
          sqft,
          beds,
          baths,
          distance,
          streetViewMetadataURL,
          streetViewURL,
          imgSrc,
          status
        });
      }
    }
    document.querySelector(".spinner-border").style.display = "none";
    document.querySelector("#resultsNum").innerText =
      listingsArr.length + " Results";
    listingsArr.sort((a, b) => a.distance - b.distance);
    console.log(listingsArr)
    render();
  });
};



