chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  var url =
    "https://www.zillow.com/search/GetSearchPageState.htm?searchQueryState=%7B%22pagination%22%3A%7B%7D%2C%22mapBounds%22%3A%7B%22west%22%3A-85.23968562262054%2C%22east%22%3A-85.23610755579467%2C%22south%22%3A43.62050219504752%2C%22north%22%3A43.624975747544354%7D%2C%22mapZoom%22%3A18%2C%22isMapVisible%22%3Atrue%2C%22filterState%22%3A%7B%22isAllHomes%22%3A%7B%22value%22%3Atrue%7D%2C%22sortSelection%22%3A%7B%22value%22%3A%22globalrelevanceex%22%7D%7D%2C%22isListVisible%22%3Atrue%7D&wants={%22cat1%22:[%22listResults%22,%22mapResults%22]}"
  fetch(url, {
    "headers": {
      "referer": "https://www.zillow.com"
    }
  }
  )
    .then((response) => response.json())
    .then((data) => sendResponse(data.cat1.searchResults.mapResults))
    .catch((error) => console.log(error));
  return true;
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.msg === "ok") {
    chrome.tabs.create({ url: "https://www.zillow.com/homescanner/" });
  }
});
