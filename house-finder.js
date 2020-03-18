let listingsArr = [];
let lat, long, urlParams;

chrome.storage.local.get("data", function(items) {
  if (!chrome.runtime.error) {
    let latLong = items.data;
    let coords = latLong.replace(/\s/g, "").split(",");
    document.querySelector("#coords").innerText = latLong;
    lat = parseFloat(coords[0]);
    long = parseFloat(coords[1]);
    urlParams = `{"pagination":{},"mapBounds":${getMapBoundaries(
      lat,
      long
    )},"isMapVisible":true,"mapZoom":19}`;
  }
  getJSON();
});

//Filter listings by address
const searchList = () => {
  let input, filter, addr;
  input = document.getElementById("search");
  filter = input.value.toUpperCase();
  list = document.querySelectorAll(".addr");
  for (i = 0; i < list.length; i++) {
    addr = list[i].innerText || list[i].textContent;
    if (addr.toUpperCase().indexOf(filter) > -1) {
      list[i].closest(".listing").style.display = "";
    } else {
      list[i].closest(".listing").style.display = "none";
    }
  }
};

// document.getElementById("search").addEventListener("keyup", searchList);
let input = document.getElementById("search");
let timeout = null;
input.addEventListener("keyup", function(e) {
  clearTimeout(timeout);
  timeout = setTimeout(function() {
    console.log("hi");
    searchList();
  }, 500);
});

// refresh button
document.querySelector("#refresh").addEventListener("click", function() {
  listingsArr = [];
  document.querySelector(".list").innerHTML = "";
  getJSON();
});

function listing(e) {
  document.querySelector(".list").insertAdjacentHTML(
    "beforeend",
    `
  <div class="col-md-6 mb-2 listing">
    <div class="card mb-2 h-100">
      <div class="embed-responsive embed-responsive-16by9">
        <img src=${e.imgSrc} loading="lazy" class="card-img-top embed-responsive-item"/>
      </div>
      <div class="card-body row pb-0 pt-0">
        <div class="col-6 align-self-end">
          <a href="https://zillow.com${e.detailUrl}" target="_blank"><h5 class="mb-0 addr">${e.addr}</h5></a>
          <a href="https://www.google.com/maps/search/?api=1&query=${e.latLong}" target="_blank">${e.latLong}</a>
          <p class="mb-0 type">${e.homeType}</p>
        </div>
        <div class="col-6 text-right align-self-end">
          <div><span class="font-weight-bold">${e.imgCount} </span>imgs</div>
          <div><span class="font-weight-bold">${e.sqft}</span> sqft</div>
          <div><span class="font-weight-bold">${e.beds}</span> bd <span class="font-weight-bold">${e.baths}</span> ba</div>
        </div>
      </div>
    </div>
</div>
`
  );
}

const render = () => {
  const dropdown = document.querySelector("#homeType");
  listingsArr.forEach(e => {
    if (dropdown.value === "ALL") {
      listing(e);
    } else if (e.homeType === dropdown.value) {
      listing(e);
    }
  });
};

function getMapBoundaries(lat, long) {
  const coords = {};
  const x = 0.002743;
  const y = 0.002743;

  coords.west = long - y;
  coords.east = long + y;
  coords.south = lat - x;
  coords.north = lat + x;
  return JSON.stringify(coords);
}

function getJSON() {
  let url =
    "https://cors-anywhere.herokuapp.com/https://www.zillow.com/search/GetSearchPageState.htm?searchQueryState=" +
    encodeURIComponent(urlParams);
  document.querySelector(".spinner-border").style.display = "";
  fetch(url)
    .then(response => {
      return response.json();
    })
    .then(data => {
      let addr,
        imgSrc,
        detailUrl,
        homeType,
        latLong,
        imgCount,
        sqft,
        beds,
        baths;
      let homes = data.searchResults.mapResults;
      for (let i in homes) {
        if (homes[i].zpid || homes[i].buildingId) {
          addr = homes[i].buildingId
            ? homes[i].statusText
            : homes[i].hdpData.homeInfo.streetAddress;
          imgSrc =
            homes[i].imgCount === 0 ? homes[i].streetViewURL : homes[i].imgSrc;
          detailUrl = homes[i].detailUrl;
          homeType = homes[i].buildingId
            ? "APARTMENT"
            : homes[i].hdpData.homeInfo.homeType;
          latLong =
            homes[i].latLong.latitude + "," + homes[i].latLong.longitude;
          imgCount = homes[i].imgCount;
          sqft = homes[i].area ? homes[i].area : "--";
          beds = homes[i].beds ? homes[i].beds : "--";
          baths = homes[i].baths ? homes[i].baths : "--";

          listingsArr.push({
            addr,
            imgSrc,
            detailUrl,
            homeType,
            latLong,
            imgCount,
            sqft,
            beds,
            baths
          });
        }
      }
      console.log(listingsArr.length);
      document.querySelector(".spinner-border").style.display = "none";
      document.querySelector("#resultsNum").innerText =
        listingsArr.length + " Results";
      render();
    });
}
