let listingsArr = [];
let lat1, long1, urlParams, svStatus;

//get coordinates from popup and call fetch
chrome.storage.local.get("data", (items) => {
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

  for (item of list) {
    addr = item.innerText || item.textContent;
    if (addr.toUpperCase().indexOf(filter) > -1) {
      console.log(filter);
      item.closest(".listing").style.display = "";
      results += 1;
    } else {
      item.closest(".listing").style.display = "none";
    }
  }
  document.getElementById("resultsNum").innerText = results + " results";
};

// delay on search input
let input = document.getElementById("search");
let timeout = null;
input.addEventListener("keyup", (e) => {
  clearTimeout(timeout);
  timeout = setTimeout(() => {
    searchList();
  }, 500);
});

// camelcase string
const toCamel = (string) => {
  return string.toLowerCase().replace(/(?:_| |\b)(\w)/g, ($1) => {
    return $1.toUpperCase().replace("_", " ");
  });
}

// render listing
const renderListing = async (e) => {
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
              <a class="btn btn-sm btn-light" href="https://www.google.com/maps/@?api=1&map_action=pano&pano=${e.pano_id}&viewpoint=${e.svLat},${e.svLng}" target="_blank" data-toggle="tooltip" data-placement="top" title="Streetview"><i class="fa fa-street-view"></i></a>
              <a class="btn btn-sm btn-light" href="http://googl.com/#q=${e.addr} ${e.city} ${e.state}" target="_blank" data-toggle="tooltip" data-placement="top" title="Search Address"><i class="fa fa-search"></i></a>
              <a class="btn btn-sm btn-light" href="https://www.whitepages.com/address/${e.addr}/${e.city}-${e.state}" target="_blank" data-toggle="tooltip" data-placement="top" title="Whitepages"><i class="fa fa-book"></i></a>
          </div>
          <a class="btn btn-sm btn-light expand" data-img="${e.imgSrc}" data-toggle="modal" data-target="#exampleModalCenter"><i class="fa fa-arrows-alt"></i></a>
          <div class="toggle">
              <img src="${e.imgSrc}" loading="lazy" class="card-img-top embed-responsive-item"/>
          </div>
          </div>
          <div class="card-body row pb-0 pt-0">
          <div class="col-6 align-self-start mt-2">
              <a class="h5 addr" id="addrUrl" href="https://zillow.com${e.detailUrl}" target="_blank">
              ${e.addr + ", " + e.city + ", " + e.state}
              </a>
              <a target="_blank" style="float: right" href="http://googl.com/#q=${e.addr + " " + e.city + " " + e.state}"></a>  
              <p class="mb-0 type">${toCamel(e.homeType)}</p>
              <p class="mb-0">${e.price} Assessed</p>
              <p class="mb-0 geo">${e.lat}, ${e.long}</p>
          </div>
          <div class="col-6 text-right align-self-start mt-2">
              <div><strong>${e.imgCount} </strong>imgs</div>
              <div><strong>${e.sqft}</strong> sqft</div>
              <div><strong>${e.beds}</strong> bd <strong class="font-weight-bold">${e.baths}</strong> ba</div>
              <div><strong>${e.distance}</strong>m away</div>
              <div>${e.status}</div>
          </div>
          </div>
      </div>
  </div>
`
  );
}

//render skeleton before listing render
const skeleton = () => {
  for (i=0; i < 6; i++) {
    document.querySelector(".list").insertAdjacentHTML(
      "beforeend",
      `
    <div class="col-md-6 mb-2 skeleton">
        <div class="card mb-2 h-100 skBorder">
            <div class="embed-responsive embed-responsive-16by9">
            <div class="toggle">
                <figure class="card-img-top embed-responsive-item map loading" </figure>
            </div>
            </div>
            <div class="card-body row pb-0 pt-0">
            <div class="col-6 align-self-start mt-2">
                <p class="mb-0 skAddr loading"></p>
                <p class="mb-0 skAddr2 loading"></p> 
                <p class="mb-0 skType loading"></p>
                <p class="mb-0 skPrice loading"></p>
                <p class="mb-0 skGeo loading"></p>
            </div>
            <div class="col-6 d-flex align-items-end flex-column mt-2 ">
                <div class="loading skImgs"></div>
                <div class="loading skSqft"></div>
                <div class="loading skBa"></div>
                <div class="loading skDist"></div>
                <div class="loading skStatus"></div>
            </div>
            </div>
        </div>
    </div>
  `
    );
  }
}
skeleton();

// hide skeletons before listings render
const hideSkeletons = () => {
  let elements = document.getElementsByClassName("skeleton");
  Array.prototype.forEach.call(elements, (el) => {
      el.style.display = "none";
    }
  );
}

// fetch Zillow streetview metadata
const getStreetViewMeta = async (url) => {
  const fetchResult = fetch(url);
  const response = await fetchResult;
  const jsonData = await response.json();
  return jsonData;
};

// calculate distance
const getDistance = (lat1, lon1, lat2, lon2, unit) => {
  if (lat1 == lat2 && lon1 == lon2) {
    return 0;
  } else {
    let radlat1 = (Math.PI * lat1) / 180;
    let radlat2 = (Math.PI * lat2) / 180;
    let theta = lon1 - lon2;
    let radtheta = (Math.PI * theta) / 180;
    let dist =
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

// change column view
const threeColumnRow = () => {
  const listings = document.querySelectorAll('.listing');
  if(listings[0].classList.contains('col-md-6')) {
    for(listing of listings) {
      listing.classList.remove('col-md-6');
      listing.classList.add('col-md-4');
    }
  } else if(listings[0].classList.contains('col-md-12')) {
    for(listing of listings) {
      listing.classList.remove('col-md-12');
      listing.classList.add('col-md-4');
    }
  }
}

const twoColumnRow = () => {
  const listings = document.querySelectorAll('.listing');
  if(listings[0].classList.contains('col-md-4')) {
    for(listing of listings) {
      listing.classList.remove('col-md-4');
      listing.classList.add('col-md-6');
    }
  } else if(listings[0].classList.contains('col-md-12')) {
    for(listing of listings) {
      listing.classList.remove('col-md-12');
      listing.classList.add('col-md-6');
    }
  }
}
const oneColumnRow = () => {
  const listings = document.querySelectorAll('.listing');
  if(listings[0].classList.contains('col-md-6')) {
    for(listing of listings) {
      listing.classList.remove('col-md-6');
      listing.classList.add('col-md-12');
    }
  } else if(listings[0].classList.contains('col-md-4')) {
    for(listing of listings) {
      listing.classList.remove('col-md-4');
      listing.classList.add('col-md-12');
    }
  }
}

// render all listings
const render = async () => {
  for (listing of listingsArr) {
    renderListing(listing);
  }
};

// convert input coordinates to map boundary coordinates for Zillow url params
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

// fetch url and push listings to array
const getJSON = async () => {
  chrome.runtime.sendMessage({ urlParams: urlParams }, async (response) => {
    let homes = response;
    console.log(homes);
    for (let home of homes) {
      if (home.zpid || home.buildingId) {
        let house = {
          pano_id: null,
          addr: home.buildingId
            ? home.detailUrl.split("/")[2].replace(/-/g, " ")
            : home.hdpData.homeInfo.streetAddress,
          city: home.hasOwnProperty("hdpData")
            ? home.hdpData.homeInfo.city
            : "--",
          state: home.hasOwnProperty("hdpData")
            ? home.hdpData.homeInfo.state
            : "--",
          zipcode: home.hasOwnProperty("hdpData")
            ? home.hdpData.homeInfo.zipcode
            : "--",
          streetViewURL: home.streetViewURL,
          streetViewMetadataURL: home.streetViewMetadataURL,
          detailUrl: home.detailUrl,
          homeType: home.buildingId
            ? "APARTMENT"
            : home.hdpData.homeInfo.homeType,
          lat: home.latLong.latitude,
          long: home.latLong.longitude,
          imgCount: home.imgCount,
          price: home.priceLabel ? home.priceLabel : "--",
          sqft: home.area ? home.area : "--",
          beds: home.beds ? home.beds : "--",
          baths: home.baths ? home.baths : "--",
          status: home.statusText ? home.statusText : "",
          imgSrc: home.imgSrc,
          distance: Math.round(
            getDistance(
              lat1,
              long1,
              home.latLong.latitude,
              home.latLong.longitude,
              "K"
            ) * 1000
          ),
        };
        let addrStreetview = `https://maps.googleapis.com/maps/api/streetview/metadata?location=${encodeURIComponent(
          house.addr
        )}+${encodeURIComponent(
          house.city
        )}&size=800x800&key=AIzaSyBot9JtFX4Hqs-Ri6N3A8K1Rl5XZD3ssyI`;
        let metaDataOne = getStreetViewMeta(addrStreetview);
        let metaDataTwo;

        Promise.resolve(metaDataOne).then((val) => {
          if (val.status === "OK") {
            house.pano_id = val.pano_id;
            house.svLat = val.location.lat;
            house.svLng = val.location.lng;
            if (house.imgCount === 0) {
              house.imgSrc = `https://maps.googleapis.com/maps/api/streetview?location=${encodeURIComponent(
                house.addr
              )}+${encodeURIComponent(
                house.city
              )}&size=800x800&key=AIzaSyBot9JtFX4Hqs-Ri6N3A8K1Rl5XZD3ssyI`;
            }
          } else if (val.status !== "OK") {
            metaDataTwo = getStreetViewMeta(home.streetViewMetadataURL);
            Promise.resolve(metaDataTwo).then((value) => {
              if (value.status === "OK") {
                house.imgSrc = `https://maps.googleapis.com/maps/api/streetview?location=${home.latLong.latitude},${home.latLong.longitude}&size=800x800&key=AIzaSyBot9JtFX4Hqs-Ri6N3A8K1Rl5XZD3ssyI`;
              }
            });
          }
        });
        listingsArr.push(house);
      }
    }

    // wait 2 seconds then render after Promises resolve
    setTimeout(() => {
      hideSkeletons();
      document.querySelector(
        "#resultsNum"
      ).innerHTML = `<strong>${listingsArr.length}</strong> Results`;
      listingsArr.sort((a, b) => a.distance - b.distance);
      console.log(listingsArr);
      render();
      document.querySelector('.columnBtns').style.display = "flex";
      document.querySelector('#avgHomeValue').innerText = `${avgHomeValue()}`
    }, 2000);
  });
};

//populate modal
$("#exampleModalCenter").on("show.bs.modal", (event) => {
  let button = $(event.relatedTarget); // Button that triggered the modal
  let imgOne = button.data("img");
  document.querySelector('.main').setAttribute("src", imgOne);
});

document.getElementById('threeColumn').addEventListener("click", threeColumnRow)
document.getElementById('twoColumn').addEventListener("click", twoColumnRow)
document.getElementById('oneColumn').addEventListener("click", oneColumnRow)


//scroll to top of page
const scrollToTopButton = document.getElementById('js-top');

const scrollFunc = () => {
  let y = window.scrollY;
  if (y > 0) {
    scrollToTopButton.className = "btn top-link show";
  } else {
    scrollToTopButton.className = "btn top-link hide";
  }
};

window.addEventListener("scroll", scrollFunc);

const scrollToTop = () => {
  const c = document.documentElement.scrollTop || document.body.scrollTop;
  if (c > 0) {
    window.requestAnimationFrame(scrollToTop);
    window.scrollTo(0, c - c / 10);
  }
};

scrollToTopButton.onclick = (e) => {
  e.preventDefault();
  scrollToTop();
}

const avgHomeValue = () => {
  let total = 0;
  let totalHomesWithValue = 0;
  for (listing of listingsArr) {
    if(listing.price !== "--") {
      let price = parseInt(listing.price.replace(/\D/g,''));
      total += price;
      totalHomesWithValue++;
    }
  }
  return `${parseInt(total/totalHomesWithValue)}K`
}