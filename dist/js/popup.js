document.querySelector(".btn").onclick = function() {
  var d = document.querySelector("#coords").value;
  chrome.storage.local.set({ data: d }, function() {
    if (chrome.runtime.error) {
      console.log("Runtime error.");
    }
  });
};
