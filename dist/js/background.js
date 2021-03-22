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
  var url =
    "https://www.realtor.com/realestateandhomes-detail/2722-Vicente-St_San-Francisco_CA_94116_M27132-12140"
    console.log(url);
  let images;
  fetch(url)
    .then((response) => response.text())
    .then((data) => {
      console.log(data)
    })
    .catch((error) => console.log(error));

  return true;
});