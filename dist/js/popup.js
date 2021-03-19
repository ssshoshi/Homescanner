const verifyCoords = (lat, lon) => {
  ck_lat = /^(-?[1-8]?\d(?:\.\d{1,18})?|90(?:\.0{1,18})?)$/;
  ck_lon = /^(-?(?:1[0-7]|[1-9])?\d(?:\.\d{1,18})?|180(?:\.0{1,18})?)$/;

  let validLat = ck_lat.test(lat);
  let validLon = ck_lon.test(lon);
  if (validLat && validLon) {
    return true;
  } else {
    return false;
  }
};

const inputIsCoords = (latLong) => {
  console.log(latLong)
  if (verifyCoords(latLong[0].trim(), latLong[1].trim())) {
    chrome.storage.local.set({ data: latLong }, function () {
      if (chrome.runtime.error) {
        console.log("Runtime error.");
      }
      window.open("/homescanner.html");
    });
  } else {
    document.querySelector("#error").textContent = "Input must be coordinates e.g. 47.595152, -122.331639"
  }
}

document.querySelector("#coords").addEventListener("keydown", (e) => {
  let d = document.querySelector("#coords").value;
  let latLong = d.split(/,/);
  if(e.key === "Enter") {
    inputIsCoords(latLong)
  }
});

document.querySelector("#enter").addEventListener("click", () => {
  let d = document.querySelector("#coords").value;
  let latLong = d.split(/,/);
  inputIsCoords(latLong)
});









