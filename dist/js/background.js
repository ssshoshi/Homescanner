chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if(request.urlParams) {
  var url =
    "https://www.zillow.com/search/GetSearchPageState.htm?searchQueryState=" +
    request.urlParams;
  fetch(url)
    .then((response) => response.json())
    .then((data) => sendResponse(data.cat1.searchResults.mapResults))
    .catch((error) => {
      //checks if there is a captcha
      fetch('https://www.zillow.com')
        .then((response) => response.text())
        .then(data => {
          const parser = new DOMParser();
          const doc = parser.parseFromString(data, "text/html");
          if(doc.querySelector(".error-text-content")) {
            sendResponse("captcha")
          }
        })
        .catch(error => console.log(error))
    });

    fetch("https://www.realtor.com/")
    .then((response) => response.text())
    .then((data) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(data, "text/html");
    console.log(doc.querySelector(".title-force"))
    if (doc.querySelector(".title-force")) {
      sendResponse("realtor-captcha")
    }
  })

  return true;
  }

  if (request.msg === "ok") {
    chrome.tabs.create({ url: "/homescanner.html" });
  }

});

