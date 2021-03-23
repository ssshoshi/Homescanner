chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  var url =
    "https://www.zillow.com/search/GetSearchPageState.htm?searchQueryState=" +
    request.urlParams;
    console.log(url);
  fetch(url)
    .then((response) => response.json())
    .then((data) => sendResponse(data.cat1.searchResults.mapResults))
    .catch((error) => console.log(error));
  return true;
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.msg === "ok") {
    chrome.tabs.create({ url: "/homescanner.html" });
  }
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if(request.realtorID) {
    var url =
      "https://www.realtor.com/realestateandhomes-detail/M" + request.realtorID
      // console.log(request.realtorID);
    fetch(url)
      .then((response) => response.text())
      .then((data) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(data, "text/html");

        sendResponse(doc.getElementsByClassName("leadform-bgimg")[0].src)
      })
      .catch((error) => console.log(error));

    return true;
  }
});