chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  var url =
    "https://www.zillow.com/search/GetSearchPageState.htm?searchQueryState=" +
    encodeURIComponent(request.urlParams);
  fetch(url)
    .then(response => response.json())
    .then(data => sendResponse(data.searchResults.mapResults))
    .catch(error => console.log(error));
  return true;
});
