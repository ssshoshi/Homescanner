chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if(request.urlParams) {
  var url =
    "https://www.zillow.com/search/GetSearchPageState.htm?searchQueryState=" +
    request.urlParams;
  fetch(url)
    .then((response) => response.json())
    .then((data) => sendResponse(data.cat1.searchResults.mapResults))
    .catch((error) => {
      fetch('https://www.zillow.com')
        .then((response) => response.text())
        .then(data => {
          const parser = new DOMParser();
          const doc = parser.parseFromString(data, "text/html");
          if(doc.querySelector(".error-text-content")) {
            sendResponse("captcha")
          }
          // sendResponse(doc.querySelector(".error-text-content"))
        })
        .catch(error => console.log(error))
    });
  return true;
  }

  if(request.realtorID) {
    var url =
      "https://www.realtor.com/realestateandhomes-detail/M" + request.realtorID
    fetch(url)
      .then((response) => response.text())
      .then((data) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(data, "text/html");
        sendResponse(doc.querySelector("[data-index='1']").src)
      })
      .catch((error) => console.log(error));

    return true;
  }

  if (request.msg === "ok") {
    chrome.tabs.create({ url: "/homescanner.html" });
  }

});

