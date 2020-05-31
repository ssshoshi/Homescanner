const google = `http://maps.google.com/maps?t=k&q=loc:`;
const bing = `https://www.bing.com/maps?where1=`;
const style = "font-weight: bold; width: 100%; text-align: center;";


if (window.location.hostname === "www.homeaway.com") {
window.onload = (e) => {
    const src = document.querySelector('.pdp-map-thumbnail').firstChild.src;
    let params = new URLSearchParams(src);
    let haCoord = params.get("center");
    let haMap = document.querySelector('.listing-overview__map');

haMap.insertAdjacentHTML('beforebegin', `

<a href=${google}${haCoord} style="${style} white-space: normal;" class="label label-default" target="_blank">Google</a><br>
<a href="${bing}${haCoord}&style=h&lvl=18" style="${style} white-space: normal;" class="label label-default" target="_blank">Bing</a>
`);
   document.querySelector('.listing-overview__col').style.cssText = "white-space: normal"
};
}

if (window.location.hostname === "www.google.com") {
    let coordClick = document.getElementsByClassName("section-hero-header-title-subtitle")[0]
    coordClick.onclick = function() {
    let coord = this.innerText
      chrome.storage.local.set({ data: coord }, function() {
        if (chrome.runtime.error) {
          console.log("Runtime error.");
        }
        chrome.runtime.sendMessage({msg: "ok"})
      });
    };
    console.log(coordClick)
  };


setTimeout(() => {
    const coord = document.querySelector("ng-map").getAttribute("center")
    const map = document.querySelector(".map-container");
    const title = document.querySelectorAll(".md-headline")[2];
    const searchTerm = encodeURIComponent(title.innerText);
    const list = document.querySelectorAll('[ng-if="vm.listing.duplicate_listings.length"]')[0];
    const dupes = (list === undefined) ? 0 : list.getElementsByTagName('A');


    for(let i = 0; i < dupes.length; i++) {
        if(dupes != 0){
            map.insertAdjacentHTML("beforebegin", `
<a class="md-no-style md-button md-ink-ripple" style="${style} font-size: 12px" href=${dupes[i].innerText} target="_blank">${dupes[i].innerText}</a>

`);
        }

}
    map.insertAdjacentHTML("beforebegin", `

<hr>

<a class="md-no-style md-button md-ink-ripple" style="${style}" href=${google}${coord} target="_blank">Google</a><br>
<a class="md-no-style md-button md-ink-ripple" style="${style}" href="${bing}${coord}&style=h&lvl=18" target="_blank">Bing</a>
<a class="md-no-style md-button md-ink-ripple hscan" style="${style}">Home Scanner</a>
`);

   title.insertAdjacentHTML("beforeend", `

<a class="md-icon-button md-button md-ink-ripple" target="_blank" href='http://googl.com/#q="${searchTerm}"'>
<md-icon md-font-icon="fa fa-search" class="ng-scope md-font FontAwesome fa fa-search" role="img" aria-label="fa fa-search"></md-icon>

`);
console.log('Hello')

document.querySelector(".hscan").onclick = function() {
    chrome.storage.local.set({ data: coord }, function() {
      if (chrome.runtime.error) {
        console.log("Runtime error.");
      }
      chrome.runtime.sendMessage({msg: "ok"})
    });
  };
}, 1500);


