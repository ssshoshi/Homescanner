ck_lat = /^(-?[1-8]?\d(?:\.\d{1,18})?|90(?:\.0{1,18})?)$/;
ck_lon = /^(-?(?:1[0-7]|[1-9])?\d(?:\.\d{1,18})?|180(?:\.0{1,18})?)$/;

const checkCoords = (lat, lon) => {
  let validLat = ck_lat.test(lat);
  let validLon = ck_lon.test(lon);
  if (validLat && validLon) {
    return true;
  } else {
    return false;
  }
};

document.querySelector(".btn").onclick = function (e) {
  var d = document.querySelector("#coords").value;
  let latLong = d.split(/,\s+/);
  if (checkCoords(latLong[0], latLong[1])) {
    chrome.storage.local.set({ data: d }, function () {
      if (chrome.runtime.error) {
        console.log("Runtime error.");
      }
    });
  } else {
    e.preventDefault();
  }
};

const enter = document.querySelector("#enter");
const input = document.querySelector("#coords");
coords.addEventListener("keypress", (e) => {
  if (input.length > e.key === "Enter") {
    enter.click();
  }
});
